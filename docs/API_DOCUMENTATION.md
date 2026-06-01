# API Documentation

Base URL: `http://localhost:8000`

Authentication: Bearer token in `Authorization` header (except auth endpoints).

## Auth

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register user |
| POST | `/api/auth/login/json` | Login (JSON body) |
| POST | `/api/auth/login` | Login (OAuth2 form) |
| GET | `/api/auth/me` | Current user |
| POST | `/api/auth/forgot-password` | Request reset |
| POST | `/api/auth/reset-password` | Reset password |

### Signup

```json
POST /api/auth/signup
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

Response: `{ "access_token": "...", "token_type": "bearer", "user": { ... } }`

### Login (JSON)

```json
POST /api/auth/login/json
{ "username_or_email": "admin", "password": "admin123" }
```

Also accepts email: `"username_or_email": "admin@inventory.com"`

Response: `{ "access_token": "...", "token_type": "bearer", "user": { ... } }`

## Products

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/products/featured?limit=8` | No (public) |
| GET | `/api/products/public?page=1` | No (public) |
| GET | `/api/products/public/{id}` | No (public detail) |
| GET | `/api/products?page=1&page_size=10&search=&category=` | Yes |
| GET | `/api/products/{id}` | Yes |
| POST | `/api/products` | Yes |
| PUT | `/api/products/{id}` | Yes |
| DELETE | `/api/products/{id}` | Yes |
| GET | `/api/products/categories` | Yes |

## Customers

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/customers?page=1&search=` | Yes |
| GET | `/api/customers/{id}` | Yes |
| POST | `/api/customers` | Yes |
| PUT | `/api/customers/{id}` | Yes |
| DELETE | `/api/customers/{id}` | Yes |

## Orders

| Method | Endpoint | Auth |
|--------|----------|------|
| GET | `/api/orders?status=Pending` | Yes |
| GET | `/api/orders/{id}` | Yes |
| POST | `/api/orders` | Yes |
| PATCH | `/api/orders/{id}/status` | Yes |
| POST | `/api/orders/{id}/cancel` | Yes |

### Create Order

```json
{
  "customer_id": 1,
  "items": [
    { "product_id": 1, "quantity": 2 }
  ]
}
```

**400** if insufficient stock.

## Inventory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/inventory/dashboard` | Stats + stock + logs |
| GET | `/api/inventory/logs` | Inventory change history |
| GET | `/api/inventory/low-stock` | Low stock products |

## Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/summary` | Totals, charts data, low stock |

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted |
| 400 | Validation / business rule error |
| 401 | Unauthorized |
| 403 | Forbidden (admin only) |
| 404 | Not found |
