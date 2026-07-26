import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import type { GetTrialPipelineUseCase, MoveCandidateUseCase, RejectCandidateUseCase } from '../application/index.js';
import type { Request, Response, NextFunction } from 'express';

export class PipelineController {
  constructor(
    private readonly getTrialPipelineUseCase: GetTrialPipelineUseCase,
    private readonly moveCandidateUseCase: MoveCandidateUseCase,
    private readonly rejectCandidateUseCase: RejectCandidateUseCase
  ) {}

  async getTrialPipeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    const trialId = req.params['trialId'] as string;
    const pipeline = await this.getTrialPipelineUseCase.execute(req.user!.id, trialId);
    ResponseFormatter.success(res, pipeline);
  }

  async moveCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const entryId = req.params['entryId'] as string;
    const { targetStageId, notes } = req.body as { targetStageId: string; notes?: string };
    const entry = await this.moveCandidateUseCase.execute(req.user!.id, entryId, { targetStageId, notes });
    ResponseFormatter.success(res, entry);
  }

  async rejectCandidate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const entryId = req.params['entryId'] as string;
    const { reason } = (req.body || {}) as { reason?: string };
    const entry = await this.rejectCandidateUseCase.execute(req.user!.id, entryId, reason);
    ResponseFormatter.success(res, entry);
  }
}
