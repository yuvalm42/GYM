import { z } from 'zod';

export const sessionSchema = z.object({
  notes: z.string().max(500).optional(),
});

export type SessionForm = z.infer<typeof sessionSchema>;
