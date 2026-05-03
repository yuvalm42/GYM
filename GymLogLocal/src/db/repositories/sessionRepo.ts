import { getAll, getFirst, run, withTransaction } from '@/db/client';
import type { NewSession, Session, SessionExercise } from '@/db/types';

export type SessionExerciseWithName = SessionExercise & { exercise_name: string };

export const sessionRepo = {
  create(input: NewSession): Session {
    const session: Session = {
      id: input.id,
      started_at: input.started_at,
      ended_at: input.ended_at ?? null,
      notes: input.notes ?? null,
    };

    run('INSERT INTO sessions (id, started_at, ended_at, notes) VALUES (?, ?, ?, ?);', [
      session.id,
      session.started_at,
      session.ended_at,
      session.notes,
    ]);

    return session;
  },
  findById(id: string): Session | null {
    return getFirst<Session>('SELECT * FROM sessions WHERE id = ?;', [id]);
  },
  list(): Session[] {
    return getAll<Session>('SELECT * FROM sessions ORDER BY started_at DESC;');
  },
  attachExercise(sessionExercise: SessionExercise): void {
    run('INSERT INTO session_exercises (id, session_id, exercise_id, order_index) VALUES (?, ?, ?, ?);', [
      sessionExercise.id,
      sessionExercise.session_id,
      sessionExercise.exercise_id,
      sessionExercise.order_index,
    ]);
  },
  listSessionExercisesWithExercise(sessionId: string): SessionExerciseWithName[] {
    return getAll<SessionExerciseWithName>(
      `SELECT se.*, e.name as exercise_name
       FROM session_exercises se
       INNER JOIN exercises e ON e.id = se.exercise_id
       WHERE se.session_id = ?
       ORDER BY se.order_index ASC;`,
      [sessionId],
    );
  },
  removeSessionExercise(sessionExerciseId: string): void {
    run('DELETE FROM session_exercises WHERE id = ?;', [sessionExerciseId]);
  },
  reorderSessionExercise(sessionId: string, sessionExerciseId: string, toIndex: number): void {
    const rows = this.listExercisesForSession(sessionId);
    const fromIndex = rows.findIndex((row) => row.id === sessionExerciseId);
    if (fromIndex < 0 || toIndex < 0 || toIndex >= rows.length) return;

    const moved = rows.splice(fromIndex, 1)[0];
    rows.splice(toIndex, 0, moved);

    withTransaction(() => {
      rows.forEach((row, index) => {
        run('UPDATE session_exercises SET order_index = ? WHERE id = ?;', [index, row.id]);
      });
    });
  },
  listExercisesForSession(sessionId: string): SessionExercise[] {
    return getAll<SessionExercise>('SELECT * FROM session_exercises WHERE session_id = ? ORDER BY order_index ASC;', [
      sessionId,
    ]);
  },
  remove(id: string): void {
    withTransaction(() => {
      run('DELETE FROM sessions WHERE id = ?;', [id]);
    });
  },
};
