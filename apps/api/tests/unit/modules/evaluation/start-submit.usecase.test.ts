import { SubmissionStatus, TrialStatus } from '@microintern/database';
import { StorageBucket } from '@microintern/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { queues } from '@/infrastructure/queue/queues.js';
import { StartTrialUseCase } from '@/modules/evaluation/application/use-cases/start-trial.usecase.js';
import { SubmitTrialUseCase } from '@/modules/evaluation/application/use-cases/submit-trial.usecase.js';
import { MaxAttemptsExceededError } from '@/modules/evaluation/domain/errors/submission.errors.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

vi.mock('@/infrastructure/queue/queues.js', () => ({
  queues: {
    aiEvaluation: {
      add: vi.fn().mockResolvedValue({ id: 'job-1' }),
    },
  },
}));

describe('StartTrialUseCase & SubmitTrialUseCase', () => {
  let startUseCase: StartTrialUseCase;
  let submitUseCase: SubmitTrialUseCase;
  let mockSubRepo: any;
  let mockTrialRepo: any;
  let mockGetProfileUseCase: any;
  let mockStorageService: any;

  beforeEach(() => {
    mockSubRepo = {
      findActiveByCandidateAndTrial: vi.fn(),
      countAttempts: vi.fn(),
      create: vi.fn().mockImplementation(async (data) => ({
        id: 'sub-created',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
      saveAnswers: vi.fn().mockResolvedValue([]),
      updateStatus: vi.fn().mockImplementation(async (id, status, meta) => ({
        id,
        status,
        ...meta,
        trialId: 'trial-1',
        candidateId: 'cand-1',
        validateCanSubmit: vi.fn(),
      })),
    };

    mockTrialRepo = {
      findByIdOrSlug: vi.fn().mockResolvedValue({
        id: 'trial-1',
        status: TrialStatus.PUBLISHED,
        maxAttempts: 2,
        durationMinutes: 60,
        isPublished: () => true,
      }),
    };

    mockGetProfileUseCase = {
      execute: vi.fn().mockResolvedValue({ id: 'cand-1', userId: 'user-1' }),
    };

    mockStorageService = {
      upload: vi.fn().mockResolvedValue({
        key: 'submissions/sub-created/file123.zip',
        bucket: 'private',
        url: '',
        etag: 'etag123',
        sizeBytes: 1024,
      }),
    };

    startUseCase = new StartTrialUseCase(mockSubRepo, mockTrialRepo, mockGetProfileUseCase);
    submitUseCase = new SubmitTrialUseCase(mockSubRepo, mockGetProfileUseCase, mockStorageService);

    vi.spyOn(eventBus, 'emit').mockResolvedValue(undefined);
    vi.spyOn(queues.aiEvaluation, 'add').mockResolvedValue({ id: 'job-1' } as any);
  });

  it('should throw MaxAttemptsExceededError if candidate already reached max attempts on StartTrialUseCase', async () => {
    mockSubRepo.findActiveByCandidateAndTrial.mockResolvedValue(null);
    mockSubRepo.countAttempts.mockResolvedValue(2); // trial maxAttempts is 2

    await expect(startUseCase.execute('user-1', 'trial-1')).rejects.toThrow(MaxAttemptsExceededError);
  });

  it('should start a session, compute expiresAt based on durationMinutes, and emit TRIAL_STARTED', async () => {
    mockSubRepo.findActiveByCandidateAndTrial.mockResolvedValue(null);
    mockSubRepo.countAttempts.mockResolvedValue(0);

    const res = await startUseCase.execute('user-1', 'trial-1');
    expect(res.status).toBe(SubmissionStatus.IN_PROGRESS);
    expect(res.expiresAt).toBeDefined();
    expect(eventBus.emit).toHaveBeenCalledWith(DOMAIN_EVENTS.TRIAL_STARTED, expect.any(Object));
  });

  it('should upload solution files to PRIVATE storage, save answers, transition to SUBMITTED, and enqueue BullMQ job', async () => {
    const mockActiveSubmission = {
      id: 'sub-created',
      trialId: 'trial-1',
      candidateId: 'cand-1',
      status: SubmissionStatus.IN_PROGRESS,
      validateCanSubmit: vi.fn(),
    };
    mockSubRepo.findActiveByCandidateAndTrial.mockResolvedValue(mockActiveSubmission);

    const answersInput = [
      { taskId: 'task-1', answerText: 'Explain vertical scaling and read replicas.' },
      { taskId: 'task-2', fileBuffer: Buffer.from('mock zip code'), fileName: 'solution.zip', fileMimeType: 'application/zip' },
    ];

    const res = await submitUseCase.execute('user-1', 'trial-1', answersInput);

    expect(mockActiveSubmission.validateCanSubmit).toHaveBeenCalled();
    expect(mockStorageService.upload).toHaveBeenCalledWith(
      expect.objectContaining({
        bucket: StorageBucket.PRIVATE,
        mimeType: 'application/zip',
      })
    );
    expect(mockSubRepo.saveAnswers).toHaveBeenCalledWith('sub-created', expect.any(Array));
    expect(queues.aiEvaluation.add).toHaveBeenCalledWith('evaluate-submission', {
      submissionId: 'sub-created',
      trialId: 'trial-1',
      candidateId: 'cand-1',
    });
    expect(eventBus.emit).toHaveBeenCalledWith(DOMAIN_EVENTS.TRIAL_SUBMITTED, expect.any(Object));
  });
});
