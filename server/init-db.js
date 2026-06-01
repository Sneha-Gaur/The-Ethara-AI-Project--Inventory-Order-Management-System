import { initDatabase, databaseHealth, DB_PATH } from './db.js';
import { seedIfEmpty } from './seed.js';

await initDatabase();
seedIfEmpty();
const health = databaseHealth();
console.log('Database initialized:', DB_PATH);
console.log('Tables:', health.tables);
