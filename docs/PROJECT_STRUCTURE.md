# Project Structure

```
Inventory-Order-Management-System/
├── frontend/                 # React + Vite + Tailwind UI
│   ├── src/
│   │   ├── components/       # Layout, Navbar, forms, cards
│   │   ├── context/            # AuthContext
│   │   ├── pages/              # All routes (Home, Dashboard, CRUD modules)
│   │   ├── services/           # Axios API client
│   │   └── utils/              # Validation, error helpers
│   ├── Dockerfile              # Legacy; prefer docker/Dockerfile.frontend
│   └── package.json
├── backend/                  # FastAPI + SQLAlchemy (primary API)
│   ├── app/
│   │   ├── routes/             # REST endpoints
│   │   ├── models/             # ORM models
│   │   ├── schemas/            # Pydantic DTOs
│   │   ├── services/           # Business logic
│   │   ├── database/           # Bootstrap, session, migrations
│   │   └── utils/              # JWT, security, dependencies
│   ├── seed.py                 # Sample data
│   ├── init_database.py        # CLI DB setup
│   └── requirements.txt
├── server/                   # Node.js API (SQLite fallback, no Python required)
│   ├── index.js              # Express entry
│   ├── db.js                 # sql.js SQLite layer
│   ├── api.js                # CRUD + auth routes
│   └── schema.js             # SQLite DDL
├── database/
│   └── schema.sql            # PostgreSQL reference schema
├── docs/                     # Documentation
├── screenshots/              # README / assessment images
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── scripts/
│   └── verify.mjs            # API smoke tests
├── docker-compose.yml
├── README.md
├── LICENSE
├── .env.example
├── START.bat                 # Python backend + frontend
└── START_AUTH.bat            # Node API + frontend (recommended on Windows)
```

## Runtime Options

| Mode | Command | Database |
|------|---------|----------|
| Docker (production-like) | `docker-compose up --build` | PostgreSQL 16 |
| Python local | `START.bat` | SQLite or PostgreSQL |
| Node local (no Python) | `START_AUTH.bat` | SQLite (`backend/inventory.db`) |
