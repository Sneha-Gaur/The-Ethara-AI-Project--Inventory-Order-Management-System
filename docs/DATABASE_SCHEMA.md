# Database Schema

## Overview

The application uses **SQLAlchemy ORM** as the source of truth. Tables are created automatically on startup via `Base.metadata.create_all()` and inline migrations in `backend/app/database/bootstrap.py`.

- **Production / Docker:** PostgreSQL 16
- **Local dev:** SQLite (`backend/inventory.db`) or PostgreSQL with `SQLITE_FALLBACK=true`
- **Reference DDL:** `database/schema.sql` (PostgreSQL syntax for DBAs)

## Tables

### users

| Column | Type | Constraints |
|--------|------|-------------|
| id | INTEGER / SERIAL | PK |
| username | VARCHAR(50) | UNIQUE, NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | VARCHAR(255) | NOT NULL |
| full_name | VARCHAR(255) | NOT NULL |
| role | ENUM / VARCHAR | admin, staff |
| is_active | BOOLEAN | default true |
| created_at | TIMESTAMP | auto |

### products

| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| name | VARCHAR(255) | indexed |
| sku | VARCHAR(100) | UNIQUE |
| description | TEXT | nullable |
| price | NUMERIC(12,2) | |
| quantity | INTEGER | stock on hand |
| category | VARCHAR(100) | indexed |
| image_url | VARCHAR(500) | nullable |
| is_featured | BOOLEAN | catalog/home |
| created_at | TIMESTAMP | |

### customers

| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| full_name | VARCHAR(255) | |
| email | VARCHAR(255) | UNIQUE |
| phone, address, city, state, country | VARCHAR | |

### orders

| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| customer_id | FK → customers | |
| total_amount | NUMERIC(12,2) | |
| status | ENUM / VARCHAR | Pending, Processing, Completed, Cancelled |
| order_date | TIMESTAMP | |

### order_items

| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| order_id | FK → orders | CASCADE delete |
| product_id | FK → products | |
| quantity | INTEGER | |
| unit_price, subtotal | NUMERIC | |

### inventory_logs

| Column | Type | Notes |
|--------|------|-------|
| id | PK | |
| product_id | FK → products | |
| change_amount | INTEGER | negative = reduction |
| previous_quantity, new_quantity | INTEGER | |
| reason | VARCHAR(255) | e.g. Order placement |
| notes | TEXT | nullable |
| created_at | TIMESTAMP | |

## Relationships

```
users (standalone)
customers 1 ── * orders
orders 1 ── * order_items
products 1 ── * order_items
products 1 ── * inventory_logs
```

## Business Rules (enforced in services)

1. **Order creation** — Validates stock before insert; rejects insufficient quantity.
2. **Order creation** — Decrements `products.quantity` and writes `inventory_logs`.
3. **Order cancel** — Restores stock and logs cancellation (not allowed for Completed orders).

## Migrations

- Automatic: `bootstrap.py` (`username`, `password_hash` rename, `is_featured`, etc.)
- Manual (legacy): `migrate_add_featured.py`, `migrate_add_username.py`
- Reset local SQLite: delete `backend/inventory.db` and run `npm run init-db` in `server/` or `python init_database.py`

## Health Check

`GET /health/db` returns connection status, backend type (`sqlite` / `postgresql`), and table counts.
