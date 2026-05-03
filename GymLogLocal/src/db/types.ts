export type ID = string;

export type Exercise = {
  id: ID;
  name: string;
  muscle_group: string | null;
  created_at: string;
};

export type Session = {
  id: ID;
  started_at: string;
  ended_at: string | null;
  notes: string | null;
};

export type SessionExercise = {
  id: ID;
  session_id: ID;
  exercise_id: ID;
  order_index: number;
};

export type WorkoutSet = {
  id: ID;
  session_exercise_id: ID;
  set_number: number;
  reps: number | null;
  weight: number | null;
  rpe: number | null;
  is_warmup: 0 | 1;
};

export type NewExercise = Omit<Exercise, 'created_at'> & { created_at?: string };
export type NewSession = Omit<Session, 'ended_at'> & { ended_at?: string | null; notes?: string | null };
export type NewWorkoutSet = WorkoutSet;
