# Public Data Explorer

An educational, full‑stack platform for exploring and visualizing large public datasets. Built to mirror real‑world production patterns while remaining fully runnable locally. The project is actively in development.

## Overview
- **Goal:** Make complex public data easier to explore through clean, interactive visualizations and a structured API.
- **Status:** In development; features and datasets are added iteratively.
- **Audience:** Recruiters, collaborators, and learners interested in modern web/data engineering.

## Features
- **Interactive visualizations:** SVG/D3‑style dashboards and charts.
- **User accounts:** Secure register/login with validations and rate limiting.
- **Production‑grade auth:** JWT access token + httpOnly refresh cookie with rotation & reuse detection.
- **Persistent sessions:** Automatic refresh on page reload and 401 with Redux integration.
- **Profile:** `GET /api/users/me` with safe fields; global Edit mode with form across cards.
- **Profile edit:** `PUT /api/users/me` updates whitelisted fields with server‑side normalization.
- **Avatar uploads:** `POST /api/users/me/avatar` with MIME allowlist, signature checks, and presigned URL display.
- **Unified theme:** Professional dark palette via CSS variables; consistent UI across pages.
- **Developer UX:** Clear error messages (401/403/400 hints) surfaced in Profile for uploads.
- **Data pipeline:** Python‑based service with scheduler (APScheduler) for World Bank GDP ingestion; S3‑compatible object storage via MinIO for future datasets.

## Tech Stack
- **Frontend:** React (Vite), JavaScript, React Router, Redux Toolkit, D3.js, CSS.
- **Backend:** Node.js, Express, PostgreSQL.
- **Data Processing:** Python (APScheduler, requests, psycopg2), PySpark (planned), Parquet (planned), MinIO (S3‑compatible).
- **Infrastructure:** Docker, Docker Compose, environment variables.

## Repository Structure
- [frontend/](frontend/) – React app (Vite), components, routes, styles.
- [backend/](backend/) – Express API (`src/` for code, `migrations/` for SQL, `scripts/` for migration runner).
- [data-pipeline/](data-pipeline/) – Python pipeline (requirements, future notebooks/scripts).
- [docker-compose.yml](docker-compose.yml) – Local dev orchestration (Postgres, MinIO, Backend, Pipeline).

## Local Quickstart
Note: Run commands from the repository root unless noted.

1) Start services (Postgres + backend):
```bash
docker compose up -d postgres backend
```
2) Configure frontend env (optional):
	 - Copy [frontend/.env.example](frontend/.env.example) to `.env`. By default, the frontend uses same-origin `/api` with a dev proxy.
	 - Optionally set `VITE_API_BASE` (leave blank to use same-origin).
	 - Optionally set `VITE_PROXY_TARGET` (defaults to `http://localhost:4000`).
3) Run frontend:
```bash
cd frontend
npm install
npm run dev
```

4) (Optional) Start the data pipeline and run the GDP job once:
```bash
docker compose up -d pipeline
# To run all jobs immediately on container start (one‑off/backfill), set in data-pipeline/.env:
# RUN_JOBS_ON_START=true
```

## Backend Service
- Entry point: [backend/src/server.js](backend/src/server.js)
- Auth module: [backend/src/modules/auth/routes.js](backend/src/modules/auth/routes.js)
- Controllers: [backend/src/modules/auth/controller.js](backend/src/modules/auth/controller.js)
- Services: [backend/src/modules/auth/service.js](backend/src/modules/auth/service.js)
- Security middleware: [backend/src/middleware/security.js](backend/src/middleware/security.js)
- Security middleware: [backend/src/middleware/security.js](backend/src/middleware/security.js)
- Rate limiting: [backend/src/middleware/rateLimiter.js](backend/src/middleware/rateLimiter.js)
 - Catalog module: [backend/src/modules/catalog/routes.js](backend/src/modules/catalog/routes.js)
 - Charts module: [backend/src/modules/charts/routes.js](backend/src/modules/charts/routes.js)

### Implemented API Endpoints
- `POST /api/auth/register` – Validates input, hashes passwords (Argon2id), issues access token + refresh cookie.
- `POST /api/auth/login` – Verifies credentials, issues access token + refresh cookie.
- `POST /api/auth/refresh` – Rotates refresh token, returns new access token (+ user data).
- `POST /api/auth/logout` – Revokes refresh token and clears cookie.
- `GET /api/auth/me` – Returns current user (requires `Authorization: Bearer`).
- `GET /api/users/me` – Returns safe profile fields; includes `avatar_url` when available.
- `PUT /api/users/me` – Updates whitelisted profile fields.
- `POST /api/users/me/avatar` – Uploads avatar (multipart), stores in MinIO, returns presigned URL.
- `GET /health` – Health check.
 - `GET /api/catalog/countries` – Countries/aggregates catalog (World Bank), for dropdowns.
 - `GET /api/charts/wb/gdp` – GDP series for one/more ISO3 codes; supports `variant=current`, `from`, `to`.

### Security Posture
- **Passwords:** Argon2id with strong parameters.
- **Tokens:** Short‑lived access JWT; refresh cookie (`httpOnly`, `SameSite=Lax`, rotation & reuse detection).
- **Validation:** Email/password/name/country checks server‑side and client‑side; profile edit normalizes and validates fields.
- **File uploads:** Frontend size/type checks; backend MIME allowlist + signature verification (JPEG/PNG/WEBP);
	MinIO presigned URLs for read‑only access; objects cannot execute code.
- **Queries:** Parameterized SQL to avoid injection.
- **Abuse controls:** Per‑route rate limiting (`register`, `login`, `avatar upload`).
- **Headers:** `helmet` configured; body size limited.
- **CORS:** Credentialed; env‑driven allowlist via `CORS_ALLOWED_ORIGINS`.
- **Config:** Environment variables (no secrets in repo).

Recommended next steps:
- Restrict CORS to known frontend origin (env‑driven allowlist).
- Add stricter field validation (lengths/formats) and optional server‑side image re‑encoding.
- Implement account verification and password reset flows.
- Add structured logging (e.g., `pino`) and security event audit.
- Enforce HTTPS in production, secret management via vault.

## Database & Migrations
- RDBMS: PostgreSQL (via Docker service `postgres`).
- Migrations: raw SQL files under [backend/migrations/](backend/migrations/); runner in [backend/scripts/migrate.js](backend/scripts/migrate.js).

Run migrations (from repo root):
```bash
docker compose exec backend npm run migrate
```

Schema highlights:
- `users` with email unique, password_hash, first_name, last_name, country, and profile fields.
- `refresh_tokens` for allowlisting, rotation, and revocation (jti, hash, expires_at, ip, user_agent, rotated_at, revoked_at).
- `users.avatar_key` + avatar metadata (for MinIO objects); `updated_at` auto‑updated via trigger.
 - World Bank tables: `wb_countries`, `wb_indicator_annual` with indexes for chart queries. See [backend/migrations/0010_wb_schema.sql](backend/migrations/0010_wb_schema.sql).

## Frontend
- `.env` variables:
	- `VITE_API_BASE` (optional): Explicit API base. Leave empty to use same-origin and rely on the dev proxy during development.
	- `VITE_PROXY_TARGET` (optional): Vite dev server proxy target for `/api` (default `http://localhost:4000`).
- Register: validates inputs, calls `/api/auth/register`, stores token+user, sets defaults for `timezone`/`locale`, redirects to Dashboard.
- Login: validates inputs, calls `/api/auth/login`, stores token+user, redirects to Dashboard.
- Profile: `GET /api/users/me` and global Edit mode with form; client‑side preview for avatar.
- Session persistence: `AuthBootstrap` refreshes token on load; `apiClient` auto‑refreshes on 401 and preserves `FormData` headers on retry.
- Navbar: avatar image + greeting (first name); dropdown actions.
- Theme: CSS variables in `index.css` for unified dark palette.
 - Dashboard: GDP card (World Bank) with country/region dropdown, legend, hover tooltip, and visualization selector (Nominal USD, YoY%). Styles consolidated in [frontend/src/css/Dashboard.css](frontend/src/css/Dashboard.css).

## Environment Configuration
- **Frontend:** [frontend/.env.example](frontend/.env.example) → create `frontend/.env` as needed. You can leave `VITE_API_BASE` empty and rely on the dev proxy; set `VITE_PROXY_TARGET` to point to your backend during development.
- **Backend:** [backend/.env.example](backend/.env.example) → create `backend/.env` with DB settings; included by Docker.
 - **Pipeline:** [data-pipeline/.env.example](data-pipeline/.env.example) → create `data-pipeline/.env` for optional overrides (e.g., `WB_BASE`, `WB_END_YEAR`, `RUN_JOBS_ON_START`).

## Docker Compose (Services)
- **postgres:** `postgres:15`, exposed on host `5433`.
- **minio:** S3‑compatible object storage (dev), console on `9001`.
- **backend:** Node 18 image built from [backend/Dockerfile](backend/Dockerfile), exposed on `4000`.
- **pipeline:** Python ingestion service with APScheduler; depends on `postgres` + `minio`.

Bring up core services (from repo root):
```bash
docker compose up -d postgres backend
```

## Development Workflow
- Edit code under `frontend/src` or `backend/src`.
- Rebuild backend on dependency or server changes:
```bash
docker compose up -d --build backend
```
- Test API quickly:
```bash
curl -sS http://localhost:4000/health
```

## Author
Dan Frunza — Master’s student in Software Engineering (Alexandru Ioan Cuza University of Iași), with a Bachelor’s in Mathematics and Computer Science. Actively learning full‑stack development, data visualization, and scalable system design.

Highlights:
- Certifications (freeCodeCamp): Responsive Web Design; JavaScript Algorithms and Data Structures; Front End Development Libraries; Data Visualization (D3.js).
- Contact: dani.frunza@yahoo.com • GitHub: https://github.com/DanFrunza • LinkedIn: https://www.linkedin.com/in/dan-frunza-135695284/

## Roadmap
- Expand datasets and visualizations (more indicators, interactive dashboards).
- Add PySpark transformations for batch processing.
- Integrate MinIO parquet flows for curated datasets.
- Improve CI/CD and add testing coverage.

## Contributing
## Recent Update (Jan 2026)
- Added data pipeline service with APScheduler and monthly World Bank GDP ingestion.
- Introduced backend modules `catalog` and `charts` with endpoints: `/api/catalog/countries`, `/api/charts/wb/gdp`.
- Implemented GDP card on Dashboard with country selector, legend, tooltip, and YoY visualization.
- Frontend now uses same‑origin requests via Vite dev proxy (`/api`), with optional `VITE_API_BASE`. Removed localhost hardcoding.
- Extended backend `.env.example` with `JWT_ACCESS_SECRET`, token TTLs, and MinIO settings; added World Bank schema migration.
Pull requests and issues are welcome while the project is in active development. Please avoid committing secrets; use `.env.example` files for configuration.
