import type { SkillVerificationService } from '../application/SkillVerificationService.js';
import type { Request, Response, NextFunction } from 'express';
import { SkillVerificationStatus } from '@microintern/database';

export class SkillVerificationController {
  constructor(private readonly verificationService: SkillVerificationService) {}

  verifySkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = (req as any).user?.id || 'system';
      const record = await this.verificationService.verifySkill(
        {
          candidateId: req.body.candidateId,
          skillId: req.body.skillId,
          status: req.body.status as SkillVerificationStatus,
          confidenceScore: req.body.confidenceScore,
          verifiedById: actorId,
          verificationNote: req.body.verificationNote,
        },
        actorId
      );
      res.status(200).json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  };

  getCandidateVerifiedSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const minStatus = req.query['minStatus'] as SkillVerificationStatus | undefined;
      const list = await this.verificationService.getCandidateVerifiedSkills(
        req.params['candidateId'] as string,
        minStatus
      );
      res.status(200).json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };

  getSkillVerification = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const record = await this.verificationService.getSkillVerification(
        req.params['candidateId'] as string,
        req.params['skillId'] as string
      );
      res.status(200).json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  };
}
