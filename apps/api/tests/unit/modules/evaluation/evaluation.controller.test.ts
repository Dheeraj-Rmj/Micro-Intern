import { describe, it, expect, vi, beforeEach } from 'vitest';

import { EvaluationController } from '@/modules/evaluation/presentation/evaluation.controller.js';
import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import type { Request, Response, NextFunction } from 'express';

describe('EvaluationController', () => {
  let controller: EvaluationController;
  let mockStartTrialUseCase: any;
  let mockSubmitTrialUseCase: any;
  let mockListCandidateSubmissionsUseCase: any;
  let mockGetSubmissionEvaluationUseCase: any;

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockStartTrialUseCase = {
      execute: vi.fn().mockResolvedValue({ id: 'sub-1', trialId: 'trial-1', status: 'IN_PROGRESS' }),
    };
    mockSubmitTrialUseCase = {
      execute: vi.fn().mockResolvedValue({ id: 'sub-1', trialId: 'trial-1', status: 'SUBMITTED' }),
    };
    mockListCandidateSubmissionsUseCase = {
      execute: vi.fn().mockResolvedValue({
        submissions: [{ id: 'sub-1' }, { id: 'sub-2' }],
        pagination: { page: 1, limit: 10, total: 2, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      }),
    };
    mockGetSubmissionEvaluationUseCase = {
      execute: vi.fn().mockResolvedValue({ id: 'eval-1', submissionId: 'sub-1', percentageScore: 85, isPassed: true }),
    };

    controller = new EvaluationController(
      mockStartTrialUseCase,
      mockSubmitTrialUseCase,
      mockListCandidateSubmissionsUseCase,
      mockGetSubmissionEvaluationUseCase
    );

    req = {
      user: { id: 'cand-user-id' } as any,
      params: { id: 'trial-or-sub-id' },
      query: { page: '1', limit: '10' },
      body: {
        answers: [{ taskId: 'task-1', answerText: 'Solution explanation' }],
      },
      files: [],
    };

    const statusFn = vi.fn().mockReturnThis();
    const jsonFn = vi.fn().mockReturnThis();
    res = {
      status: statusFn,
      json: jsonFn,
      req: { id: 'req-uuid' } as any,
    } as any;

    next = vi.fn();

    vi.spyOn(ResponseFormatter, 'created');
    vi.spyOn(ResponseFormatter, 'success');
    vi.spyOn(ResponseFormatter, 'paginated');
  });

  describe('startTrial', () => {
    it('should start a trial submission session and return 201 Created', async () => {
      await controller.startTrial(req as Request, res as Response, next);

      expect(mockStartTrialUseCase.execute).toHaveBeenCalledWith('cand-user-id', 'trial-or-sub-id');
      expect(ResponseFormatter.created).toHaveBeenCalledWith(res, expect.objectContaining({ id: 'sub-1' }));
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('submitTrial', () => {
    it('should process candidate answers and solution files, invoking submitTrialUseCase and returning 200 OK', async () => {
      req.files = [
        { buffer: Buffer.from('test diagram'), originalname: 'arch.png', mimetype: 'image/png' } as Express.Multer.File,
      ];
      req.body = {
        answers: [
          { taskId: 'task-1', answerText: 'Explained diagram architecture', fileIndex: 0 },
        ],
      };

      await controller.submitTrial(req as Request, res as Response, next);

      expect(mockSubmitTrialUseCase.execute).toHaveBeenCalledWith(
        'cand-user-id',
        'trial-or-sub-id',
        expect.arrayContaining([
          expect.objectContaining({
            taskId: 'task-1',
            answerText: 'Explained diagram architecture',
            fileName: 'arch.png',
            fileMimeType: 'image/png',
          }),
        ])
      );
      expect(ResponseFormatter.success).toHaveBeenCalledWith(res, expect.objectContaining({ status: 'SUBMITTED' }));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('listCandidateSubmissions', () => {
    it('should fetch paginated submissions for candidate and return via ResponseFormatter.paginated', async () => {
      await controller.listCandidateSubmissions(req as Request, res as Response, next);

      expect(mockListCandidateSubmissionsUseCase.execute).toHaveBeenCalledWith(
        'cand-user-id',
        expect.objectContaining({ page: '1', limit: '10' })
      );
      expect(ResponseFormatter.paginated).toHaveBeenCalledWith(
        res,
        [{ id: 'sub-1' }, { id: 'sub-2' }],
        expect.objectContaining({ total: 2 })
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('getSubmissionEvaluation', () => {
    it('should retrieve AI evaluation results for a submission and return 200 OK', async () => {
      await controller.getSubmissionEvaluation(req as Request, res as Response, next);

      expect(mockGetSubmissionEvaluationUseCase.execute).toHaveBeenCalledWith('trial-or-sub-id', 'cand-user-id');
      expect(ResponseFormatter.success).toHaveBeenCalledWith(res, expect.objectContaining({ percentageScore: 85, isPassed: true }));
      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
