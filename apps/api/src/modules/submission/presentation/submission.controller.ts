import { ResponseFormatter } from "@/shared/response/ResponseFormatter.js";
import type { Request, Response, NextFunction } from "express";
import type {
  AssessmentParamDto,
  PaginationQueryDto,
  SubmitAssessmentBodyDto,
} from "../../evaluation/presentation/evaluation.schemas.js";
import type { StartAssessmentUseCase } from "../application/use-cases/start-assessment.usecase.js";
import type {
  SubmitAssessmentUseCase,
  SubmitAnswerInput,
} from "../application/use-cases/submit-assessment.usecase.js";
import type { ListCandidateSubmissionsUseCase } from "../application/use-cases/list-candidate-submissions.usecase.js";

export class SubmissionController {
  constructor(
    private readonly startAssessmentUseCase: StartAssessmentUseCase,
    private readonly submitAssessmentUseCase: SubmitAssessmentUseCase,
    private readonly listCandidateSubmissionsUseCase: ListCandidateSubmissionsUseCase,
  ) {}

  async startAssessment(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user!.id;
    const { id: assessmentId } = req.params as unknown as AssessmentParamDto;
    const submission = await this.startAssessmentUseCase.execute(userId, assessmentId);
    ResponseFormatter.created(res, submission);
  }

  async submitAssessment(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user!.id;
    const { id: assessmentId } = req.params as unknown as AssessmentParamDto;
    const { answers, proctoringEvents } = req.body as unknown as SubmitAssessmentBodyDto;
    const files = (req.files as Express.Multer.File[]) || [];

    const formattedAnswers: SubmitAnswerInput[] = answers.map((ans, idx) => {
      const fileIdx = ans.fileIndex !== undefined ? ans.fileIndex : idx;
      const file = files[fileIdx];
      return {
        taskId: ans.taskId,
        answerText: ans.answerText,
        fileBuffer: file?.buffer,
        fileName: file?.originalname,
        fileMimeType: file?.mimetype,
        answerData: ans.answerData,
      };
    });

    const submitted = await this.submitAssessmentUseCase.execute(
      userId,
      assessmentId,
      formattedAnswers,
      proctoringEvents,
    );
    ResponseFormatter.success(res, submitted);
  }

  async listCandidateSubmissions(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const userId = req.user!.id;
    const query = req.query as unknown as PaginationQueryDto;
    const { submissions, pagination } = await this.listCandidateSubmissionsUseCase.execute(
      userId,
      query,
    );
    ResponseFormatter.paginated(res, submissions, pagination);
  }
}
