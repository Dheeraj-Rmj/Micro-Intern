import { createModuleLogger } from '@/core/logger.js';
import { PROMPTS, compilePrompt } from '@/infrastructure/ai/PromptManager.js';
import type { AIFallbackEngine } from '@/infrastructure/ai/AIFallbackEngine.js';

const log = createModuleLogger('GenerateCareerRecommendationsUseCase');

export type GenerateCareerRecommendationsInput = {
  candidateId: string;
  appliedRole: string;
  verifiedSkills: string[];
};

export type AlternativeRole = {
  role: string;
  matchPercentage: number;
  reasoning: string;
};

export type GenerateCareerRecommendationsOutput = {
  alternativeRoles: AlternativeRole[];
};

/**
 * Phase 4 Candidate Recovery Engine:
 * Recommends alternative careers/roles to a rejected candidate based on their verified skills.
 */
export class GenerateCareerRecommendationsUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(input: GenerateCareerRecommendationsInput): Promise<GenerateCareerRecommendationsOutput> {
    log.info({ candidateId: input.candidateId }, 'Generating Career Recommendations');

    try {
      const prompt = compilePrompt(PROMPTS.CANDIDATE_CAREER_RECOMMENDATIONS, {
        appliedRole: input.appliedRole,
        verifiedSkills: JSON.stringify(input.verifiedSkills),
      });

      const response = await this.aiEngine.complete({
        messages: [
          { role: 'system', content: prompt.systemMessage },
          { role: 'user', content: prompt.userMessage },
        ],
        responseFormat: { type: 'json_object' },
      });

      const parsed = JSON.parse(response.content) as GenerateCareerRecommendationsOutput;

      if (!parsed.alternativeRoles || !Array.isArray(parsed.alternativeRoles)) {
        throw new Error('AI returned invalid JSON structure for Career Recommendations');
      }

      log.info('Successfully generated career recommendations');
      return parsed;
    } catch (error) {
      log.error({ err: error }, 'Failed to generate career recommendations');
      throw new Error('Failed to generate career recommendations using AI');
    }
  }
}
