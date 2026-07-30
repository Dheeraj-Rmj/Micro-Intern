import type { GenerateLearningRecommendationsUseCase } from '../application/GenerateLearningRecommendationsUseCase.js';
import type { Request, Response, NextFunction } from 'express';

export class LearningController {
  constructor(private readonly generateRecommendations: GenerateLearningRecommendationsUseCase) {}

  getRecommendations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = (req as any).user?.id || req.query['candidateId'];
      const roleProfileId = req.query['roleProfileId'] as string | undefined;
      const recommendations = await this.generateRecommendations.execute(candidateId, roleProfileId);
      res.status(200).json({ success: true, data: recommendations });
    } catch (err) {
      next(err);
    }
  };
}
