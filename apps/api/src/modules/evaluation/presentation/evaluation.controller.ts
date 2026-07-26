import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import type { TrialParamDto, SubmissionParamDto, PaginationQueryDto, SubmitTrialBodyDto } from './evaluation.schemas.js';
import type { GetSubmissionEvaluationUseCase } from '../application/use-cases/get-submission-evaluation.usecase.js';
import type { ListCandidateSubmissionsUseCase } from '../application/use-cases/list-candidate-submissions.usecase.js';
import type { StartTrialUseCase } from '../application/use-cases/start-trial.usecase.js';
import type { SubmitTrialUseCase, SubmitAnswerInput } from '../application/use-cases/submit-trial.usecase.js';
import type { Request, Response, NextFunction } from 'express';

export class EvaluationController {
  constructor(
    private readonly startTrialUseCase: StartTrialUseCase,
    private readonly submitTrialUseCase: SubmitTrialUseCase,
    private readonly listCandidateSubmissionsUseCase: ListCandidateSubmissionsUseCase,
    private readonly getSubmissionEvaluationUseCase: GetSubmissionEvaluationUseCase
  ) {}

  /**
   * POST /api/v1/trials/:id/start
   */
  async startTrial(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user!.id;
    const { id: trialId } = req.params as unknown as TrialParamDto;

    const submission = await this.startTrialUseCase.execute(userId, trialId);
    ResponseFormatter.created(res, submission);
  }

  /**
   * POST /api/v1/trials/:id/submit
   */
  async submitTrial(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user!.id;
    const { id: trialId } = req.params as unknown as TrialParamDto;
    const { answers } = req.body as unknown as SubmitTrialBodyDto;

    const files = (req.files as Express.Multer.File[]) || [];
    const formattedAnswers: SubmitAnswerInput[] = answers.map((ans, idx) => {
      let fileBuffer: Buffer | undefined;
      let fileName: string | undefined;
      let fileMimeType: string | undefined;

      const fileIdx = ans.fileIndex !== undefined ? ans.fileIndex : idx;
      const file = files[fileIdx];
      if (file) {
        fileBuffer = file.buffer;
        fileName = file.originalname;
        fileMimeType = file.mimetype;
      }

      return {
        taskId: ans.taskId,
        answerText: ans.answerText,
        fileBuffer,
        fileName,
        fileMimeType,
        answerData: ans.answerData,
      };
    });

    const submitted = await this.submitTrialUseCase.execute(userId, trialId, formattedAnswers);
    ResponseFormatter.success(res, submitted);
  }

  /**
   * GET /api/v1/submissions/me
   */
  async listCandidateSubmissions(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user!.id;
    const query = req.query as unknown as PaginationQueryDto;

    const { submissions, pagination } = await this.listCandidateSubmissionsUseCase.execute(userId, query);
    ResponseFormatter.paginated(res, submissions, pagination);
  }

  /**
   * GET /api/v1/submissions/:id/evaluation
   */
  async getSubmissionEvaluation(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user!.id;
    const { id: submissionId } = req.params as unknown as SubmissionParamDto;

    const evaluation = await this.getSubmissionEvaluationUseCase.execute(submissionId, userId);
    ResponseFormatter.success(res, evaluation);
  }
}
