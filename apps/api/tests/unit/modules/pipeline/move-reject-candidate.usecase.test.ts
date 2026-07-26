import { PipelineStageType } from '@microintern/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MoveCandidateUseCase } from '@/modules/pipeline/application/use-cases/move-candidate.usecase.js';
import { RejectCandidateUseCase } from '@/modules/pipeline/application/use-cases/reject-candidate.usecase.js';
import { Pipeline, PipelineStage, PipelineEntry, PipelineEntryNotFoundError, PipelineStageNotFoundError } from '@/modules/pipeline/domain/index.js';
import { ForbiddenError } from '@/shared/errors/AppError.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

vi.mock('@/shared/events/EventBus.js', async (importOriginal) => {
  const mod = await importOriginal<any>();
  return {
    ...mod,
    eventBus: {
      emit: vi.fn(),
    },
  };
});

describe('Move & Reject Candidate Use Cases', () => {
  let mockPipelineRepo: any;
  let mockCompanyRepo: any;
  let moveUseCase: MoveCandidateUseCase;
  let rejectUseCase: RejectCandidateUseCase;

  const mockDate = new Date(2026, 6, 26, 12, 0);
  const stageScreening = new PipelineStage('stage-scr', 'pipe-1', 'Screening', PipelineStageType.SCREENING, 1);
  const stageInterview = new PipelineStage('stage-int', 'pipe-1', 'Tech Interview', PipelineStageType.TECHNICAL_INTERVIEW, 2);
  const stageReject = new PipelineStage('stage-rej', 'pipe-1', 'Rejected', PipelineStageType.REJECTED, 99);
  
  const testPipeline = new Pipeline('pipe-1', 'comp-1', 'trial-1', 'Dev Pipeline', 'Dev', true, mockDate, mockDate, [stageScreening, stageInterview, stageReject], []);
  const testEntry = new PipelineEntry('entry-10', 'pipe-1', 'stage-scr', 'cand-user', mockDate, null, null, mockDate, mockDate, stageScreening);

  beforeEach(() => {
    vi.clearAllMocks();
    mockPipelineRepo = {
      findEntryById: vi.fn(),
      findById: vi.fn(),
      updateEntry: vi.fn(),
    };
    mockCompanyRepo = {
      findByUserId: vi.fn(),
    };
    moveUseCase = new MoveCandidateUseCase(mockPipelineRepo, mockCompanyRepo);
    rejectUseCase = new RejectCandidateUseCase(mockPipelineRepo, mockCompanyRepo);
  });

  describe('MoveCandidateUseCase', () => {
    it('should cleanly transition candidate to target stage and emit PIPELINE_CANDIDATE_MOVED event', async () => {
      mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'comp-1' });
      mockPipelineRepo.findEntryById.mockResolvedValue(testEntry);
      mockPipelineRepo.findById.mockResolvedValue(testPipeline);
      
      const movedEntry = new PipelineEntry('entry-10', 'pipe-1', 'stage-int', 'cand-user', mockDate, 'user-owner', 'Promising notes', mockDate, mockDate, stageInterview);
      mockPipelineRepo.updateEntry.mockResolvedValue(movedEntry);

      const res = await moveUseCase.execute('user-owner', 'entry-10', { targetStageId: 'stage-int', notes: 'Promising notes' });

      expect(mockPipelineRepo.updateEntry).toHaveBeenCalledWith('entry-10', {
        stageId: 'stage-int',
        movedBy: 'user-owner',
        notes: 'Promising notes',
      });
      expect(res.stageId).toBe('stage-int');
      expect(eventBus.emit).toHaveBeenCalledWith(DOMAIN_EVENTS.PIPELINE_CANDIDATE_MOVED, expect.objectContaining({
        entryId: 'entry-10',
        pipelineId: 'pipe-1',
        toStageId: 'stage-int',
        movedBy: 'user-owner',
      }));
    });

    it('should throw PipelineEntryNotFoundError if targeted candidate card does not exist', async () => {
      mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'comp-1' });
      mockPipelineRepo.findEntryById.mockResolvedValue(null);

      await expect(moveUseCase.execute('user-owner', 'missing-entry', { targetStageId: 'stage-int' })).rejects.toThrow(PipelineEntryNotFoundError);
    });

    it('should throw ForbiddenError if stranger recruiter tries to move candidate in another company pipeline', async () => {
      mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'comp-evil' });
      mockPipelineRepo.findEntryById.mockResolvedValue(testEntry);
      mockPipelineRepo.findById.mockResolvedValue(testPipeline);

      await expect(moveUseCase.execute('user-evil', 'entry-10', { targetStageId: 'stage-int' })).rejects.toThrow(ForbiddenError);
    });
  });

  describe('RejectCandidateUseCase', () => {
    it('should move candidate into REJECTED terminal stage and log rejection event', async () => {
      mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'comp-1' });
      mockPipelineRepo.findEntryById.mockResolvedValue(testEntry);
      mockPipelineRepo.findById.mockResolvedValue(testPipeline);

      const rejectedEntry = new PipelineEntry('entry-10', 'pipe-1', 'stage-rej', 'cand-user', mockDate, 'user-owner', 'Did not pass rubric', mockDate, mockDate, stageReject);
      mockPipelineRepo.updateEntry.mockResolvedValue(rejectedEntry);

      const res = await rejectUseCase.execute('user-owner', 'entry-10', 'Did not pass rubric');

      expect(mockPipelineRepo.updateEntry).toHaveBeenCalledWith('entry-10', {
        stageId: 'stage-rej',
        movedBy: 'user-owner',
        notes: 'Did not pass rubric',
      });
      expect(res.stageId).toBe('stage-rej');
      expect(eventBus.emit).toHaveBeenCalledWith(DOMAIN_EVENTS.PIPELINE_CANDIDATE_MOVED, expect.objectContaining({
        entryId: 'entry-10',
        toStageId: 'stage-rej',
        isRejected: true,
        reason: 'Did not pass rubric',
      }));
    });

    it('should throw PipelineStageNotFoundError if pipeline lacks a REJECTED column configuration', async () => {
      mockCompanyRepo.findByUserId.mockResolvedValue({ id: 'comp-1' });
      mockPipelineRepo.findEntryById.mockResolvedValue(testEntry);
      const noRejectPipeline = new Pipeline('pipe-1', 'comp-1', 'trial-1', 'No Reject Pipe', 'Dev', true, mockDate, mockDate, [stageScreening, stageInterview], []);
      mockPipelineRepo.findById.mockResolvedValue(noRejectPipeline);

      await expect(rejectUseCase.execute('user-owner', 'entry-10', 'Sorry')).rejects.toThrow(PipelineStageNotFoundError);
    });
  });
});
