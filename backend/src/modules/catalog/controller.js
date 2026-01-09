const pool = require('../../db/pool');

async function listCountries(req, res) {
  try {
    const { rows } = await pool.query(
      'SELECT iso3, name, region, income_level, iso2 FROM wb_countries ORDER BY name ASC'
    );
    res.json({ countries: rows });
  } catch (err) {
    console.error('listCountries error:', err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = { listCountries };
