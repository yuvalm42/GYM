import { getAll, getFirst, run, withTransaction } from '@/db/client';
import type { NewSession, Session, SessionExercise } from '@/db/types';

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

  endSession(id: string, endedAt: string): Session | null {
    run('UPDATE sessions SET ended_at = ? WHERE id = ?;', [endedAt, id]);
    return this.findById(id);
  },

  attachExercise(sessionExercise: SessionExercise): void {
    run(
      'INSERT INTO session_exercises (id, session_id, exercise_id, order_index) VALUES (?, ?, ?, ?);',
      [sessionExercise.id, sessionExercise.session_id, sessionExercise.exercise_id, sessionExercise.order_index],
    );
  },

  listExercisesForSession(sessionId: string): SessionExercise[] {
    return getAll<SessionExercise>(
      'SELECT * FROM session_exercises WHERE session_id = ? ORDER BY order_index ASC;',
      [sessionId],
    );
  },

  remove(id: string): void {
    withTransaction(() => {
      run('DELETE FROM sessions WHERE id = ?;', [id]);
    });
  },
};
