import { prisma } from '@/core/database.js';
import { createModuleLogger } from '@/core/logger.js';
import { DomainEventDispatcher } from '@/core/events/DomainEventDispatcher.js';

const log = createModuleLogger('EvaluationEngine');

export type HiringDecisionType = 'STRONGLY_HIRE' | 'HIRE' | 'NO_HIRE' | 'PENDING_REVIEW';

export interface IEvaluationEngine {
  addReviewerScore(
    evaluationId: string,
    reviewerId: string,
    taskId: string,
    score: number,
    maxScore?: number,
    weight?: number,
    notes?: string,
    criteriaId?: string,
  ): Promise<any>;
  calculateCompetencyScores(evaluationId: string): Promise<any[]>;
  computeHiringRecommendation(evaluationId: string): Promise<{
    decision: HiringDecisionType;
    totalScore: number;
    passed: boolean;
  }>;
}

export class EvaluationEngine implements IEvaluationEngine {
  /**
   * Record an individual reviewer score for a task or rubric criterion.
   */
  public async addReviewerScore(
    evaluationId: string,
    reviewerId: string,
    taskId: string,
    score: number,
    maxScore = 100,
    weight = 1.0,
    notes?: string,
    criteriaId?: string,
  ): Promise<any> {
    const record = await prisma.reviewerScore.create({
      data: {
        evaluationId,
        reviewerId,
        taskId,
        criteriaId: criteriaId || null,
        score,
        maxScore,
        weight,
        notes: notes || null,
      },
    });

    // Recalculate evaluation outcome
    await this.calculateCompetencyScores(evaluationId);
    await this.computeHiringRecommendation(evaluationId);

    return record;
  }

  /**
   * Automatically compute and upsert `CompetencyScore` records based on criteria/task mappings.
   */
  public async calculateCompetencyScores(evaluationId: string): Promise<any[]> {
    const evaluation = await prisma.evaluation.findUnique({
      where: { id: evaluationId },
      include: {
        submission: {
          include: { assessment: true },
        },
      },
    });

    if (!evaluation) {
      log.warn({ evaluationId }, 'Evaluation not found during competency score calculation');
      return [];
    }

    const assessmentId = evaluation.submission.assessmentId;

    // Load all competency mappings for the assessment
    const mappings = await prisma.competencyMapping.findMany({
      where: { assessmentId },
      include: { competency: true },
    });

    // Load all reviewer scores for the evaluation
    const reviewerScores = await prisma.reviewerScore.findMany({
      where: { evaluationId },
    });

    const competencyTotals: Record<
      string,
      { competencyId: string; totalScore: number; totalMax: number; count: number }
    > = {};

    for (const score of reviewerScores) {
      // Find mappings matching taskId or criteriaId
      const matching = mappings.filter(
        (m) =>
          (score.criteriaId && m.criteriaId === score.criteriaId) ||
          (score.taskId && m.taskId === score.taskId),
      );

      for (const m of matching) {
        if (!competencyTotals[m.competencyId]) {
          competencyTotals[m.competencyId] = {
            competencyId: m.competencyId,
            totalScore: 0,
            totalMax: 0,
            count: 0,
          };
        }
        competencyTotals[m.competencyId]!.totalScore += score.score * score.weight;
        competencyTotals[m.competencyId]!.totalMax += score.maxScore * score.weight;
        competencyTotals[m.competencyId]!.count += 1;
      }
    }

    // Upsert competency scores
    const results: any[] = [];
    for (const [compKey, agg] of Object.entries(competencyTotals)) {
      const percentage =
        agg.totalMax > 0 ? Number(((agg.totalScore / agg.totalMax) * 100).toFixed(1)) : 0;

      const saved = await prisma.competencyScore.create({
        data: {
          evaluationId,
          competencyId: compKey,
          score: Number(agg.totalScore.toFixed(1)),
          maxScore: Number(agg.totalMax.toFixed(1)),
          percentage,
          notes: `Computed across ${agg.count} reviewer evaluations`,
        },
      });
      results.push(saved);
    }

    return results;
  }

  /**
   * Compute overall weighted score and Hiring Recommendation.
   */
  public async computeHiringRecommendation(evaluationId: string): Promise<{
    decision: HiringDecisionType;
    totalScore: number;
    passed: boolean;
  }> {
    const scores = await prisma.reviewerScore.findMany({
      where: { evaluationId },
    });

    if (scores.length === 0) {
      return {
        decision: 'PENDING_REVIEW',
        totalScore: 0,
        passed: false,
      };
    }

    let weightedSum = 0;
    let totalWeight = 0;

    for (const sc of scores) {
      const pct = (sc.score / (sc.maxScore || 100)) * 100;
      weightedSum += pct * sc.weight;
      totalWeight += sc.weight;
    }

    const averagePercentage = totalWeight > 0 ? Number((weightedSum / totalWeight).toFixed(1)) : 0;

    let decision: HiringDecisionType = 'NO_HIRE';
    let passed = false;

    if (averagePercentage >= 85) {
      decision = 'STRONGLY_HIRE';
      passed = true;
    } else if (averagePercentage >= 70) {
      decision = 'HIRE';
      passed = true;
    } else {
      decision = 'NO_HIRE';
      passed = false;
    }

    await prisma.evaluation.update({
      where: { id: evaluationId },
      data: {
        totalScore: averagePercentage,
        decision,
        updatedAt: new Date(),
      },
    });

    await DomainEventDispatcher.getInstance().dispatch({
      eventName: 'EvaluationCompleted',
      entityType: 'EVALUATION',
      entityId: evaluationId,
      metadata: { totalScore: averagePercentage, decision, passed },
    });

    log.info(
      { evaluationId, averagePercentage, decision },
      'Computed hiring recommendation decision',
    );

    return {
      decision,
      totalScore: averagePercentage,
      passed,
    };
  }
}

export const evaluationEngine = new EvaluationEngine();
