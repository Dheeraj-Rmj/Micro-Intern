import { z } from 'zod';

export const TrialParamSchema = z.object({
  id: z.string().min(1, 'Trial identifier is required'),
});

export const SubmissionParamSchema = z.object({
  id: z.string().min(1, 'Submission ID is required'),
});

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

const AnswerItemSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
  answerText: z.string().optional(),
  answerData: z.record(z.unknown()).optional(),
  fileIndex: z.coerce.number().int().min(0).optional(),
});

export const SubmitTrialBodySchema = z.object({
  answers: z.preprocess((val) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        return val;
      }
    }
    return val;
  }, z.array(AnswerItemSchema).min(1, 'At least one answer must be provided')),
});

export type TrialParamDto = z.infer<typeof TrialParamSchema>;
export type SubmissionParamDto = z.infer<typeof SubmissionParamSchema>;
export type PaginationQueryDto = z.infer<typeof PaginationQuerySchema>;
export type SubmitTrialBodyDto = z.infer<typeof SubmitTrialBodySchema>;
