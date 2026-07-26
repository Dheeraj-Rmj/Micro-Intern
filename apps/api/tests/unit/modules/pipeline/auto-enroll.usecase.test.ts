import { PipelineStageType } from '@microintern/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AutoEnrollCandidateUseCase } from '@/modules/pipeline/application/use-cases/auto-enroll-candidate.usecase.js';
import { Pipeline, PipelineStage, PipelineEntry } from '@/modules/pipeline/domain/index.js';

describe('AutoEnrollCandidateUseCase (Event-Driven Initial Pipeline Entry)', () => {
  let mockPipelineRepo: any;
  let mockTrialRepo: any;
  let useCase: AutoEnrollCandidateUseCase;

  const mockDate = new Date(2026, 6, 26, 12, 0);
  const stageScreening = new PipelineStage('stage-scr', 'pipe-1', 'Screening', PipelineStageType.SCREENING, 10);
  const stageInterview = new PipelineStage('stage-int', 'pipe-1', 'Interview', PipelineStageType.TECHNICAL_INTERVIEW, 20);
  const testPipeline = new Pipeline('pipe-1', 'comp-1', 'trial-1', 'Trial Pipeline', 'Backend Dev', true, mockDate, mockDate, [stageInterview, stageScreening], []);
  const createdEntry = new PipelineEntry('entry-new', 'pipe-1', 'stage-scr', 'cand-user', mockDate, null, 'Auto-enrolled', mockDate, mockDate);

  beforeEach(() => {
    mockPipelineRepo = {
      findByTrialId: vi.fn(),
      createDefaultPipeline: vi.fn(),
      findEntryByPipelineAndUser: vi.fn(),
      createEntry: vi.fn(),
    };
    mockTrialRepo = {
      findById: vi.fn(),
    };
    useCase = new AutoEnrollCandidateUseCase(mockPipelineRepo, mockTrialRepo);
  });

  it('should enroll submitting candidate into the initial pipeline stage (lowest sortOrder)', async () => {
    mockTrialRepo.findById.mockResolvedValue({ id: 'trial-1', companyId: 'comp-1', title: 'Assessment' });
    mockPipelineRepo.findByTrialId.mockResolvedValue(testPipeline);
    mockPipelineRepo.findEntryByPipelineAndUser.mockResolvedValue(null);
    mockPipelineRepo.createEntry.mockResolvedValue(createdEntry);

    const res = await useCase.execute({ submissionId: 'sub-123', candidateId: 'cand-user', trialId: 'trial-1' });

    expect(mockPipelineRepo.createEntry).toHaveBeenCalledWith(expect.objectContaining({
      pipelineId: 'pipe-1',
      stageId: 'stage-scr', // screening has sortOrder 10, interview has 20
      userId: 'cand-user',
    }));
    expect(res?.id).toBe('entry-new');
  });

  it('should initialize default pipeline first if trial does not yet have an active pipeline board', async () => {
    mockTrialRepo.findById.mockResolvedValue({ id: 'trial-1', companyId: 'comp-1', title: 'New Trial Assessment', roleTitle: 'Dev' });
    mockPipelineRepo.findByTrialId.mockResolvedValue(null);
    mockPipelineRepo.createDefaultPipeline.mockResolvedValue(testPipeline);
    mockPipelineRepo.findEntryByPipelineAndUser.mockResolvedValue(null);
    mockPipelineRepo.createEntry.mockResolvedValue(createdEntry);

    const res = await useCase.execute({ submissionId: 'sub-123', candidateId: 'cand-user', trialId: 'trial-1' });

    expect(mockPipelineRepo.createDefaultPipeline).toHaveBeenCalledWith('comp-1', 'trial-1', 'New Trial Assessment Pipeline', 'Dev');
    expect(res?.id).toBe('entry-new');
  });

  it('should be idempotent and not duplicate candidate cards if user is already enrolled in pipeline', async () => {
    mockTrialRepo.findById.mockResolvedValue({ id: 'trial-1', companyId: 'comp-1', title: 'Assessment' });
    mockPipelineRepo.findByTrialId.mockResolvedValue(testPipeline);
    mockPipelineRepo.findEntryByPipelineAndUser.mockResolvedValue(createdEntry); // Already in pipeline

    const res = await useCase.execute({ submissionId: 'sub-123', candidateId: 'cand-user', trialId: 'trial-1' });

    expect(mockPipelineRepo.createEntry).not.toHaveBeenCalled();
    expect(res?.id).toBe('entry-new');
  });

  it('should return null and abort safely if target trial is not found', async () => {
    mockTrialRepo.findById.mockResolvedValue(null);

    const res = await useCase.execute({ submissionId: 'sub-123', candidateId: 'cand-user', trialId: 'missing-trial' });

    expect(res).toBeNull();
    expect(mockPipelineRepo.createEntry).not.toHaveBeenCalled();
  });
});
