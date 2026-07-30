import type { PortfolioService } from '../application/PortfolioService.js';
import type { Request, Response, NextFunction } from 'express';

export class PublicProfileController {
  constructor(private readonly portfolioService: PortfolioService) {}

  getPublicProfileBySlug = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.portfolioService.getPublicProfile(req.params['slug'] as string);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };
}
