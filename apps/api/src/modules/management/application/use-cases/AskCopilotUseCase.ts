import { PrismaClient } from '@microintern/database';
import { createModuleLogger } from '@/core/logger.js';
import { PROMPTS, compilePrompt } from '@/infrastructure/ai/PromptManager.js';
import { AIFallbackEngine } from '@/infrastructure/ai/AIFallbackEngine.js';

const log = createModuleLogger('AskCopilotUseCase');

export class AskCopilotUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly aiEngine: AIFallbackEngine
  ) {}

  public async execute(companyId: string, recruiterQuery: string): Promise<any[]> {
    log.info({ companyId, query: recruiterQuery }, 'AI Copilot analyzing recruiter request...');

    const { systemMessage, userMessage } = compilePrompt(PROMPTS.COPILOT_QUERY_GENERATOR, {
      recruiterQuery,
      companyId,
    });

    try {
      const response = await this.aiEngine.complete({
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.1,
        responseFormat: { type: 'json_object' }
      });

      const responseText = response.content;
      const whereClause = JSON.parse(responseText);
      
      log.info({ whereClause }, 'Generated Prisma where clause from Copilot');

      // Execute the query safely
      // In production, we'd want to validate this `whereClause` strictly or restrict fields.
      const candidates = await this.prisma.candidateProfile.findMany({
        where: whereClause,
        include: {
          user: true
        },
        take: 20 // limit results for safety
      });

      log.info({ count: candidates.length }, 'Copilot query returned results.');
      return candidates;

    } catch (error) {
      log.error({ err: error, companyId }, 'Copilot failed to execute query');
      throw error;
    }
  }
}
