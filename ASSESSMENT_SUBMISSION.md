# Assessment Submission — Deployment Status

## Local verification (completed)

| Check | Status |
|-------|--------|
| API smoke tests (`scripts/verify.mjs`) | **9/9 passed** |
| Signup, Login, Products, Customers, Orders, Reports, Inventory | Verified locally |
| GitHub repository | [Published](https://github.com/Sneha-Gaur/The-Ethara-AI-Project--Inventory-Order-Management-System) |

## Cloud deployment (requires your login)

Deployments to **Railway**, **Vercel**, **Neon**, and **Docker Hub** cannot be completed from this environment without **your account login**. Follow `docs/ASSESSMENT_DEPLOYMENT.md` (15–20 minutes).

---

## What you must provide / approve

| Step | Action | Credentials |
|------|--------|-------------|
| 1 | Create **Neon** PostgreSQL (or Railway Postgres) | Neon account — copy `DATABASE_URL` |
| 2 | Deploy backend on **Railway** | GitHub login → authorize Railway |
| 3 | Deploy frontend on **Vercel** | GitHub login → authorize Vercel |
| 4 | Set env vars (see below) | Paste URLs and secrets in dashboards |
| 5 | Push **Docker** image | Docker Hub username + `docker login` |

**No passwords or tokens should be sent in chat.** Set them only in each platform’s dashboard.

---

## Environment variables

### Railway (backend)

```
DATABASE_URL=<neon-or-railway-postgres-url>
SQLITE_FALLBACK=false
SECRET_KEY=<random-64-chars>
JWT_SECRET=<random-64-chars>
FRONTEND_URL=https://<your-vercel-app>.vercel.app
CORS_ORIGINS=https://<your-vercel-app>.vercel.app
```

### Vercel (frontend)

```
VITE_API_BASE_URL=https://<your-railway-app>.up.railway.app
```

(No trailing slash on API URL.)

---

## Submission URLs (fill after deploy)

| Item | Your URL |
|------|----------|
| **GitHub Repository** | https://github.com/Sneha-Gaur/The-Ethara-AI-Project--Inventory-Order-Management-System |
| **Backend API** | `https://________________.up.railway.app` |
| **Swagger / OpenAPI** | `https://________________.up.railway.app/docs` |
| **Health Check** | `https://________________.up.railway.app/health` |
| **DB Health** | `https://________________.up.railway.app/health/db` |
| **Frontend (Vercel)** | `https://________________.vercel.app` |
| **Railway Project** | `https://railway.app/dashboard` → your project |
| **Vercel Project** | `https://vercel.com/dashboard` → your project |
| **Docker Hub Image** | `https://hub.docker.com/r/<username>/inventory-backend` |

---

## Quick deploy commands (after login)

### Railway CLI (optional)

```bash
npm i -g @railway/cli
railway login
cd inventory-management-system
railway link
railway up
```

### Vercel CLI (optional)

```bash
npm i -g vercel
cd frontend
vercel login
vercel --prod
```

### Docker Hub

```bat
set DOCKER_USER=your-dockerhub-username
docker login
scripts\deploy-docker.bat
```

---

## After deployment — test production

```bash
set API_URL=https://YOUR-RAILWAY-URL
node scripts/verify.mjs
```

Then test signup/login in the browser on your Vercel URL.
