import React, { useEffect, useMemo, useRef, useState, forwardRef } from 'react';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import '../../css/GdpCard.css';

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

const LineChart = forwardRef(function LineChart({ series, width = 640, height = 300, valueFormatter = numberFormat }, svgRef) {
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
    <svg ref={svgRef} width="100%" viewBox={`0 0 ${width} ${height}`} role="img" data-export-width={width} data-export-height={height}>
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
});

// --- Export helpers ---
function serializeSvg(svgEl) {
  const clone = svgEl.cloneNode(true);
  // Ensure inline styles are preserved; set xmlns for standalone SVG
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  // Resolve CSS variables (e.g., --color-accent) to concrete values so strokes/fills appear in exports
  try {
    const rootStyles = getComputedStyle(document.documentElement);
    const svgStyles = getComputedStyle(svgEl);
    const accentRaw = svgStyles.getPropertyValue('--color-accent') || rootStyles.getPropertyValue('--color-accent') || '#4ea1f0';
    const accent = String(accentRaw).trim() || '#4ea1f0';
    // Set CSS var directly on the cloned svg element
    clone.style.setProperty('--color-accent', accent);
    // Also rewrite any stroke/fill attributes that reference CSS variables to concrete color
    const rewriteColorAttr = (el) => {
      const stroke = el.getAttribute('stroke');
      if (stroke && stroke.includes('var(')) {
        el.setAttribute('stroke', accent);
      }
      const fill = el.getAttribute('fill');
      if (fill && fill.includes('var(')) {
        el.setAttribute('fill', accent);
      }
    };
    clone.querySelectorAll('*').forEach(rewriteColorAttr);
  } catch { /* no-op */ }
  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

async function exportSVG(svgEl, filename = 'chart.svg') {
  const svgText = serializeSvg(svgEl);
  const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function exportPNG(svgEl, filename = 'chart.png', background = 'transparent', scale = 1, quality = 0.92) {
  const width = Number(svgEl.getAttribute('data-export-width')) || 640;
  const height = Number(svgEl.getAttribute('data-export-height')) || 300;
  const svgText = serializeSvg(svgEl);
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = 'async';
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const alpha = background === 'transparent';
    const ctx = canvas.getContext('2d', { alpha });
    // Optional background fill
    if (background && background !== 'transparent') {
      const root = getComputedStyle(document.documentElement);
      let bgColor = '#000000';
      if (background === 'surface') {
        bgColor = (root.getPropertyValue('--color-surface') || '#151A2E').trim();
      } else if (background === 'bg') {
        bgColor = (root.getPropertyValue('--color-bg') || '#0D1220').trim();
      } else if (/^#|rgb\(/.test(background)) {
        bgColor = background; // direct color string if provided
      }
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    // Await image load
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = svgUrl;
    });
    // Draw scaled for crisp output
    ctx.scale(Math.max(1, scale), Math.max(1, scale));
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/png', quality);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

async function exportJPEG(svgEl, filename = 'chart.jpg', background = 'surface', scale = 1, quality = 0.92) {
  // JPEG does not support transparency; use surface fill by default
  return exportPNG(svgEl, filename, background, scale, quality);
}

async function exportWebP(svgEl, filename = 'chart.webp', background = 'transparent', scale = 1, quality = 0.92) {
  const width = Number(svgEl.getAttribute('data-export-width')) || 640;
  const height = Number(svgEl.getAttribute('data-export-height')) || 300;
  const svgText = serializeSvg(svgEl);
  const svgBlob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  const svgUrl = URL.createObjectURL(svgBlob);
  try {
    const img = new Image();
    img.decoding = 'async';
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const alpha = background === 'transparent';
    const ctx = canvas.getContext('2d', { alpha });
    if (background && background !== 'transparent') {
      const root = getComputedStyle(document.documentElement);
      let bgColor = (root.getPropertyValue('--color-surface') || '#151A2E').trim();
      if (background === 'bg') {
        bgColor = (root.getPropertyValue('--color-bg') || '#0D1220').trim();
      } else if (/^#|rgb\(/.test(background)) {
        bgColor = background;
      }
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = svgUrl;
    });
    ctx.scale(Math.max(1, scale), Math.max(1, scale));
    ctx.drawImage(img, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/webp', quality);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}


function exportJSON(series, meta, filename = 'chart.json') {
  const payload = { meta, series };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}


function exportCSV(series, filename = 'chart.csv') {
  const rows = [['year', 'value']].concat((series || []).map(d => [d.year, d.value]));
  const csv = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function GdpCard() {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const { countries, loading, error, groups } = useCountries();
  const defaultCode = useMemo(() => {
    const ro = countries.find(c => c.iso3 === 'ROU');
    return ro?.iso3 || countries[0]?.iso3 || '';
  }, [countries]);
  const [code, setCode] = useState('');
  const [series, setSeries] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [viz, setViz] = useState('current'); // current | yoy
  const [exportFmt, setExportFmt] = useState(''); // '', 'png', 'svg', 'csv', 'jpeg', 'webp', 'json', 'xlsx'
  const [exportPngBg, setExportPngBg] = useState('transparent'); // 'transparent' | 'surface' | 'bg'
  const [exportScale, setExportScale] = useState(1); // 1 | 2 | 3

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

  const svgRef = useRef(null);

  const handleExport = () => {
    if (!exportFmt) return;
    const meta = {
      country: selected?.name || code,
      code,
      viz,
      units: viz === 'current' ? 'current USD' : 'YoY %',
      source: 'World Bank GDP',
      from: series?.[0]?.year,
      to: series?.[series.length - 1]?.year,
    };
    if (exportFmt === 'png') {
      if (!svgRef.current) return;
      exportPNG(svgRef.current, `gdp_${code}_${viz}.png`, exportPngBg, exportScale);
    } else if (exportFmt === 'svg') {
      if (!svgRef.current) return;
      exportSVG(svgRef.current, `gdp_${code}_${viz}.svg`);
    } else if (exportFmt === 'csv') {
      exportCSV(series, `gdp_${code}_${viz}.csv`);
    } else if (exportFmt === 'jpeg') {
      if (!svgRef.current) return;
      exportJPEG(svgRef.current, `gdp_${code}_${viz}.jpg`, 'surface', exportScale);
    } else if (exportFmt === 'webp') {
      if (!svgRef.current) return;
      exportWebP(svgRef.current, `gdp_${code}_${viz}.webp`, exportPngBg, exportScale);
    } else if (exportFmt === 'json') {
      exportJSON(series, meta, `gdp_${code}_${viz}.json`);
    } else if (exportFmt === 'xlsx') {
    }
  };


  return (
    <div className="chart-card-inner gdp-modern-card">
      <div className="gdp-header">
        <div className="gdp-badge">🌍 GDP Data</div>
        <h2 className="gdp-title text-gradient">GDP (World Bank)</h2>
        <div className="gdp-about">
          <span className="gdp-about-title">About:</span> Gross Domestic Product (GDP) data from the World Bank, 1990–present. Values are in current USD. Growth is calculated as year-over-year percent change. Data may be revised by the source.
        </div>
      </div>
      <div className="gdp-controls">
        <label htmlFor="gdp-country" className="gdp-label">Country/Region:</label>
        <select
          id="gdp-country"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="gdp-select"
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
        <label htmlFor="gdp-viz" className="gdp-label">Visualization:</label>
        <select
          id="gdp-viz"
          value={viz}
          onChange={(e) => setViz(e.target.value)}
          className="gdp-select"
        >
          <option value="current">Nominal (current USD)</option>
          <option value="yoy">Growth YoY (%)</option>
        </select>
        {isAuthenticated && (
          <div className="gdp-export">
            <label htmlFor="export-format" className="gdp-label">Export:</label>
            <select
              id="export-format"
              value={exportFmt}
              onChange={(e) => setExportFmt(e.target.value)}
              className="gdp-select"
            >
              <option value="">Select format</option>
              <option value="png">PNG</option>
              <option value="svg">SVG</option>
              <option value="csv">CSV</option>
              <option value="jpeg">JPEG</option>
              <option value="webp">WebP</option>
              <option value="json">JSON</option>
            </select>
            {exportFmt === 'png' && (
              <>
                <label htmlFor="png-bg" className="gdp-label">Background:</label>
                <select
                  id="png-bg"
                  value={exportPngBg}
                  onChange={(e) => setExportPngBg(e.target.value)}
                  className="gdp-select"
                >
                  <option value="transparent">Transparent</option>
                  <option value="surface">Card Surface</option>
                  <option value="bg">Page Background</option>
                </select>
              </>
            )}
            {(exportFmt === 'png' || exportFmt === 'jpeg' || exportFmt === 'webp') && (
              <>
                <label htmlFor="scale" className="gdp-label">Scale:</label>
                <select
                  id="scale"
                  value={exportScale}
                  onChange={(e) => setExportScale(Number(e.target.value))}
                  className="gdp-select"
                >
                  <option value={1}>1x</option>
                  <option value={2}>2x</option>
                  <option value={3}>3x</option>
                </select>
              </>
            )}
            <button
              className="gdp-button"
              type="button"
              disabled={!exportFmt || (!svgRef.current && (exportFmt === 'png' || exportFmt === 'svg' || exportFmt === 'jpeg' || exportFmt === 'webp'))}
              onClick={handleExport}
            >
              Export
            </button>
          </div>
        )}
      </div>
      <div className="gdp-chart-area">
        {loading ? (
          <div className="gdp-status">Loading countries…</div>
        ) : error ? (
          <div className="gdp-status gdp-error">Failed to load countries</div>
        ) : (
          <>
            <LineChart ref={svgRef} series={series} valueFormatter={viz === 'yoy' ? percentFormat : numberFormat} />
            <div className="gdp-legend">
              <span className="gdp-legend-dot" />
              <span className="gdp-legend-text">{selected?.name || code} • {viz === 'current' ? 'current USD' : 'YoY %'}</span>
            </div>
          </>
        )}
        {fetching && <div className="gdp-status gdp-subtle">Loading GDP series…</div>}
      </div>
      <div className="gdp-source">Source: World Bank Open Data (data.worldbank.org)</div>
    </div>
  );
}
