import { z } from 'zod';

export const MoveCandidateSchema = z.object({
  targetStageId: z.string().uuid({ message: 'Invalid target stage ID' }),
  notes: z.string().max(1000).optional(),
});

export const RejectCandidateSchema = z.object({
  reason: z.string().max(1000).optional(),
});
