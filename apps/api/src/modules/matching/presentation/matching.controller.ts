import type { SkillMatchingService } from '../application/SkillMatchingService.js';
import type { Request, Response, NextFunction } from 'express';

export class MatchingController {
  constructor(private readonly matchingService: SkillMatchingService) {}

  matchCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleProfileId, candidateId } = req.body;
      const result = await this.matchingService.matchCandidateToRole(roleProfileId, candidateId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  rankCandidates = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { roleProfileId, candidateIds } = req.body;
      const ranked = await this.matchingService.rankCandidatesForRole(
        roleProfileId,
        Array.isArray(candidateIds) ? candidateIds : []
      );
      res.status(200).json({ success: true, data: ranked });
    } catch (err) {
      next(err);
    }
  };
}
