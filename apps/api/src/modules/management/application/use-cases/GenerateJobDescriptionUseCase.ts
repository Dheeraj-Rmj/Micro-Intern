import { createModuleLogger } from '@/core/logger.js';
import { compilePrompt, PROMPTS } from '@/infrastructure/ai/PromptManager.js';
import type { PrismaClient } from '@microintern/database';
import type { AIFallbackEngine } from '@/infrastructure/ai/AIFallbackEngine.js';

const log = createModuleLogger('JobDescriptionService');

export type GenerateJobDescriptionDTO = {
  roleName: string;
  companyId: string;
  companyName: string;
  companyIndustry: string;
  keyResponsibilities: string;
  additionalContext?: string;
};

export class JobDescriptionService {
  constructor(
    private readonly db: PrismaClient,
    private readonly aiEngine: AIFallbackEngine,
  ) {}

  async generateJobDescription(dto: GenerateJobDescriptionDTO) {
    log.info({ roleName: dto.roleName, companyId: dto.companyId }, 'Generating AI job description');

    const { systemMessage, userMessage } = compilePrompt(PROMPTS.JOB_DESCRIPTION_GENERATOR, {
      roleName: dto.roleName,
      companyName: dto.companyName,
      companyIndustry: dto.companyIndustry,
      keyResponsibilities: dto.keyResponsibilities,
      additionalContext: dto.additionalContext ?? 'None provided',
    });

    const aiResponse = await this.aiEngine.complete({
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      responseFormat: { type: 'json_object' } as const,
      temperature: 0.6,
    });

    let result: any = {};
    try {
      result = JSON.parse(aiResponse.content);
    } catch {
      log.warn('Failed to parse AI job description response');
      return { error: 'AI parsing failed', raw: aiResponse.content };
    }

    log.info({ roleName: dto.roleName }, 'Job description generated successfully');
    return {
      jobTitle: result.jobTitle ?? dto.roleName,
      jobDescription: result.jobDescription ?? '',
      seniority: result.seniority ?? 'Mid',
      suggestedSkills: result.suggestedSkills ?? [],
      suggestedCompetencies: result.suggestedCompetencies ?? [],
      estimatedSalaryRange: result.estimatedSalaryRange ?? null,
      workType: result.workType ?? 'Hybrid',
    };
  }
}
