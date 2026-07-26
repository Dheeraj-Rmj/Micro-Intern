import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import type { CreateTrialUseCase } from '../application/use-cases/create-trial.usecase.js';
import type { GetTrialDetailsUseCase } from '../application/use-cases/get-trial-details.usecase.js';
import type { ListPublicTrialsUseCase } from '../application/use-cases/list-public-trials.usecase.js';
import type { PublishTrialUseCase } from '../application/use-cases/publish-trial.usecase.js';
import type { UpdateTrialUseCase } from '../application/use-cases/update-trial.usecase.js';
import type { Request, Response, NextFunction } from 'express';

export class TrialController {
  constructor(
    private readonly createTrialUseCase: CreateTrialUseCase,
    private readonly updateTrialUseCase: UpdateTrialUseCase,
    private readonly publishTrialUseCase: PublishTrialUseCase,
    private readonly listPublicTrialsUseCase: ListPublicTrialsUseCase,
    private readonly getTrialDetailsUseCase: GetTrialDetailsUseCase
  ) {}

  async createTrial(req: Request, res: Response, next: NextFunction): Promise<void> {
    const trial = await this.createTrialUseCase.execute(req.user!.id, req.body);
    ResponseFormatter.created(res, trial);
  }

  async updateTrial(req: Request, res: Response, next: NextFunction): Promise<void> {
    const trial = await this.updateTrialUseCase.execute(req.user!.id, req.params['id'] as string, req.body);
    ResponseFormatter.success(res, trial);
  }

  async publishTrial(req: Request, res: Response, next: NextFunction): Promise<void> {
    const trial = await this.publishTrialUseCase.execute(req.user!.id, req.params['id'] as string);
    ResponseFormatter.success(res, trial);
  }

  async listPublicTrials(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { trials, pagination } = await this.listPublicTrialsUseCase.execute(req.query);
    ResponseFormatter.paginated(res, trials, pagination);
  }

  async getTrialDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    const details = await this.getTrialDetailsUseCase.execute(req.params['id'] as string, req.user?.id);
    ResponseFormatter.success(res, details);
  }
}
