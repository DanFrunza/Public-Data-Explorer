# Public Data Explorer

A full‑stack platform for exploring public datasets with modern, production‑style patterns. The project is actively developed and fully runnable locally.

**Highlights**
- **Interactive charts:** Clean SVG/D3‑style visualizations (GDP card with hover tooltips).
- **Secure auth:** JWT access + httpOnly refresh rotation with reuse detection and rate limiting.
- **Profiles & avatars:** Safe profile endpoints and MinIO‑backed avatar uploads.
- **Exports:** PNG, SVG, CSV, JPEG, WebP, and JSON with scale/background options.
- **Pipeline:** Python APScheduler service to ingest World Bank GDP into a curated schema.

**Architecture**
- **Frontend:** React (Vite), React Router, Redux Toolkit, D3, CSS variables.
- **Backend:** Node.js (Express), PostgreSQL, MinIO (S3‑compatible), hardened middleware.
- **Data‑Pipeline:** Python service (APScheduler, requests, psycopg2) for scheduled ingestion.
- **Infra:** Docker Compose for local orchestration.

**Repository Layout**
- [frontend/](frontend/) — React app (Vite).
- [backend/](backend/) — Express API (code in [backend/src](backend/src), SQL in [backend/migrations](backend/migrations), runner in [backend/scripts/migrate.js](backend/scripts/migrate.js)).
- [data-pipeline/](data-pipeline/) — Python ingestion service.
- [docker-compose.yml](docker-compose.yml) — Local services (Postgres, MinIO, Backend, Pipeline).

**Key Endpoints**
- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/refresh`, `POST /api/auth/logout`, `GET /api/auth/me`.
- Profile: `GET /api/users/me`, `PUT /api/users/me`, `POST /api/users/me/avatar`.
- Catalog: `GET /api/catalog/countries`.
- Charts: `GET /api/charts/wb/gdp?countries=ISO3&from=YYYY&variant=current`.
- Health: `GET /health`.

**Security Posture**
- **Passwords:** Argon2id.
- **Tokens:** Short‑lived access JWT; refresh cookie (`httpOnly`, `SameSite=Lax`) with rotation/reuse detection.
- **Input validation:** Server‑side normalization; safe field allowlists.
- **Uploads:** MIME allowlist and signature checks (JPEG/PNG/WEBP); presigned URLs for read‑only access.
- **Queries:** Parameterized SQL; `helmet`, size limits, and per‑route rate limiting.
- **CORS:** Credentialed, env‑driven allowlist.

**Local Setup**
From the repo root:

1) Start Postgres + backend
```
docker compose up -d postgres backend
```
2) Frontend
```
cd frontend
npm install
npm run dev
```
Configuration (create `.env` files as needed):
- Frontend: set values like `VITE_BASE`, `VITE_API_BASE` (optional, empty → same‑origin), `VITE_PROXY_TARGET` (dev proxy target, default `http://localhost:4000`). See [frontend/vite.config.js](frontend/vite.config.js).
- Backend: typical vars include `PORT`, `DB_HOST`, `DB_USER`, `DB_PASS`, `DB_NAME`, `CORS_ALLOWED_ORIGINS`, MinIO settings, and JWT secrets/TTLs.

**Migrations**
- SQL files: [backend/migrations](backend/migrations)
- Runner: [backend/scripts/migrate.js](backend/scripts/migrate.js)

Run from repo root:
```
docker compose exec backend npm run migrate
```

Schema highlights:
- `users` (unique email, password hash, profile fields).
- `refresh_tokens` (rotation allowlist with metadata).
- `users.avatar_key` + metadata, and `updated_at` trigger.
- World Bank: `wb_countries`, `wb_indicator_annual` (indexes for chart queries). See [backend/migrations/0010_wb_schema.sql](backend/migrations/0010_wb_schema.sql).

**Frontend Features**
- Dashboard GDP card with country/region selection, legend, hover tooltip, and visualization selector (Nominal USD, YoY%). See [frontend/src/components/charts/GdpCard.jsx](frontend/src/components/charts/GdpCard.jsx).
- Export formats: PNG, SVG, CSV, JPEG, WebP, JSON.
- Unified dark theme via CSS variables.

**Deployment (GitHub Pages)**
- Configure base path in [frontend/.env](frontend/.env) via `VITE_BASE` (e.g., `/Public-Data-Explorer/`).
- Build and publish:
```
cd frontend
npm run deploy
```
- The deploy script builds and publishes `dist/` to the `gh-pages` branch.

**Development Workflow**
- Edit under [frontend/src](frontend/src) and [backend/src](backend/src).
- Rebuild backend when needed:
```
docker compose up -d --build backend
```
- Quick API check:
```
curl -sS http://localhost:4000/health
```

**Author**
- Dan Frunza — Master’s student in Software Engineering (UAIC). Background in Mathematics and CS. Focused on full‑stack development, data visualization, and scalable systems.
- Contact: dani.frunza@yahoo.com • GitHub: https://github.com/DanFrunza • LinkedIn: https://www.linkedin.com/in/dan-frunza-135695284/

**Roadmap**
- Expand datasets/indicators and interactive dashboards.
- Batch processing with PySpark; curated Parquet flows via MinIO.
- CI/CD improvements and test coverage.

Pull requests and issues are welcome while the project is in active development. Secrets should never be committed; configure environments locally.
