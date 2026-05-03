import { getAll, getFirst, run } from '@/db/client';
import type { Exercise, NewExercise } from '@/db/types';

export const exerciseRepo = {
  create(input: NewExercise): Exercise {
    const exercise: Exercise = {
      id: input.id,
      name: input.name,
      muscle_group: input.muscle_group ?? null,
      created_at: input.created_at ?? new Date().toISOString(),
    };

    run('INSERT INTO exercises (id, name, muscle_group, created_at) VALUES (?, ?, ?, ?);', [
      exercise.id,
      exercise.name,
      exercise.muscle_group,
      exercise.created_at,
    ]);

    return exercise;
  },

  findById(id: string): Exercise | null {
    return getFirst<Exercise>('SELECT * FROM exercises WHERE id = ?;', [id]);
  },

  list(): Exercise[] {
    return getAll<Exercise>('SELECT * FROM exercises ORDER BY name ASC;');
  },

  updateNameAndMuscleGroup(id: string, name: string, muscleGroup: string | null): Exercise | null {
    run('UPDATE exercises SET name = ?, muscle_group = ? WHERE id = ?;', [name, muscleGroup, id]);
    return this.findById(id);
  },

  remove(id: string): void {
    run('DELETE FROM exercises WHERE id = ?;', [id]);
  },
};
