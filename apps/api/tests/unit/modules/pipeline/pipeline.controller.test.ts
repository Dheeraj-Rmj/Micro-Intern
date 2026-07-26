import { describe, it, expect, vi, beforeEach } from 'vitest';

import { PipelineController } from '@/modules/pipeline/presentation/pipeline.controller.js';
import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import type { Request, Response, NextFunction } from 'express';

describe('PipelineController', () => {
  let controller: PipelineController;
  let mockGetTrialPipelineUseCase: any;
  let mockMoveCandidateUseCase: any;
  let mockRejectCandidateUseCase: any;

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockGetTrialPipelineUseCase = {
      execute: vi.fn().mockResolvedValue({ id: 'pipe-1', trialId: 'trial-1', stages: [], entries: [] }),
    };
    mockMoveCandidateUseCase = {
      execute: vi.fn().mockResolvedValue({ id: 'entry-1', stageId: 'stage-2', movedBy: 'recruiter-id' }),
    };
    mockRejectCandidateUseCase = {
      execute: vi.fn().mockResolvedValue({ id: 'entry-1', stageId: 'stage-rej', notes: 'Did not meet criteria' }),
    };

    controller = new PipelineController(
      mockGetTrialPipelineUseCase,
      mockMoveCandidateUseCase,
      mockRejectCandidateUseCase
    );

    req = {
      user: { id: 'recruiter-id' } as any,
      params: { trialId: 'trial-1', entryId: 'entry-1' },
      body: { targetStageId: 'stage-2', notes: 'Good technical discussion', reason: 'Did not meet criteria' },
    };

    const statusFn = vi.fn().mockReturnThis();
    const jsonFn = vi.fn().mockReturnThis();
    res = {
      status: statusFn,
      json: jsonFn,
      req: { id: 'req-uuid' } as any,
    } as any;

    next = vi.fn();

    vi.spyOn(ResponseFormatter, 'success');
  });

  describe('getTrialPipeline', () => {
    it('should retrieve pipeline board structure and return 200 Success', async () => {
      await controller.getTrialPipeline(req as Request, res as Response, next);

      expect(mockGetTrialPipelineUseCase.execute).toHaveBeenCalledWith('recruiter-id', 'trial-1');
      expect(ResponseFormatter.success).toHaveBeenCalledWith(res, expect.objectContaining({ id: 'pipe-1' }));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('moveCandidate', () => {
    it('should advance or transfer candidate card and return 200 Success', async () => {
      await controller.moveCandidate(req as Request, res as Response, next);

      expect(mockMoveCandidateUseCase.execute).toHaveBeenCalledWith('recruiter-id', 'entry-1', {
        targetStageId: 'stage-2',
        notes: 'Good technical discussion',
      });
      expect(ResponseFormatter.success).toHaveBeenCalledWith(res, expect.objectContaining({ stageId: 'stage-2' }));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('rejectCandidate', () => {
    it('should move candidate card to REJECTED terminal column and return 200 Success', async () => {
      await controller.rejectCandidate(req as Request, res as Response, next);

      expect(mockRejectCandidateUseCase.execute).toHaveBeenCalledWith('recruiter-id', 'entry-1', 'Did not meet criteria');
      expect(ResponseFormatter.success).toHaveBeenCalledWith(res, expect.objectContaining({ stageId: 'stage-rej' }));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
