# Testing Guide

## Automated Smoke Tests

With the API running on port 8000:

```bash
node scripts/verify.mjs
```

Checks: health, database, signup, login, products, customers, orders, reports, low stock.

Auth-only tests (legacy):

```bash
node backend/scripts/test_auth.mjs
```

## Manual Test Checklist

### Authentication

- [ ] Signup with new username, email, password (6+ chars)
- [ ] Signup rejects duplicate email
- [ ] Login with username + password
- [ ] Login with email + password
- [ ] JWT stored in localStorage; `/dashboard` loads after login
- [ ] Logout clears session
- [ ] Protected routes redirect to `/login` when logged out

### Products

- [ ] List, search, filter by category
- [ ] Create product with unique SKU
- [ ] Reject duplicate SKU
- [ ] Edit and delete product
- [ ] Product detail page
- [ ] Public catalog `/catalog` without login

### Customers

- [ ] CRUD operations
- [ ] Unique email validation
- [ ] Customer detail page

### Orders

- [ ] Create order with valid stock
- [ ] Reject order when quantity exceeds stock
- [ ] Stock decreases after order
- [ ] Inventory log entry created
- [ ] Update order status
- [ ] Cancel order restores stock

### Inventory & Reports

- [ ] Dashboard shows stats
- [ ] Low stock alerts
- [ ] Inventory logs list
- [ ] Reports summary and charts

### UI Pages

- [ ] Home, About, Contact, Team, Privacy, Terms
- [ ] Profile, Settings, 404 page

## Frontend Build

```bash
cd frontend
npm ci
npm run build
```

## Docker

```bash
docker-compose up --build
```

Verify http://localhost:3000 and http://localhost:8000/docs

## Demo Accounts

| Username | Email | Password |
|----------|-------|----------|
| admin | admin@inventory.com | admin123 |
| staffuser | staff@inventory.com | staff123 |
