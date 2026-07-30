import type { Request, Response, NextFunction } from 'express';
import type { CandidateLeaderboardService } from '../application/CandidateLeaderboardService.js';

export class LeaderboardController {
  constructor(private readonly leaderboardService: CandidateLeaderboardService) {}

  getRoleProfileLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId || req.query['companyId'] as string;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 50;
      const leaderboard = await this.leaderboardService.getRoleProfileLeaderboard(
        req.params['roleProfileId'] as string,
        companyId,
        limit,
      );
      res.status(200).json({ success: true, data: leaderboard });
    } catch (err) { next(err); }
  };

  getCompanyLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId as string;
      const limit = req.query['limit'] ? parseInt(req.query['limit'] as string, 10) : 20;
      const leaderboard = await this.leaderboardService.getCompanyLeaderboard(companyId, limit);
      res.status(200).json({ success: true, data: leaderboard });
    } catch (err) { next(err); }
  };
}
