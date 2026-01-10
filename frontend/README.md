# Frontend (React + Vite)

This is the React application for Public Data Explorer. It renders the dashboard, charts, and account pages. Uses Vite for fast dev, React Router for navigation, and Redux Toolkit for auth/session state.

## Quickstart

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The dev server proxies `/api` to the backend by default.

## Environment Variables

- `VITE_API_BASE` (optional): Explicit API base. Leave empty to use same-origin `/api` with dev proxy.
- `VITE_PROXY_TARGET` (optional): Backend target for dev proxy (defaults to `http://localhost:4000`).

Copy `.env.example` to `.env` if customizing.

## Dashboard: GDP Card

Interactive line chart with country/region selector and visualization switcher (Nominal USD, YoY%).

### Export Options
- Formats: PNG, SVG, CSV, JPEG, WebP, JSON.
- PNG/WebP: background (transparent/surface/bg) and scale (1x/2x/3x).
- Notes:
	- Clipboard Copy feature was removed.
	- XLSX export was removed due to security advisories. Use CSV/JSON for spreadsheets.

## Styling
Unified dark theme via CSS variables in `src/index.css`. Component styles in `src/css/`.

## Linting
```bash
npm run lint
```

## Build
```bash
npm run build
```

Outputs production assets under `dist/`.
