import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'pr_events.db');
const db = new Database(dbPath);

console.log('Querying pr_events table:');
const stmt = db.prepare('SELECT * FROM pr_events');
const rows = stmt.all();

if (rows.length === 0) {
  console.log('No records found.');
} else {
  console.table(rows);
}

db.close();
