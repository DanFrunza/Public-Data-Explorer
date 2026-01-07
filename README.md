# Public Data Explorer

An educational, full‑stack platform for exploring and visualizing large public datasets. Built to mirror real‑world production patterns while remaining fully runnable locally. The project is actively in development.

## Overview
- **Goal:** Make complex public data easier to explore through clean, interactive visualizations and a structured API.
- **Status:** In development; features and datasets are added iteratively.
- **Audience:** Recruiters, collaborators, and learners interested in modern web/data engineering.

## Features
- **Interactive visualizations:** D3.js dashboards and charts (work in progress).
- **User accounts:** Secure register/login with validations and rate limiting.
- **Production‑grade auth:** JWT access token + httpOnly refresh cookie with rotation & reuse detection.
- **Persistent sessions:** Automatic refresh on page reload and 401 with Redux integration.
- **User avatars:** MinIO‑backed storage with presigned URLs; avatar shown in navbar.
- **Unified theme:** Professional dark palette via CSS variables; consistent UI across pages.
- **Data pipeline:** Python‑based (planned), Parquet & S3‑compatible object storage.

## Tech Stack
- **Frontend:** React (Vite), JavaScript, React Router, Redux Toolkit, D3.js, CSS.
- **Backend:** Node.js, Express, PostgreSQL.
- **Data Processing:** Python, PySpark (planned), Parquet, MinIO (S3‑compatible).
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
2) Configure frontend API base:
	 - Copy [frontend/.env.example](frontend/.env.example) to `.env` and set `VITE_API_URL`.
3) Run frontend:
```bash
cd frontend
npm install
npm run dev
```

## Backend Service
- Entry point: [backend/src/server.js](backend/src/server.js)
- Auth module: [backend/src/modules/auth/routes.js](backend/src/modules/auth/routes.js)
- Controllers: [backend/src/modules/auth/controller.js](backend/src/modules/auth/controller.js)
- Services: [backend/src/modules/auth/service.js](backend/src/modules/auth/service.js)
- Security middleware: [backend/src/middleware/security.js](backend/src/middleware/security.js)
- Security middleware: [backend/src/middleware/security.js](backend/src/middleware/security.js)
- Rate limiting: [backend/src/middleware/rateLimiter.js](backend/src/middleware/rateLimiter.js)

### Implemented API Endpoints
- `POST /api/auth/register` – Validates input, hashes passwords (Argon2id), issues access token + refresh cookie.
- `POST /api/auth/login` – Verifies credentials, issues access token + refresh cookie.
- `POST /api/auth/refresh` – Rotates refresh token, returns new access token (+ user data).
- `POST /api/auth/logout` – Revokes refresh token and clears cookie.
- `GET /api/auth/me` – Returns current user (requires `Authorization: Bearer`).
- `GET /health` – Health check.

### Security Posture
- **Passwords:** Argon2id with strong parameters.
- **Tokens:** Short‑lived access JWT; refresh cookie (`httpOnly`, `SameSite=Lax`, rotation & reuse detection).
- **Validation:** Email/password/name/country checks server‑side and client‑side.
- **Queries:** Parameterized SQL to avoid injection.
- **Abuse controls:** Per‑route rate limiting (`register`, `login`).
- **Headers:** `helmet` configured; body size limited.
- **Config:** Environment variables (no secrets in repo).

Recommended next steps:
- Restrict CORS to known frontend origin.
- Add JWT access + refresh tokens and auth middleware.
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

## Frontend
- `.env` format: `VITE_API_URL` pointing to backend (e.g., `http://localhost:4000`).
- Register page: validates inputs, calls `/api/auth/register`, stores token+user, redirects to Dashboard.
- Login page: validates inputs, calls `/api/auth/login`, stores token+user, redirects to Dashboard.
- Session persistence: `AuthBootstrap` refreshes token on load; `apiClient` auto‑refreshes on 401.
- Navbar: avatar image + greeting (first name); dropdown actions.
- Theme: CSS variables in `index.css` for unified dark palette.

## Environment Configuration
- **Frontend:** [frontend/.env.example](frontend/.env.example) → create `frontend/.env` with `VITE_API_URL`.
- **Backend:** [backend/.env.example](backend/.env.example) → create `backend/.env` with DB settings; included by Docker.

## Docker Compose (Services)
- **postgres:** `postgres:15`, exposed on host `5433`.
- **minio:** S3‑compatible object storage (dev), console on `9001`.
- **backend:** Node 18 image built from [backend/Dockerfile](backend/Dockerfile), exposed on `4000`.
- **pipeline:** Python data processing (planned), depends on `postgres` + `minio`.

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
curl -sS -X POST http://localhost:4000/api/register \
	-H "Content-Type: application/json" \
	-d '{"email":"user@test.com","password":"Passw0rd123","first_name":"User","last_name":"Test","country":"RO"}'
```

## Author
Dan Frunza — Master’s student in Software Engineering (Alexandru Ioan Cuza University of Iași), with a Bachelor’s in Mathematics and Computer Science. Actively learning full‑stack development, data visualization, and scalable system design.

Highlights:
- Certifications (freeCodeCamp): Responsive Web Design; JavaScript Algorithms and Data Structures; Front End Development Libraries; Data Visualization (D3.js).
- Contact: dani.frunza@yahoo.com • GitHub: https://github.com/DanFrunza • LinkedIn: https://www.linkedin.com/in/dan-frunza-135695284/

## Roadmap
- Expand datasets and visualizations (D3 dashboards).
- Implement JWT auth (access + refresh) and protected routes.
- Add data ingestion jobs and PySpark transformations.
- Integrate MinIO for object storage and parquet flows.
- Improve CI/CD and add testing coverage.

## Contributing
Pull requests and issues are welcome while the project is in active development. Please avoid committing secrets; use `.env.example` files for configuration.
