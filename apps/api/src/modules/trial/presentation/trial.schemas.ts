import { TaskType, ExperienceLevel, TrialStatus } from '@microintern/database';
import { z } from 'zod';

export const CreateTrialSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  instructions: z.string().min(10),
  skillsRequired: z.array(z.string()).optional(),
  roleTitle: z.string().max(255).optional(),
  level: z.nativeEnum(ExperienceLevel).optional(),
  durationMinutes: z.number().int().positive().max(10000),
  passingScore: z.number().int().min(0).max(100).optional(),
  maxAttempts: z.number().int().positive().max(20).optional(),
  isPublic: z.boolean().optional(),
  tasks: z
    .array(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().min(1),
        taskType: z.nativeEnum(TaskType),
        isRequired: z.boolean().optional(),
        maxPoints: z.number().int().positive().optional(),
        sortOrder: z.number().int(),
        config: z.record(z.unknown()).optional(),
      })
    )
    .optional(),
});

export const UpdateTrialSchema = CreateTrialSchema.partial();

export const ListPublicTrialsQuerySchema = z.object({
  skill: z.string().optional(),
  level: z.nativeEnum(ExperienceLevel).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const ListCompanyTrialsQuerySchema = z.object({
  status: z.nativeEnum(TrialStatus).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});
