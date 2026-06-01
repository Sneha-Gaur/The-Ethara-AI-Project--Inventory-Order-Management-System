# Deployment Guide

## Prerequisites

- Git, Node.js 20+, Python 3.12+ (optional if using Node API only)
- Docker Desktop (for containerized deployment)
- Accounts: GitHub, Vercel/Netlify, Render/Railway, Neon (optional)

---

## 1. Local Development

### Option A — Node API + React (Windows-friendly)

```bat
START_AUTH.bat
```

- API: http://127.0.0.1:8000  
- UI: http://localhost:5173  
- DB: `backend/inventory.db` (SQLite)

### Option B — Python FastAPI + React

```bat
START.bat
```

Requires Python 3.12 on PATH.

### Option C — Docker Compose

```bash
cp .env.example .env
# Edit POSTGRES_PASSWORD, SECRET_KEY, JWT_SECRET
docker-compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| Backend | http://localhost:8000 |
| Swagger | http://localhost:8000/docs |

---

## 2. Environment Variables

Copy `.env.example` to `.env` (root) and `backend/.env.example` to `backend/.env`.

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL or SQLite connection string |
| `SQLITE_FALLBACK` | `true` to use SQLite when Postgres is down |
| `SECRET_KEY` | App secret (generate random string) |
| `JWT_SECRET` | JWT signing key |
| `CORS_ORIGINS` | Comma-separated frontend URLs |
| `VITE_API_BASE_URL` | Frontend build-time API URL |

**Never commit real passwords or API keys.**

---

## 3. Frontend Deployment

### Vercel

1. Import GitHub repository.
2. Root directory: `frontend`
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable: `VITE_API_BASE_URL=https://your-api.onrender.com`

### Netlify

1. Base directory: `frontend`
2. Build: `npm run build`
3. Publish: `dist`
4. Add `VITE_API_BASE_URL` in site settings.

---

## 4. Backend Deployment

### Render

1. New **Web Service** → connect repo.
2. Root directory: `backend`
3. Build: `pip install -r requirements.txt`
4. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Set `DATABASE_URL` to Neon PostgreSQL URL.
6. Set `SECRET_KEY`, `JWT_SECRET`, `CORS_ORIGINS` (your Vercel URL).

### Railway

1. Deploy from GitHub, service root `backend`.
2. Add PostgreSQL plugin or Neon `DATABASE_URL`.
3. Same start command as Render.

### Docker Hub

```bash
docker build -f docker/Dockerfile.backend -t YOUR_USER/inventory-backend:latest .
docker push YOUR_USER/inventory-backend:latest
```

---

## 5. Database — Neon PostgreSQL

1. Create project at [neon.tech](https://neon.tech).
2. Copy connection string → `DATABASE_URL`.
3. Set `SQLITE_FALLBACK=false` in production.
4. Deploy backend; tables auto-create on first start.

---

## 6. Post-Deploy Checklist

- [ ] `GET https://your-api/health` → `healthy`
- [ ] `GET https://your-api/health/db` → `connected: true`
- [ ] Signup + login from hosted frontend
- [ ] CORS allows your frontend origin
- [ ] HTTPS on both frontend and API

---

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS errors | Add frontend URL to `CORS_ORIGINS` |
| 401 on API calls | Check `VITE_API_BASE_URL` matches API host |
| DB connection failed | Verify `DATABASE_URL`, SSL mode for Neon |
| Docker Postgres not ready | Wait for healthcheck; retry `docker-compose up` |

Interactive API docs: `/docs` (FastAPI) when Python backend is running.
