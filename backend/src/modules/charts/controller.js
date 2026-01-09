const pool = require('../../db/pool');

const INDICATORS = {
  current: 'NY.GDP.MKTP.CD',
  constant: 'NY.GDP.MKTP.KD',
  pcap: 'NY.GDP.PCAP.CD',
};

function parseCountriesParam(value) {
  if (!value || value.toLowerCase() === 'all') return 'all';
  const list = value.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  // keep ISO3 form only
  return Array.from(new Set(list));
}

async function gdpSeries(req, res) {
  try {
    const variant = (req.query.variant || 'current').toLowerCase();
    const indicator = INDICATORS[variant];
    if (!indicator) return res.status(400).json({ message: 'Invalid variant. Use current|constant|pcap' });

    const from = parseInt(req.query.from ?? '1990', 10);
    const to = parseInt(req.query.to ?? new Date().getFullYear().toString(), 10);
    if (isNaN(from) || isNaN(to) || from > to) return res.status(400).json({ message: 'Invalid from/to' });

    const countriesParam = parseCountriesParam(req.query.countries || 'all');

    let rows;
    if (countriesParam === 'all') {
      const sql = `
        SELECT iso3, year, value
        FROM wb_indicator_annual
        WHERE indicator_code = $1 AND year BETWEEN $2 AND $3
        ORDER BY iso3, year
      `;
      const r = await pool.query(sql, [indicator, from, to]);
      rows = r.rows;
    } else if (countriesParam.length === 0) {
      return res.json({ indicator_code: indicator, series: {}, meta: { variant, from, to } });
    } else {
      const placeholders = countriesParam.map((_, i) => `$${i + 4}`).join(',');
      const sql = `
        SELECT iso3, year, value
        FROM wb_indicator_annual
        WHERE indicator_code = $1 AND year BETWEEN $2 AND $3 AND iso3 IN (${placeholders})
        ORDER BY iso3, year
      `;
      const params = [indicator, from, to, ...countriesParam];
      const r = await pool.query(sql, params);
      rows = r.rows;
    }

    const series = {};
    for (const r of rows) {
      if (!series[r.iso3]) series[r.iso3] = [];
      series[r.iso3].push({ year: r.year, value: r.value });
    }
    return res.json({ indicator_code: indicator, series, meta: { variant, from, to } });
  } catch (err) {
    console.error('gdpSeries error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { gdpSeries };
