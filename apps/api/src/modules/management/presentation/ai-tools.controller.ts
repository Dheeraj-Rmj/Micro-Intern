import type { Request, Response, NextFunction } from 'express';
import type { JobDescriptionService } from '../application/use-cases/GenerateJobDescriptionUseCase.js';
import type { GenerateOfferLetterUseCase } from '../application/use-cases/GenerateOfferLetterUseCase.js';

export class AIToolsController {
  constructor(
    private readonly jobDescriptionService: JobDescriptionService,
    private readonly offerLetterUseCase: GenerateOfferLetterUseCase,
  ) {}

  generateJobDescription = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId as string;
      const result = await this.jobDescriptionService.generateJobDescription({
        ...req.body,
        companyId,
      });
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  };

  generateOfferLetter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.offerLetterUseCase.execute(req.body);
      res.status(200).json({ success: true, data: result });
    } catch (err) { next(err); }
  };
}
