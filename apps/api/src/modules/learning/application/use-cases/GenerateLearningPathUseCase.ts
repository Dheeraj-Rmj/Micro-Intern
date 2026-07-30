import { createModuleLogger } from '@/core/logger.js';
import { PROMPTS, compilePrompt } from '@/infrastructure/ai/PromptManager.js';
import type { AIFallbackEngine } from '@/infrastructure/ai/AIFallbackEngine.js';

const log = createModuleLogger('GenerateLearningPathUseCase');

export type GenerateLearningPathInput = {
  candidateId: string;
  weakSkills: string[];
  missingCompetencies: string[];
};

export type LearningRecommendation = {
  skill: string;
  resources: string[];
  estimatedLearningDays: number;
};

export type PracticeProject = {
  title: string;
  description: string;
  targetSkills: string[];
  difficulty: string;
  estimatedDays: number;
};

export type GenerateLearningPathOutput = {
  learningRecommendations: LearningRecommendation[];
  practiceProject: PracticeProject;
  recommendedSkillTrails: string[];
};

/**
 * Phase 4 Candidate Recovery Engine:
 * Generates highly specific learning recommendations, practice projects, and skill trails.
 */
export class GenerateLearningPathUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(input: GenerateLearningPathInput): Promise<GenerateLearningPathOutput> {
    log.info({ candidateId: input.candidateId }, 'Generating personalized learning path via AI');

    try {
      const prompt = compilePrompt(PROMPTS.CANDIDATE_LEARNING_RECOMMENDATIONS, {
        weakSkills: JSON.stringify(input.weakSkills),
        missingCompetencies: JSON.stringify(input.missingCompetencies),
      });

      const response = await this.aiEngine.complete({
        messages: [
          { role: 'system', content: prompt.systemMessage },
          { role: 'user', content: prompt.userMessage },
        ],
        responseFormat: { type: 'json_object' },
      });

      const parsed = JSON.parse(response.content) as GenerateLearningPathOutput;

      if (!parsed.learningRecommendations || !Array.isArray(parsed.learningRecommendations)) {
        throw new Error('AI returned invalid JSON structure for learning path');
      }

      log.info('Successfully generated learning path');
      return parsed;
    } catch (error) {
      log.error({ err: error }, 'Failed to generate learning path');
      throw new Error('Failed to generate personalized learning path using AI');
    }
  }
}
