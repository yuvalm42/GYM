import { enableForeignKeys, getFirst, run, withTransaction } from '@/db/client';

type Migration = { version: number; name: string; statements: string[] };

const migrations: Migration[] = [
  {
    version: 1,
    name: 'initial_schema',
    statements: [
      `CREATE TABLE IF NOT EXISTS exercises (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        muscle_group TEXT,
        created_at TEXT NOT NULL
      );`,
      `CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        started_at TEXT NOT NULL,
        ended_at TEXT,
        notes TEXT
      );`,
      `CREATE TABLE IF NOT EXISTS session_exercises (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        exercise_id TEXT NOT NULL,
        order_index INTEGER NOT NULL,
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE RESTRICT
      );`,
      `CREATE TABLE IF NOT EXISTS sets (
        id TEXT PRIMARY KEY,
        session_exercise_id TEXT NOT NULL,
        set_number INTEGER NOT NULL,
        reps INTEGER,
        weight REAL,
        rpe REAL,
        is_warmup INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (session_exercise_id) REFERENCES session_exercises(id) ON DELETE CASCADE
      );`,
      'CREATE INDEX IF NOT EXISTS idx_exercises_name ON exercises(name);',
      'CREATE INDEX IF NOT EXISTS idx_exercises_muscle_group ON exercises(muscle_group);',
      'CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);',
      'CREATE INDEX IF NOT EXISTS idx_session_exercises_session_order ON session_exercises(session_id, order_index);',
      'CREATE INDEX IF NOT EXISTS idx_session_exercises_exercise_id ON session_exercises(exercise_id);',
      'CREATE INDEX IF NOT EXISTS idx_sets_session_exercise_set_number ON sets(session_exercise_id, set_number);',
    ],
  },
];

export function migrate() {
  enableForeignKeys();

  run(`CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
  );`);

  const current = getFirst<{ version: number }>('SELECT MAX(version) as version FROM schema_migrations;');
  const currentVersion = current?.version ?? 0;

  const pending = migrations.filter((migration) => migration.version > currentVersion);

  for (const migration of pending) {
    withTransaction(() => {
      for (const statement of migration.statements) {
        run(statement);
      }

      run(
        'INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?);',
        [migration.version, migration.name, new Date().toISOString()],
      );
    });
  }
}
