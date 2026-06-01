/**
 * Inventory API — Node.js + SQLite (shared backend/inventory.db with Python app).
 */
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { initDatabase, queryAll, queryOne, run, lastInsertId, databaseHealth, DB_PATH } from './db.js';
import { seedIfEmpty } from './seed.js';
import { registerApiRoutes } from './api.js';

const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function sanitizeUsername(raw, email) {
  let u = String(raw || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  if (u.length < 3) {
    const fromEmail = String(email).split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
    u = fromEmail.length >= 3 ? fromEmail : `user_${Date.now().toString().slice(-6)}`;
  }
  return u.slice(0, 30);
}

function publicUser(u) {
  const { password_hash, ...rest } = u;
  return rest;
}

function findUser(identifier) {
  const id = String(identifier).trim().toLowerCase();
  return queryOne(
    'SELECT * FROM users WHERE lower(username) = ? OR lower(email) = ?',
    [id, id]
  );
}

function issueToken(user) {
  return jwt.sign({ sub: String(user.id), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ detail: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = queryOne('SELECT * FROM users WHERE id = ?', [Number(payload.sub)]);
    if (!user) return res.status(401).json({ detail: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ detail: 'Invalid token' });
  }
}

app.get('/health', (_, res) => res.json({ status: 'healthy' }));
app.get('/health/db', (_, res) => res.json(databaseHealth()));

app.post('/api/auth/signup', async (req, res) => {
  try {
    let { username, email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ detail: 'Email and password are required' });
    }
    email = String(email).trim().toLowerCase();
    if (!email.includes('@')) {
      return res.status(400).json({ detail: 'Enter a valid email address' });
    }
    if (String(password).length < 6) {
      return res.status(400).json({ detail: 'Password must be at least 6 characters' });
    }
    username = sanitizeUsername(username || email.split('@')[0], email);

    let base = username;
    let n = 1;
    while (findUser(username)) {
      const suffix = `_${n++}`;
      username = (base.slice(0, 30 - suffix.length) + suffix).slice(0, 30);
    }
    if (findUser(email)) {
      return res.status(400).json({ detail: 'Email is already registered' });
    }

    const hash = await bcrypt.hash(String(password), 10);
    run(
      `INSERT INTO users (username, email, password_hash, full_name, role, is_active)
       VALUES (?, ?, ?, ?, 'staff', 1)`,
      [username, email, hash, username.replace(/_/g, ' ')]
    );
    const newUser = queryOne('SELECT * FROM users WHERE id = ?', [lastInsertId()]);

    return res.status(201).json({
      access_token: issueToken(newUser),
      token_type: 'bearer',
      user: publicUser(newUser),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ detail: 'Could not create account: ' + e.message });
  }
});

app.post('/api/auth/login/json', async (req, res) => {
  const { username_or_email, password } = req.body || {};
  if (!username_or_email || !password) {
    return res.status(400).json({ detail: 'Username/email and password required' });
  }
  const user = findUser(username_or_email);
  if (!user || !(await bcrypt.compare(String(password), user.password_hash))) {
    return res.status(401).json({ detail: 'Incorrect username/email or password' });
  }
  return res.json({
    access_token: issueToken(user),
    token_type: 'bearer',
    user: publicUser(user),
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json(publicUser(req.user));
});

app.post('/api/auth/logout', (_, res) => res.json({ message: 'Logged out' }));

registerApiRoutes(app, authMiddleware);

await initDatabase();
seedIfEmpty();

app.listen(PORT, () => {
  console.log(`Inventory API: http://127.0.0.1:${PORT}`);
  console.log(`Database: ${DB_PATH}`);
});
