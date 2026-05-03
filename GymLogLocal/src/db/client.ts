import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('gymloglocal.db');

export function initDb() {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      notes TEXT DEFAULT ''
    );
  `);
}

export function getDb() {
  return db;
}
