/**
 * Quick verification script — run with API on port 8000:
 *   node scripts/verify.mjs
 */
const BASE = process.env.API_URL || 'http://127.0.0.1:8000';

async function req(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

function ok(label, passed) {
  console.log(passed ? `  OK  ${label}` : ` FAIL ${label}`);
  return passed;
}

async function main() {
  console.log('Verifying Inventory API at', BASE);
  let passed = 0;
  let total = 0;
  const check = (label, p) => {
    total++;
    if (ok(label, p)) passed++;
  };

  const health = await req('GET', '/health');
  check('Health endpoint', health.status === 200);

  const db = await req('GET', '/health/db');
  check('Database connected', db.data?.connected === true);

  const signup = await req('POST', '/api/auth/signup', {
    username: `verify_${Date.now()}`,
    email: `verify_${Date.now()}@test.com`,
    password: 'verify123',
  });
  check(
    'Signup',
    signup.status === 201 ||
      (signup.status === 400 && String(signup.data?.detail || '').includes('registered'))
  );

  const login = await req('POST', '/api/auth/login/json', {
    username_or_email: 'admin',
    password: 'admin123',
  });
  const token = login.data?.access_token;
  check('Login', login.status === 200 && !!token);

  if (token) {
    const products = await req('GET', '/api/products?page=1', null, token);
    check('Products list', products.status === 200);
    const customers = await req('GET', '/api/customers?page=1', null, token);
    check('Customers list', customers.status === 200);
    const orders = await req('GET', '/api/orders?page=1', null, token);
    check('Orders list', orders.status === 200);
    const reports = await req('GET', '/api/reports/summary', null, token);
    check('Reports summary', reports.status === 200);
    const low = await req('GET', '/api/inventory/low-stock', null, token);
    check('Low stock', low.status === 200);
  }

  console.log(`\n${passed}/${total} checks passed`);
  process.exit(passed === total ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
