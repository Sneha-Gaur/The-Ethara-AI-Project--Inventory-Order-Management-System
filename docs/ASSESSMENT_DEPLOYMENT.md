# Assessment Deployment Guide

Complete this checklist to obtain all submission URLs. **Do not commit secrets** to GitHub.

---

## What you need (manual approvals)

| Service | What to provide |
|---------|-----------------|
| **GitHub** | Already pushed — repo access |
| **Neon** or **Railway Postgres** | Create DB → copy `DATABASE_URL` |
| **Railway** | Login at [railway.app](https://railway.app) → deploy from GitHub |
| **Vercel** or **Netlify** | Login → import repo, set root `frontend` |
| **Docker Hub** | Username + access token for `docker login` |

---

## Step 1 — PostgreSQL (Neon recommended)

1. Go to [console.neon.tech](https://console.neon.tech) → New Project.
2. Copy connection string (PostgreSQL), e.g.  
   `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`
3. Save as `DATABASE_URL` (you will paste into Railway).

**Railway Postgres alternative:** In Railway project → **+ New** → **Database** → **PostgreSQL** → copy `DATABASE_URL` from Variables.

---

## Step 2 — Deploy backend (Railway)

1. [railway.app/new](https://railway.app/new) → **Deploy from GitHub repo**  
   `Sneha-Gaur/The-Ethara-AI-Project--Inventory-Order-Management-System`
2. Settings:
   - **Root directory:** `/` (repo root)
   - Uses `railway.json` + `docker/Dockerfile.backend`
3. **Variables** (Railway → Service → Variables):

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Neon or Railway Postgres URL |
| `SQLITE_FALLBACK` | `false` |
| `SECRET_KEY` | long random string |
| `JWT_SECRET` | long random string |
| `FRONTEND_URL` | _(set after Vercel deploy)_ |
| `CORS_ORIGINS` | `https://YOUR-APP.vercel.app` |

4. Deploy → copy public URL, e.g. `https://inventory-backend-production.up.railway.app`

**Test:** `https://YOUR-RAILWAY-URL/health` → `{"status":"healthy"}`

---

## Step 3 — Deploy frontend (Vercel)

1. [vercel.com/new](https://vercel.com/new) → Import GitHub repo.
2. **Root Directory:** `frontend`
3. **Environment variable:**

| Name | Value |
|------|--------|
| `VITE_API_BASE_URL` | `https://YOUR-RAILWAY-URL` (no trailing slash) |

4. Deploy → copy URL, e.g. `https://inventory-ethara.vercel.app`
5. Update Railway `FRONTEND_URL` and `CORS_ORIGINS` with this URL → redeploy backend.

**Netlify alternative:** Root `frontend`, build `npm run build`, publish `dist`, env `VITE_API_BASE_URL`.

---

## Step 4 — Docker Hub image

On a machine with Docker installed:

```bash
cd inventory-management-system
docker login
export DOCKER_USER=your-dockerhub-username
docker build -f docker/Dockerfile.backend -t $DOCKER_USER/inventory-backend:latest .
docker push $DOCKER_USER/inventory-backend:latest
```

Image link: `https://hub.docker.com/r/YOUR_USER/inventory-backend`

---

## Step 5 — Post-deploy testing

From browser (hosted frontend):

- [ ] Signup new user
- [ ] Login (admin / admin123 if seeded)
- [ ] Products CRUD
- [ ] Customers CRUD
- [ ] Create order (stock validation)
- [ ] Inventory logs / low stock
- [ ] Reports page

Or run locally against production API:

```bash
API_URL=https://YOUR-RAILWAY-URL node scripts/verify.mjs
```

---

## Submission URLs (fill after deploy)

| Item | URL |
|------|-----|
| GitHub | https://github.com/Sneha-Gaur/The-Ethara-AI-Project--Inventory-Order-Management-System |
| Backend API | `https://____________.up.railway.app` |
| Swagger / OpenAPI | `https://____________.up.railway.app/docs` |
| Health | `https://____________.up.railway.app/health` |
| DB Health | `https://____________.up.railway.app/health/db` |
| Frontend | `https://____________.vercel.app` |
| Railway project | `https://railway.app/project/________` |
| Vercel project | `https://vercel.com/________/inventory` |
| Docker Hub | `https://hub.docker.com/r/________/inventory-backend` |
