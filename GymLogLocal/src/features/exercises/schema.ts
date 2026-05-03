import { z } from 'zod';

export const exerciseSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(120, 'Name is too long'),
  muscle_group: z.string().trim().max(120, 'Muscle group is too long').optional().or(z.literal('')),
});

export type ExerciseForm = z.infer<typeof exerciseSchema>;
