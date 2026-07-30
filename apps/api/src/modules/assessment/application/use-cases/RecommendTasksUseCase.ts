import { DomainError } from '@/shared/errors/index.js';
import { createModuleLogger } from '@/core/logger.js';
// Re-using the prompt manager, though we'd typically have a specific prompt for this
import { compilePrompt } from '@/infrastructure/ai/PromptManager.js';
import type { AIFallbackEngine } from '@/infrastructure/ai/AIFallbackEngine.js';

const log = createModuleLogger('RecommendTasksUseCase');

export type RecommendTasksInput = {
  candidateId: string;
  roleProfileId: string;
  verifiedCompetencies: string[];
  roleRequiredCompetencies: string[];
};

export type RecommendedTask = {
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedTimeMins: number;
  skillsCovered: string[];
  confidenceScore: number;
  reasoning: string;
};

export type RecommendTasksOutput = {
  recommendedTasks: RecommendedTask[];
};

/**
 * Phase 2 Intelligence Layer:
 * Recommends the next best assessment task for a candidate based on skill gaps.
 */
export class RecommendTasksUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(input: RecommendTasksInput): Promise<RecommendTasksOutput> {
    log.info({ candidateId: input.candidateId }, 'Recommending tasks via AI');

    try {
      // In a real implementation, this would use a dedicated prompt from PromptManager
      const systemMessage = `You are an AI Task Recommendation Engine.
Analyze the candidate's verified competencies against the role requirements.
Recommend 2 assessment tasks that target the candidate's largest skill gaps.
Always respond with valid JSON matching the schema: { "recommendedTasks": [ { "title": "...", "description": "...", "difficulty": "...", "estimatedTimeMins": number, "skillsCovered": ["..."], "confidenceScore": number, "reasoning": "..." } ] }`;

      const userMessage = `Candidate Verified Skills: ${JSON.stringify(input.verifiedCompetencies)}
Role Required Skills: ${JSON.stringify(input.roleRequiredCompetencies)}`;

      const response = await this.aiEngine.complete({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        responseFormat: { type: 'json_object' },
      });

      const parsed = JSON.parse(response.content) as RecommendTasksOutput;

      if (!parsed.recommendedTasks || !Array.isArray(parsed.recommendedTasks)) {
        throw new Error('AI returned invalid JSON structure for task recommendations');
      }

      log.info(
        {
          candidateId: input.candidateId,
          recommendationCount: parsed.recommendedTasks.length,
        },
        'Successfully generated task recommendations',
      );

      return parsed;
    } catch (error) {
      log.error({ err: error }, 'Failed to recommend tasks');
      throw new Error('Failed to recommend assessment tasks using AI');
    }
  }
}
