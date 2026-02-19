import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(process.cwd(), 'pr_events.db');
const db = new Database(dbPath);

// Initialize the table
db.exec(`
  CREATE TABLE IF NOT EXISTS pr_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pr_id INTEGER NOT NULL,
    repo_name TEXT NOT NULL,
    author TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export const insertPrEvent = (event: {
  pr_id: number;
  repo_name: string;
  author: string;
  title: string;
  summary: string;
}) => {
  const stmt = db.prepare(`
    INSERT INTO pr_events (pr_id, repo_name, author, title, summary)
    VALUES (@pr_id, @repo_name, @author, @title, @summary)
  `);
  return stmt.run(event);
};

export const getPrMetrics = () => {
  const stmt = db.prepare('SELECT * FROM pr_events ORDER BY created_at DESC');
  return stmt.all();
};
