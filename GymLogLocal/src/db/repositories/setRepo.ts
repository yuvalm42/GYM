import { getAll, getFirst, run } from '@/db/client';
import type { WorkoutSet } from '@/db/types';

export const setRepo = {
  create(input: WorkoutSet): WorkoutSet {
    run(
      `INSERT INTO sets
      (id, session_exercise_id, set_number, reps, weight, rpe, is_warmup)
      VALUES (?, ?, ?, ?, ?, ?, ?);`,
      [
        input.id,
        input.session_exercise_id,
        input.set_number,
        input.reps,
        input.weight,
        input.rpe,
        input.is_warmup,
      ],
    );

    return input;
  },

  findById(id: string): WorkoutSet | null {
    return getFirst<WorkoutSet>('SELECT * FROM sets WHERE id = ?;', [id]);
  },

  listBySessionExerciseId(sessionExerciseId: string): WorkoutSet[] {
    return getAll<WorkoutSet>(
      'SELECT * FROM sets WHERE session_exercise_id = ? ORDER BY set_number ASC;',
      [sessionExerciseId],
    );
  },

  update(input: WorkoutSet): WorkoutSet | null {
    run(
      `UPDATE sets
       SET set_number = ?, reps = ?, weight = ?, rpe = ?, is_warmup = ?
       WHERE id = ?;`,
      [input.set_number, input.reps, input.weight, input.rpe, input.is_warmup, input.id],
    );

    return this.findById(input.id);
  },

  remove(id: string): void {
    run('DELETE FROM sets WHERE id = ?;', [id]);
  },
};
