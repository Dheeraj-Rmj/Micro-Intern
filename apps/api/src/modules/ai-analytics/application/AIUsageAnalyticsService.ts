import { prisma } from '@/core/database.js';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('AIUsageAnalyticsService');

export interface IAIUsageMetricInput {
  companyId?: string;
  recruiterId?: string;
  assessmentId?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
  costCents: number;
  success?: boolean;
  errorMessage?: string;
  retryCount?: number;
}

export class AIUsageAnalyticsService {
  /**
   * Log an AI usage metric entry.
   */
  public async recordMetric(data: IAIUsageMetricInput): Promise<any> {
    try {
      return await prisma.aIUsageMetric.create({
        data: {
          companyId: data.companyId || null,
          recruiterId: data.recruiterId || null,
          assessmentId: data.assessmentId || null,
          provider: data.provider,
          model: data.model,
          inputTokens: data.inputTokens,
          outputTokens: data.outputTokens,
          latencyMs: data.latencyMs,
          costCents: data.costCents,
          success: data.success ?? true,
          errorMessage: data.errorMessage || null,
          retryCount: data.retryCount ?? 0,
        },
      });
    } catch (err) {
      log.error({ err }, 'Failed to record AI usage metric');
      return null;
    }
  }

  /**
   * Summarize AI consumption by Company, Recruiter, or Assessment.
   */
  public async getSummary(filter: {
    companyId?: string;
    recruiterId?: string;
    assessmentId?: string;
  }): Promise<{
    totalCalls: number;
    totalInputTokens: number;
    totalOutputTokens: number;
    totalCostCents: number;
    averageLatencyMs: number;
    failureRate: number;
  }> {
    const metrics = await prisma.aIUsageMetric.findMany({
      where: {
        ...(filter.companyId ? { companyId: filter.companyId } : {}),
        ...(filter.recruiterId ? { recruiterId: filter.recruiterId } : {}),
        ...(filter.assessmentId ? { assessmentId: filter.assessmentId } : {}),
      },
    });

    if (metrics.length === 0) {
      return {
        totalCalls: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalCostCents: 0,
        averageLatencyMs: 0,
        failureRate: 0,
      };
    }

    let totalInput = 0;
    let totalOutput = 0;
    let totalCost = 0;
    let totalLatency = 0;
    let failures = 0;

    for (const m of metrics) {
      totalInput += m.inputTokens;
      totalOutput += m.outputTokens;
      totalCost += m.costCents;
      totalLatency += m.latencyMs;
      if (!m.success) failures++;
    }

    return {
      totalCalls: metrics.length,
      totalInputTokens: totalInput,
      totalOutputTokens: totalOutput,
      totalCostCents: Number(totalCost.toFixed(2)),
      averageLatencyMs: Math.round(totalLatency / metrics.length),
      failureRate: Number(((failures / metrics.length) * 100).toFixed(1)),
    };
  }
}

export const aiUsageAnalyticsService = new AIUsageAnalyticsService();
