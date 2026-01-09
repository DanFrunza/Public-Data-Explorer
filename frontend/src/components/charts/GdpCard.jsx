import React, { useEffect, useMemo, useState } from 'react';

// Use same-origin by default (via dev proxy); override with VITE_API_BASE when needed
const API_BASE = import.meta.env.VITE_API_BASE || '';

function numberFormat(value) {
  if (value == null) return '';
  const abs = Math.abs(value);
  if (abs >= 1e12) return (value / 1e12).toFixed(2) + 'T';
  if (abs >= 1e9) return (value / 1e9).toFixed(2) + 'B';
  if (abs >= 1e6) return (value / 1e6).toFixed(2) + 'M';
  return value.toLocaleString();
}

function percentFormat(value) {
  if (value == null || Number.isNaN(value)) return '';
  return `${value.toFixed(2)}%`;
}

function useCountries() {
  const [data, setData] = useState({ countries: [], loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    async function run() {
      try {
        const res = await fetch(`${API_BASE}/api/catalog/countries`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!cancelled) setData({ countries: json.countries || [], loading: false, error: null });
      } catch (e) {
        if (!cancelled) setData({ countries: [], loading: false, error: e.message || 'Error' });
      }
    }
    run();
    return () => { cancelled = true; };
  }, []);

  const groups = useMemo(() => {
    const aggregates = [];
    const sovereigns = [];
    for (const c of data.countries) {
      if ((c.income_level || '') === 'Aggregates') aggregates.push(c);
      else sovereigns.push(c);
    }
    return { aggregates, sovereigns };
  }, [data.countries]);

  return { ...data, groups };
}

function LineChart({ series, width = 640, height = 300, valueFormatter = numberFormat }) {
  const margin = { top: 16, right: 24, bottom: 30, left: 48 };
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  const points = (series || []).filter(d => d.value != null).map(d => ({
    x: d.year,
    y: Number(d.value)
  }));

  if (points.length === 0) {
    return (
      <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="No data">
        <text x={width/2} y={height/2} textAnchor="middle" fill="#aaa">No data</text>
      </svg>
    );
  }

  const minX = Math.min(...points.map(p => p.x));
  const maxX = Math.max(...points.map(p => p.x));
  const maxY = Math.max(...points.map(p => p.y));
  const minY = Math.min(0, ...points.map(p => p.y));
  const xScale = (x) => margin.left + ((x - minX) / (maxX - minX || 1)) * innerW;
  const yScale = (y) => margin.top + innerH - (((y - minY) / ((maxY - minY) || 1)) * innerH);

  let d = '';
  points.sort((a, b) => a.x - b.x).forEach((p, i) => {
    const X = xScale(p.x);
    const Y = yScale(p.y);
    d += i === 0 ? `M ${X} ${Y}` : ` L ${X} ${Y}`;
  });

  const yTicks = 4;
  const grid = Array.from({ length: yTicks + 1 }, (_, i) => minY + (i / yTicks) * (maxY - minY));
  const xTicks = [minX, Math.round(minX + (maxX - minX) / 2), maxX];

  const [hover, setHover] = useState(null); // {x,y,year,value}

  const onMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const scaleX = width / rect.width;
    const viewX = (e.clientX - rect.left) * scaleX; // viewBox coords
    const ratio = Math.max(0, Math.min(1, (viewX - margin.left) / innerW));
    const estYear = Math.round(minX + ratio * (maxX - minX));
    // find nearest point by year
    let nearest = null;
    let best = Infinity;
    for (const p of points) {
      const dYear = Math.abs(p.x - estYear);
      if (dYear < best) { best = dYear; nearest = p; }
    }
    if (!nearest) return setHover(null);
    setHover({ x: xScale(nearest.x), y: yScale(nearest.y), year: nearest.x, value: nearest.y });
  };

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} role="img">
      {/* axes */}
      <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#555"/>
      <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#555"/>
      {/* grid + y labels */}
      {grid.map((gy, i) => {
        const Y = yScale(gy);
        return (
          <g key={`g-${i}`}>
            <line x1={margin.left} y1={Y} x2={width - margin.right} y2={Y} stroke="#333" opacity="0.4"/>
            <text x={margin.left - 8} y={Y} textAnchor="end" dominantBaseline="middle" fill="#aaa" fontSize="11">{valueFormatter(gy)}</text>
          </g>
        );
      })}
      {/* x labels */}
      {xTicks.map((tx, i) => (
        <text key={`x-${i}`} x={xScale(tx)} y={height - margin.bottom + 18} textAnchor="middle" fill="#aaa" fontSize="11">{tx}</text>
      ))}
      {/* line */}
      <path d={d} fill="none" stroke="var(--color-accent)" strokeWidth="2.5" />
      {/* hover marker + tooltip */}
      {hover && (
        <g>
          <line x1={hover.x} y1={margin.top} x2={hover.x} y2={height - margin.bottom} stroke="#666" opacity="0.6" />
          <circle cx={hover.x} cy={hover.y} r={4} fill="var(--color-accent)" stroke="#000" />
          {/* tooltip bubble */}
          {(() => {
            const tipW = 160, tipH = 42;
            const tx = Math.min(width - margin.right - tipW, Math.max(margin.left, hover.x + 8));
            const ty = Math.max(margin.top, hover.y - tipH - 8);
            return (
              <g>
                <rect x={tx} y={ty} width={tipW} height={tipH} rx={8} ry={8} fill="#1f1f1f" opacity="0.9" stroke="#333" />
                <text x={tx + 10} y={ty + 18} fill="#fff" fontSize="12">Year: {hover.year}</text>
                <text x={tx + 10} y={ty + 34} fill="#fff" fontSize="12">Value: {valueFormatter(hover.value)}</text>
              </g>
            );
          })()}
        </g>
      )}
      {/* pointer overlay */}
      <rect x={margin.left} y={margin.top} width={innerW} height={innerH} fill="transparent"
            onMouseMove={onMove} onMouseLeave={() => setHover(null)} />
    </svg>
  );
}

export default function GdpCard() {
  const { countries, loading, error, groups } = useCountries();
  const defaultCode = useMemo(() => {
    const ro = countries.find(c => c.iso3 === 'ROU');
    return ro?.iso3 || countries[0]?.iso3 || '';
  }, [countries]);
  const [code, setCode] = useState('');
  const [series, setSeries] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [viz, setViz] = useState('current'); // current | yoy

  useEffect(() => {
    if (defaultCode && !code) setCode(defaultCode);
  }, [defaultCode, code]);

  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    async function load() {
      setFetching(true);
      try {
        const variant = 'current'; // only nominal supported; YoY computed client-side
        const res = await fetch(`${API_BASE}/api/charts/wb/gdp?countries=${encodeURIComponent(code)}&from=1990&variant=${encodeURIComponent(variant)}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        let s = json.series?.[code] || [];
        if (viz === 'yoy') {
          const sorted = [...s].filter(d => d.value != null).sort((a,b) => a.year - b.year);
          const transformed = [];
          for (let i = 1; i < sorted.length; i++) {
            const prev = Number(sorted[i-1].value);
            const cur = Number(sorted[i].value);
            if (!Number.isFinite(prev) || prev === 0 || !Number.isFinite(cur)) continue;
            transformed.push({ year: sorted[i].year, value: ((cur / prev) - 1) * 100 });
          }
          s = transformed;
        }
        if (!cancelled) setSeries(s);
      } catch (e) {
        if (!cancelled) setSeries([]);
      } finally {
        if (!cancelled) setFetching(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [code, viz]);

  const selected = useMemo(() => countries.find(c => c.iso3 === code), [countries, code]);

  return (
    <div className="chart-card-inner">
      <h2 className="chart-title">GDP (World Bank)</h2>
      <div className="chart-controls">
        <label htmlFor="gdp-country" className="chart-label">Country/Region:</label>
        <select
          id="gdp-country"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="chart-select"
        >
          <optgroup label="Countries">
            {groups.sovereigns.map(c => (
              <option key={c.iso3} value={c.iso3}>{c.name} ({c.iso3})</option>
            ))}
          </optgroup>
          <optgroup label="Aggregates & Regions">
            {groups.aggregates.map(c => (
              <option key={c.iso3} value={c.iso3}>{c.name} ({c.iso3})</option>
            ))}
          </optgroup>
        </select>
        <label htmlFor="gdp-viz" className="chart-label">Visualization:</label>
        <select
          id="gdp-viz"
          value={viz}
          onChange={(e) => setViz(e.target.value)}
          className="chart-select"
        >
          <option value="current">Nominal (current USD)</option>
          <option value="yoy">Growth YoY (%)</option>
        </select>
      </div>
      <div className="chart-area">
        {loading ? (
          <div className="chart-status">Loading countries…</div>
        ) : error ? (
          <div className="chart-status error">Failed to load countries</div>
        ) : (
          <>
            <LineChart series={series} valueFormatter={viz === 'yoy' ? percentFormat : numberFormat} />
            <div className="chart-legend">
              <span className="legend-dot" />
              <span className="legend-text">{selected?.name || code} • {viz === 'current' ? 'current USD' : 'YoY %'}</span>
            </div>
          </>
        )}
        {fetching && <div className="chart-status subtle">Loading GDP series…</div>}
      </div>
    </div>
  );
}
