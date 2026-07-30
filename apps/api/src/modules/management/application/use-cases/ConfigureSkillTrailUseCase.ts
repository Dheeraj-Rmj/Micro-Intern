import { createModuleLogger } from '@/core/logger.js';
import { PrismaClient } from '@microintern/database';
import { z } from 'zod';

const log = createModuleLogger('ConfigureSkillTrailUseCase');

export const SkillTrailConfigSchema = z.object({
  aiGenerateQuestions: z.boolean().default(true),
  numberOfQuestions: z.number().min(1).max(100),
  assessmentDurationMinutes: z.number().min(10).max(300),
  difficultyDistribution: z.object({
    easy: z.number(),
    medium: z.number(),
    hard: z.number(),
  }),
  passingScore: z.number().min(0).max(100),
  requiredPerformance: z.enum(['Exceptional', 'Outstanding', 'Excellent', 'Above Average', 'Good', 'Average', 'Below Average', 'Needs Improvement']),
  autoEvaluate: z.boolean().default(true),
  aiRecommendTask: z.boolean().default(true),
  candidateFeedback: z.object({
    enableLearningPlan: z.boolean().default(true),
    enableWeakSkillAnalysis: z.boolean().default(true),
    enableAlternativeRoles: z.boolean().default(true),
  }),
});

export type SkillTrailConfigurationType = z.infer<typeof SkillTrailConfigSchema>;

export type ConfigureSkillTrailInput = {
  companyId: string;
  roleProfileId: string;
  title: string;
  configuration: SkillTrailConfigurationType;
};

/**
 * Phase 5 Skill Trail Configuration:
 * Allows a recruiter to define exact parameters for AI assessment generation,
 * passing rules, and candidate feedback rules for a specific Role Profile.
 */
export class ConfigureSkillTrailUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: ConfigureSkillTrailInput): Promise<any> {
    log.info({ companyId: input.companyId, roleProfileId: input.roleProfileId }, 'Configuring Skill Trail');

    // 1. Validate the Configuration payload exactly
    const validConfig = SkillTrailConfigSchema.parse(input.configuration);

    // 2. Ensure total questions match the difficulty distribution
    const totalDiff = validConfig.difficultyDistribution.easy + validConfig.difficultyDistribution.medium + validConfig.difficultyDistribution.hard;
    if (totalDiff !== validConfig.numberOfQuestions) {
      throw new Error(`Difficulty distribution sum (${totalDiff}) does not match numberOfQuestions (${validConfig.numberOfQuestions})`);
    }

    try {
      // 3. Upsert the SkillTrail and its Configuration
      const skillTrail = await this.prisma.$transaction(async (tx) => {
        let trail = await tx.skillTrail.findUnique({
          where: { roleProfileId: input.roleProfileId },
        });

        if (!trail) {
          trail = await tx.skillTrail.create({
            data: {
              companyId: input.companyId,
              roleProfileId: input.roleProfileId,
              title: input.title,
            },
          });
        }

        const config = await tx.skillTrailConfiguration.upsert({
          where: { skillTrailId: trail.id },
          create: {
            skillTrailId: trail.id,
            rulesJson: validConfig as any,
          },
          update: {
            rulesJson: validConfig as any,
          },
        });

        return { ...trail, configuration: config };
      });

      log.info('Successfully configured Skill Trail');
      return skillTrail;
    } catch (error) {
      log.error({ err: error }, 'Failed to configure Skill Trail');
      throw new Error('Database error configuring Skill Trail');
    }
  }
}
