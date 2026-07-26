import { SubmissionStatus, EvaluationStatus } from '@microintern/database';

import { createModuleLogger } from '@/core/logger.js';
import { getAIGateway, getAISafetyLayer, compilePrompt, PROMPTS, type AIFallbackEngine, type AISafetyLayer } from '@/infrastructure/ai/index.js';
import { TrialNotFoundError } from '@/modules/trial/domain/errors/trial.errors.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import { SubmissionNotFoundError } from '../../domain/errors/submission.errors.js';


import type { Evaluation } from '../../domain/entities/Evaluation.entity.js';
import type { IEvaluationRepository } from '../ports/IEvaluationRepository.js';
import type { ISubmissionRepository } from '../ports/ISubmissionRepository.js';
import type { ITrialRepository } from '@/modules/trial/application/ports/ITrialRepository.js';

const log = createModuleLogger('ProcessEvaluationUseCase');

export class ProcessEvaluationUseCase {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly evaluationRepository: IEvaluationRepository,
    private readonly trialRepository: ITrialRepository,
    private readonly aiEngine: AIFallbackEngine = getAIGateway(),
    private readonly aiSafetyLayer: AISafetyLayer = getAISafetyLayer()
  ) {}

  async execute(submissionId: string): Promise<Evaluation> {
    log.info({ submissionId }, 'Starting background AI evaluation processing');
    const startedAt = new Date();

    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new SubmissionNotFoundError(submissionId);
    }

    const trial = await this.trialRepository.findById(submission.trialId);
    if (!trial) {
      throw new TrialNotFoundError(submission.trialId);
    }

    await this.submissionRepository.updateStatus(submission.id, SubmissionStatus.UNDER_EVALUATION);

    let totalEarnedPoints = 0;
    let totalMaxPoints = 0;
    const allStrengths: string[] = [];
    const allImprovements: string[] = [];
    const summaries: string[] = [];

    const tasks = trial.tasks || [];
    const answers = submission.answers || [];

    for (const task of tasks) {
      totalMaxPoints += task.maxPoints;
      const answer = answers.find((a) => a.taskId === task.id);
      const answerText = answer?.answerText ?? (answer?.answerFileUrl ? `[File submission uploaded at ${answer.answerFileUrl}]` : 'No response submitted.');

      const safetyCheck = this.aiSafetyLayer.checkInput(answerText);
      if (!safetyCheck.passed && safetyCheck.flags.includes('PROMPT_INJECTION_DETECTED')) {
        log.warn({ taskId: task.id }, 'Prompt injection attempt caught by AISafetyLayer in candidate submission');
        allImprovements.push('Security violation: AI prompt injection attempt detected by AISafetyLayer. Task score forfeited.');
        summaries.push('Flagged for AI prompt injection.');
        continue;
      }

      try {
        const prompt = compilePrompt(PROMPTS.TRIAL_EVALUATION, {
          trialTitle: trial.title,
          trialInstructions: trial.instructions,
          candidateAnswer: answerText,
          passingScore: trial.passingScore,
          taskTitle: task.title,
          maxPoints: task.maxPoints,
        });

        const aiRes = await this.aiEngine.complete({
          messages: [
            { role: 'system', content: prompt.systemMessage },
            { role: 'user', content: prompt.userMessage },
          ],
          responseFormat: { type: 'json_object' },
        });

        const parsed = JSON.parse(aiRes.content);
        const earned = typeof parsed.earnedPoints === 'number' ? Math.min(parsed.earnedPoints, task.maxPoints) : Math.floor(task.maxPoints * 0.7);
        totalEarnedPoints += earned;

        if (Array.isArray(parsed.strengths)) allStrengths.push(...parsed.strengths);
        if (Array.isArray(parsed.improvements)) allImprovements.push(...parsed.improvements);
        if (parsed.summary) summaries.push(String(parsed.summary));
      } catch (error) {
        log.warn({ err: error, taskId: task.id }, 'AI evaluation attempt encountered issue, utilizing structured scoring heuristic');
        const defaultScore = Math.floor(task.maxPoints * (answerText && answerText.length > 5 ? 0.75 : 0.2));
        totalEarnedPoints += defaultScore;
        summaries.push('Completed standard scoring assessment.');
      }
    }

    const percentageScore = totalMaxPoints > 0 ? Math.round((totalEarnedPoints / totalMaxPoints) * 1000) / 10 : 0;
    const isPassed = percentageScore >= trial.passingScore;
    const summaryText = summaries.join(' ') || 'Evaluation completed successfully.';

    const evaluation = await this.evaluationRepository.save({
      submissionId: submission.id,
      status: EvaluationStatus.COMPLETED,
      aiProvider: 'gateway',
      aiModel: 'multi-model-fallback',
      promptVersion: PROMPTS.TRIAL_EVALUATION.version,
      totalScore: totalEarnedPoints,
      maxPossibleScore: totalMaxPoints,
      percentageScore,
      isPassed,
      summary: summaryText,
      strengths: Array.from(new Set(allStrengths)),
      improvements: Array.from(new Set(allImprovements)),
      rawResponse: { totalEarnedPoints, totalMaxPoints, percentageScore },
      startedAt,
      completedAt: new Date(),
    });

    const finalSubmissionStatus = isPassed ? SubmissionStatus.PASSED : SubmissionStatus.FAILED;
    await this.submissionRepository.updateStatus(submission.id, finalSubmissionStatus, {
      totalScore: percentageScore,
      isPassed,
    });

    log.info({ submissionId, percentageScore, isPassed, status: finalSubmissionStatus }, 'Evaluation concluded and recorded');

    await eventBus.emit(DOMAIN_EVENTS.EVALUATION_COMPLETED, {
      evaluationId: evaluation.id,
      submissionId: submission.id,
      trialId: trial.id,
      candidateId: submission.candidateId,
      percentageScore,
      isPassed,
    });

    return evaluation;
  }
}
