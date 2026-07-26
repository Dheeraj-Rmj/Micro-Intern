import { SubmissionStatus } from '@microintern/database';

import { createModuleLogger } from '@/core/logger.js';
import { TrialNotFoundError, TrialNotPublishedError } from '@/modules/trial/domain/errors/trial.errors.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import { MaxAttemptsExceededError, CandidateProfileNotFoundError } from '../../domain/errors/submission.errors.js';

import type { Submission } from '../../domain/entities/Submission.entity.js';
import type { ISubmissionRepository } from '../ports/ISubmissionRepository.js';
import type { GetProfileUseCase } from '@/modules/candidate/application/use-cases/get-profile.usecase.js';
import type { ITrialRepository } from '@/modules/trial/application/ports/ITrialRepository.js';

const log = createModuleLogger('StartTrialUseCase');

export class StartTrialUseCase {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly trialRepository: ITrialRepository,
    private readonly getProfileUseCase: GetProfileUseCase
  ) {}

  async execute(userId: string, trialId: string): Promise<Submission> {
    log.info({ userId, trialId }, 'Initiating skill assessment trial session');

    const profile = await this.getProfileUseCase.execute(userId);
    if (!profile) {
      throw new CandidateProfileNotFoundError(userId);
    }

    const trial = await this.trialRepository.findByIdOrSlug(trialId);
    if (!trial) {
      throw new TrialNotFoundError(trialId);
    }

    if (!trial.isPublished()) {
      throw new TrialNotPublishedError(trialId);
    }

    // Check if candidate already has an active session IN_PROGRESS
    const activeSubmission = await this.submissionRepository.findActiveByCandidateAndTrial(profile.id, trial.id);
    if (activeSubmission && activeSubmission.status === SubmissionStatus.IN_PROGRESS) {
      log.info({ submissionId: activeSubmission.id }, 'Resuming existing active trial session');
      return activeSubmission;
    }

    const attempts = await this.submissionRepository.countAttempts(profile.id, trial.id);
    if (attempts >= trial.maxAttempts) {
      throw new MaxAttemptsExceededError(trial.id, trial.maxAttempts);
    }

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + trial.durationMinutes * 60 * 1000);

    const submission = await this.submissionRepository.create({
      trialId: trial.id,
      candidateId: profile.id,
      status: SubmissionStatus.IN_PROGRESS,
      attemptNumber: attempts + 1,
      startedAt,
      expiresAt,
    });

    log.info({ submissionId: submission.id, attemptNumber: submission.attemptNumber, expiresAt }, 'Trial session successfully started');

    await eventBus.emit(DOMAIN_EVENTS.TRIAL_STARTED, {
      submissionId: submission.id,
      trialId: trial.id,
      candidateId: profile.id,
      startedAt,
      expiresAt,
    });

    return submission;
  }
}
