import { TaskType, ExperienceLevel, AssessmentStatus } from '@microintern/database';
import { z } from 'zod';

export const CreateAssessmentSchema = z.object({
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
  complexityScore: z.number().int().min(1).max(100).optional(),
  aiDifficultyScore: z.number().int().min(1).max(100).optional(),
  tasks: z
    .array(
      z.object({
        title: z.string().min(1).max(255),
        description: z.string().min(1),
        taskType: z.nativeEnum(TaskType),
        isRequired: z.boolean().optional(),
        maxPoints: z.number().int().positive().optional(),
        weight: z.number().min(0).optional(),
        expectedOutput: z.string().optional(),
        evaluationNotes: z.string().optional(),
        sortOrder: z.number().int(),
        config: z.record(z.unknown()).optional(),
        criteria: z
          .array(
            z.object({
              title: z.string().min(1),
              description: z.string().min(1),
              weight: z.number().min(0).optional(),
              maxPoints: z.number().int().positive().optional(),
              expectedOutput: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .optional(),
  deliverables: z
    .array(
      z.object({
        title: z.string().min(1),
        deliverableType: z.string(),
        isRequired: z.boolean().optional(),
        description: z.string().optional(),
      })
    )
    .optional(),
});

export const UpdateAssessmentSchema = CreateAssessmentSchema.partial();

export const ListPublicAssessmentsQuerySchema = z.object({
  skill: z.string().optional(),
  level: z.nativeEnum(ExperienceLevel).optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const ListCompanyAssessmentsQuerySchema = z.object({
  status: z.nativeEnum(AssessmentStatus).optional(),
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const CreateVersionSchema = z.object({
  changeSummary: z.string().min(3).max(500),
});

export const RestoreVersionSchema = z.object({
  versionNumber: z.number().int().positive(),
});

export const SaveAsTemplateSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10),
  category: z.string().min(2).max(100),
  isGlobal: z.boolean().optional(),
});

export const AIJobRequestSchema = z.object({
  action: z.enum([
    'GENERATE_ASSESSMENT',
    'IMPROVE_ASSESSMENT',
    'REWRITE_INSTRUCTIONS',
    'GENERATE_RUBRIC',
    'SUGGEST_SKILLS',
    'SUGGEST_DELIVERABLES',
    'ESTIMATE_DIFFICULTY',
    'ESTIMATE_DURATION',
    'SUGGEST_LEARNING_OUTCOMES',
    'GENERATE_INTERVIEW_QUESTIONS',
    'GENERATE_EVALUATION_NOTES',
  ]),
  input: z.record(z.unknown()),
  context: z.string().optional(),
});

export const GenerateMicroTasksSchema = z.object({
  projectContext: z.string().min(10),
  techStack: z.string().min(2),
  difficulty: z.string().min(2),
});
