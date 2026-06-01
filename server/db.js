import initSqlJs from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SCHEMA_SQL, MIGRATIONS_SQL } from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const DB_PATH = path.resolve(__dirname, '../backend/inventory.db');

let SQL = null;
let db = null;

function persist() {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  fs.writeFileSync(DB_PATH, Buffer.from(db.export()));
}

function tableExists(name) {
  const r = db.exec(
    `SELECT name FROM sqlite_master WHERE type='table' AND name='${name.replace(/'/g, "''")}'`
  );
  return r.length > 0 && r[0].values.length > 0;
}

function columnExists(table, column) {
  const r = db.exec(`PRAGMA table_info(${table})`);
  if (!r.length) return false;
  const cols = r[0].values.map((row) => row[1]);
  return cols.includes(column);
}

function runMigrations() {
  if (!tableExists('users')) return;
  if (columnExists('users', 'hashed_password') && !columnExists('users', 'password_hash')) {
    try {
      db.run('ALTER TABLE users RENAME COLUMN hashed_password TO password_hash');
    } catch {
      /* ignore */
    }
  }
  for (const sql of MIGRATIONS_SQL) {
    try {
      db.run(sql);
    } catch {
      /* column already exists */
    }
  }
}

export async function initDatabase() {
  SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    db = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    db = new SQL.Database();
  }

  db.run(SCHEMA_SQL);
  runMigrations();
  persist();
  return db;
}

export function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.');
  return db;
}

export function saveDb() {
  persist();
}

export function queryAll(sql, params = []) {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  return rows;
}

export function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

let _lastInsertId = 0;

export function run(sql, params = []) {
  const stmt = getDb().prepare(sql);
  stmt.bind(params);
  stmt.step();
  const idRow = getDb().exec('SELECT last_insert_rowid()');
  _lastInsertId =
    idRow.length && idRow[0].values?.length ? Number(idRow[0].values[0][0]) : 0;
  stmt.free();
  saveDb();
  return getDb().getRowsModified();
}

export function lastInsertId() {
  return _lastInsertId;
}

export function databaseHealth() {
  try {
    queryOne('SELECT 1 AS ok');
    const counts = {};
    for (const t of ['users', 'products', 'customers', 'orders']) {
      if (tableExists(t)) {
        counts[t] = queryOne(`SELECT COUNT(*) AS c FROM ${t}`)?.c ?? 0;
      }
    }
    return {
      connected: true,
      backend: 'sqlite',
      url: DB_PATH,
      error: null,
      tables: counts,
    };
  } catch (e) {
    return {
      connected: false,
      backend: 'sqlite',
      url: DB_PATH,
      error: String(e.message),
      tables: {},
    };
  }
}
