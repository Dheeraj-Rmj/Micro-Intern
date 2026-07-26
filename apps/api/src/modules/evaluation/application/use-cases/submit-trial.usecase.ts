import { SubmissionStatus } from '@microintern/database';
import { StorageBucket } from '@microintern/shared';

import { createModuleLogger } from '@/core/logger.js';
import { queues } from '@/infrastructure/queue/queues.js';
import { StorageService, getStorageService } from '@/infrastructure/storage/StorageService.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

import { SubmissionNotFoundError, CandidateProfileNotFoundError } from '../../domain/errors/submission.errors.js';


import type { Submission } from '../../domain/entities/Submission.entity.js';
import type { ISubmissionRepository, SaveAnswerData } from '../ports/ISubmissionRepository.js';
import type { GetProfileUseCase } from '@/modules/candidate/application/use-cases/get-profile.usecase.js';

const log = createModuleLogger('SubmitTrialUseCase');

export interface SubmitAnswerInput {
  taskId: string;
  answerText?: string;
  fileBuffer?: Buffer;
  fileName?: string;
  fileMimeType?: string;
  answerData?: Record<string, unknown>;
}

export class SubmitTrialUseCase {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly getProfileUseCase: GetProfileUseCase,
    private readonly storageService: StorageService = getStorageService()
  ) {}

  async execute(userId: string, trialId: string, answersInput: SubmitAnswerInput[]): Promise<Submission> {
    log.info({ userId, trialId, answerCount: answersInput.length }, 'Processing candidate trial submission');

    const profile = await this.getProfileUseCase.execute(userId);
    if (!profile) {
      throw new CandidateProfileNotFoundError(userId);
    }

    const submission = await this.submissionRepository.findActiveByCandidateAndTrial(profile.id, trialId);
    if (!submission) {
      throw new SubmissionNotFoundError(`Active session for trial ${trialId}`);
    }

    // Enforce timer expiration rules and terminal state guards
    submission.validateCanSubmit(new Date());

    const formattedAnswers: SaveAnswerData[] = [];
    for (const item of answersInput) {
      let answerFileUrl: string | undefined = undefined;

      if (item.fileBuffer && item.fileName) {
        const fileKey = StorageService.generateKey('submissions', submission.id, item.fileName);
        const uploadRes = await this.storageService.upload({
          key: fileKey,
          data: item.fileBuffer,
          mimeType: item.fileMimeType ?? 'application/octet-stream',
          bucket: StorageBucket.PRIVATE,
        });
        answerFileUrl = uploadRes.key;
        log.info({ taskId: item.taskId, fileKey }, 'Uploaded solution file to private bucket');
      }

      formattedAnswers.push({
        taskId: item.taskId,
        answerText: item.answerText,
        answerFileUrl,
        answerData: item.answerData,
      });
    }

    await this.submissionRepository.saveAnswers(submission.id, formattedAnswers);
    const submitted = await this.submissionRepository.updateStatus(
      submission.id,
      SubmissionStatus.SUBMITTED,
      { submittedAt: new Date() }
    );

    log.info({ submissionId: submitted.id }, 'Submission recorded, enqueuing BullMQ AI evaluation job');

    // Fast endpoint design: Add job to queue immediately and emit domain event
    await queues.aiEvaluation.add('evaluate-submission', {
      submissionId: submitted.id,
      trialId: submitted.trialId,
      candidateId: submitted.candidateId,
    });

    await eventBus.emit(DOMAIN_EVENTS.TRIAL_SUBMITTED, {
      submissionId: submitted.id,
      trialId: submitted.trialId,
      candidateId: submitted.candidateId,
      submittedAt: submitted.submittedAt,
    });

    return submitted;
  }
}
