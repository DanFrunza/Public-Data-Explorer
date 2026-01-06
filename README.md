# Public Data Explorer

An educational, full‑stack platform for exploring and visualizing large public datasets. Built to mirror real‑world production patterns while remaining fully runnable locally. The project is actively in development.

## Overview
- **Goal:** Make complex public data easier to explore through clean, interactive visualizations and a structured API.
- **Status:** In development; features and datasets are added iteratively.
- **Audience:** Recruiters, collaborators, and learners interested in modern web/data engineering.

## Features
- **Interactive visualizations:** D3.js dashboards and charts (work in progress).
- **User accounts:** Secure register/login flows with validations and rate limiting.
- **Data pipeline:** Python-based processing, parquet storage, and S3‑compatible object storage (MinIO in dev).
- **Production‑like setup:** Docker Compose orchestration, environment‑driven configuration.

## Tech Stack
- **Frontend:** React (Vite), JavaScript, React Router, D3.js, CSS.
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
- Routes: [backend/src/routes/auth.js](backend/src/routes/auth.js)
- Controllers: [backend/src/controllers/authController.js](backend/src/controllers/authController.js)
- Services: [backend/src/services/userService.js](backend/src/services/userService.js)
- DB Pool: [backend/src/db/pool.js](backend/src/db/pool.js)
- Security middleware: [backend/src/middleware/security.js](backend/src/middleware/security.js)
- Rate limiting: [backend/src/middleware/rateLimiter.js](backend/src/middleware/rateLimiter.js)

### Implemented API Endpoints
- `POST /api/register` – Validates input, hashes passwords with Argon2id, inserts user.
- `POST /api/login` – Verifies credentials using Argon2, returns basic success response (JWT planned).
- `GET /health` – Health check.

### Security Posture (Baseline)
- **Passwords:** Argon2id with sane parameters (memory/time/parallelism).
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
- `users` with required fields (email unique, password_hash, first_name, last_name, country) and optional profile fields (gender, date_of_birth, city, occupation, bio, phone, avatar_url, timezone, locale).
- `updated_at` auto‑updated via trigger on update.

## Frontend
- `.env` format: `VITE_API_URL` pointing to backend (e.g., `http://localhost:4000`).
- Register page: validates inputs, calls `/api/register`, shows success/error alerts.
- Login page: validates inputs, calls `/api/login`, alerts on success; token storage planned.

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
