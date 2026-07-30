import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';
import type { Request, Response, NextFunction } from 'express';
import type { SubmissionParamDto } from './evaluation.schemas.js';
import type { GetSubmissionEvaluationUseCase } from '../application/use-cases/get-submission-evaluation.usecase.js';

export class EvaluationController {
  constructor(
    private readonly getSubmissionEvaluationUseCase: GetSubmissionEvaluationUseCase
  ) {}

  async getSubmissionEvaluation(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user!.id;
    const { id: submissionId } = req.params as unknown as SubmissionParamDto;
    const evaluation = await this.getSubmissionEvaluationUseCase.execute(submissionId, userId);
    ResponseFormatter.success(res, evaluation);
  }
}
