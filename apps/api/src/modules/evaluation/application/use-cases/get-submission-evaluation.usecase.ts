import { createModuleLogger } from '@/core/logger.js';
import { UnauthorizedError } from '@/shared/errors/index.js';

import { UnauthorizedEvaluationAccessError, EvaluationNotFoundError } from '../../domain/errors/evaluation.errors.js';
import { SubmissionNotFoundError } from '../../../submission/domain/errors/submission.errors.js';
import type { Evaluation } from '../../domain/entities/Evaluation.entity.js';
import type { IEvaluationRepository } from '../ports/IEvaluationRepository.js';
import type { ISubmissionRepository } from '../../../submission/application/ports/ISubmissionRepository.js';
import type { GetProfileUseCase } from '@/modules/candidate/application/use-cases/get-profile.usecase.js';

const log = createModuleLogger('GetSubmissionEvaluationUseCase');

export class GetSubmissionEvaluationUseCase {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly evaluationRepository: IEvaluationRepository,
    private readonly getProfileUseCase: GetProfileUseCase
  ) {}

  async execute(submissionId: string, requestingUserId: string): Promise<Evaluation> {
    log.info({ submissionId, requestingUserId }, 'Fetching submission AI evaluation results');

    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new SubmissionNotFoundError(submissionId);
    }

    const profile = await this.getProfileUseCase.execute(requestingUserId);
    if (profile && profile.id !== submission.candidateId) {
      // Ensure candidate requesting is the actual owner of this submission
      log.warn({ submissionId, requestingUserId }, 'Unauthorized attempt to inspect private evaluation');
      throw new UnauthorizedError('Not authorized to access evaluation results for this submission', 'FORBIDDEN');
    }

    const evaluation = await this.evaluationRepository.findBySubmissionId(submission.id);
    if (!evaluation) {
      throw new EvaluationNotFoundError(submission.id);
    }

    return evaluation;
  }
}
