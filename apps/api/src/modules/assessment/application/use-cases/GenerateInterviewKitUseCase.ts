import { createModuleLogger } from '@/core/logger.js';
import { PROMPTS, compilePrompt } from '@/infrastructure/ai/PromptManager.js';
import type { AIFallbackEngine } from '@/infrastructure/ai/AIFallbackEngine.js';

const log = createModuleLogger('GenerateInterviewKitUseCase');

export type GenerateInterviewKitInput = {
  roleProfile: string;
  competencies: string[];
};

export type InterviewQuestion = {
  type: 'Technical' | 'Behavioral' | 'Situational';
  question: string;
  expectedAnswer: string;
  rubric: string[];
  difficulty: 'Medium' | 'Hard';
  competencyTargeted: string;
  timeEstimateMins: number;
};

export type GenerateInterviewKitOutput = {
  interviewKit: {
    title: string;
    questions: InterviewQuestion[];
  };
};

/**
 * Phase 3 AI OS:
 * Generates an automated interview kit with questions, expected answers, and evaluation rubrics.
 */
export class GenerateInterviewKitUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(input: GenerateInterviewKitInput): Promise<GenerateInterviewKitOutput> {
    log.info({ roleProfile: input.roleProfile }, 'Generating AI Interview Kit');

    try {
      const prompt = compilePrompt(PROMPTS.INTERVIEW_KIT_GENERATOR, {
        roleProfile: input.roleProfile,
        competencies: JSON.stringify(input.competencies),
      });

      const response = await this.aiEngine.complete({
        messages: [
          { role: 'system', content: prompt.systemMessage },
          { role: 'user', content: prompt.userMessage },
        ],
        responseFormat: { type: 'json_object' },
      });

      const parsed = JSON.parse(response.content) as GenerateInterviewKitOutput;

      if (!parsed.interviewKit || !Array.isArray(parsed.interviewKit.questions)) {
        throw new Error('AI returned invalid JSON structure for Interview Kit');
      }

      log.info('Successfully generated interview kit');
      return parsed;
    } catch (error) {
      log.error({ err: error }, 'Failed to generate interview kit');
      throw new Error('Failed to generate interview kit using AI');
    }
  }
}
