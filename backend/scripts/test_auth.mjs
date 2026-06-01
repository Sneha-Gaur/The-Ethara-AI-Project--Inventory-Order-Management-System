const BASE = 'http://127.0.0.1:8000';
const TEST = { username: 'testuser99', email: 'testuser99@example.com', password: 'testpass123' };

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  console.log('Health check...');
  try {
    await fetch(`${BASE}/health`);
  } catch {
    console.error('FAIL: Backend not running at', BASE);
    process.exit(1);
  }

  console.log('Signup...');
  let r = await post('/api/auth/signup', TEST);
  if (r.status === 201) {
    console.log('OK signup', r.data.user?.username);
  } else if (r.status === 400 && String(r.data.detail).includes('already')) {
    console.log('User exists, continuing...');
  } else {
    console.error('FAIL signup', r.status, r.data);
    process.exit(1);
  }

  console.log('Login...');
  r = await post('/api/auth/login/json', {
    username_or_email: TEST.username,
    password: TEST.password,
  });
  if (r.status !== 200) {
    console.error('FAIL login', r.status, r.data);
    process.exit(1);
  }
  console.log('OK login', r.data.user?.email);
  console.log('All tests passed.');
}

main();
