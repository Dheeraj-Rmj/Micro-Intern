import { prisma } from '@/core/database.js';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('PromptVersioningService');

export interface IPromptExecutionRecord {
  assessmentId?: string;
  action: string;
  promptVersion: string;
  input: Record<string, any>;
  output: Record<string, any>;
  provider: string;
  model: string;
  temperature?: number;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costCents: number;
}

export class PromptVersioningService {
  /**
   * Record an immutable AI prompt execution log for audit, reproduction, and cost tracking.
   */
  public async recordExecution(record: IPromptExecutionRecord): Promise<any> {
    try {
      return await prisma.promptVersion.create({
        data: {
          assessmentId: record.assessmentId || null,
          action: record.action,
          promptVersion: record.promptVersion,
          input: record.input,
          output: record.output,
          provider: record.provider,
          model: record.model,
          temperature: record.temperature ?? 0.7,
          inputTokens: record.inputTokens,
          outputTokens: record.outputTokens,
          latencyMs: record.latencyMs,
          costCents: record.costCents,
        },
      });
    } catch (err) {
      log.error({ err, action: record.action }, 'Failed to record AI prompt version log');
      return null;
    }
  }

  /**
   * Get history of prompt executions for a Assessment or specific action.
   */
  public async listHistory(assessmentId?: string, action?: string): Promise<any[]> {
    return prisma.promptVersion.findMany({
      where: {
        ...(assessmentId ? { assessmentId } : {}),
        ...(action ? { action } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }
}

export const promptVersioningService = new PromptVersioningService();
