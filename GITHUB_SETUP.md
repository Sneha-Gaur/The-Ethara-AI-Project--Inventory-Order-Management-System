# Push to GitHub — Quick Commands

Repository: **The-Ethara-AI-Project--Inventory-Order-Management-System**  
URL: https://github.com/Sneha-Gaur/The-Ethara-AI-Project--Inventory-Order-Management-System

## Prerequisites

1. Install [Git for Windows](https://git-scm.com/download/win) and restart your terminal.
2. Close any running `npm run dev` / API windows (so `node_modules` can be deleted if needed).
3. Do **not** commit `.env` files or `*.db` files (already in `.gitignore`).

## One-time setup (run in project folder)

```bash
cd "c:\Users\Anshika Gaur\Downloads\ethara ai\inventory-management-system"

git init
git branch -M main
git remote add origin https://github.com/Sneha-Gaur/The-Ethara-AI-Project--Inventory-Order-Management-System.git
```

If `origin` already exists:

```bash
git remote set-url origin https://github.com/Sneha-Gaur/The-Ethara-AI-Project--Inventory-Order-Management-System.git
```

## Stage, commit, and push

```bash
git add .
git status
git commit -m "Complete Inventory & Order Management System"
git push -u origin main
```

If the remote repository already has commits (e.g. README from GitHub):

```bash
git pull origin main --rebase
git push -u origin main
```

## What gets uploaded

| Included | Excluded (`.gitignore`) |
|----------|-------------------------|
| `frontend/` source | `frontend/node_modules/`, `frontend/dist/` |
| `backend/` source | `backend/venv/`, `backend/.env`, `*.db` |
| `server/` source | `server/node_modules/` |
| `database/`, `docker/`, `docs/`, `screenshots/` | `__pycache__/`, `.env` |
| `README.md`, `LICENSE`, `docker-compose.yml`, `.env.example` | Build caches, logs |

## After push

1. Open the repository on GitHub and confirm all folders are present.
2. Add deployment URLs to the README **Assessment Submission** section.
3. Add screenshots to `screenshots/` and commit again if required.
