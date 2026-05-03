import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('gymloglocal.db');

type SqlParams = SQLite.SQLiteBindParams;

export function getDb() {
  return db;
}

export function enableForeignKeys() {
  db.execSync('PRAGMA foreign_keys = ON;');
}

export function run(sql: string, params?: SqlParams) {
  try {
    return db.runSync(sql, params);
  } catch (error) {
    throw new Error(`SQL run failed: ${sql}`, { cause: error });
  }
}

export function getAll<T>(sql: string, params?: SqlParams): T[] {
  try {
    return db.getAllSync<T>(sql, params);
  } catch (error) {
    throw new Error(`SQL getAll failed: ${sql}`, { cause: error });
  }
}

export function getFirst<T>(sql: string, params?: SqlParams): T | null {
  try {
    return db.getFirstSync<T>(sql, params) ?? null;
  } catch (error) {
    throw new Error(`SQL getFirst failed: ${sql}`, { cause: error });
  }
}

export function withTransaction<T>(fn: () => T): T {
  try {
    db.execSync('BEGIN;');
    const result = fn();
    db.execSync('COMMIT;');
    return result;
  } catch (error) {
    try {
      db.execSync('ROLLBACK;');
    } catch {
      // no-op
    }
    throw error;
  }
}
