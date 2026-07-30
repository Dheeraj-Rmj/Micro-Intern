import type { RoleProfileService } from '../application/RoleProfileService.js';
import type { Request, Response, NextFunction } from 'express';

export class RoleProfileController {
  constructor(private readonly roleProfileService: RoleProfileService) {}

  createRoleProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.roleProfileService.createRoleProfile(req.body);
      res.status(201).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  getRoleProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profile = await this.roleProfileService.getRoleProfile(req.params['id'] as string);
      res.status(200).json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  };

  listCompanyRoleProfiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const profiles = await this.roleProfileService.listCompanyRoleProfiles(req.params['companyId'] as string);
      res.status(200).json({ success: true, data: profiles });
    } catch (err) {
      next(err);
    }
  };

  addRequiredSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.roleProfileService.addRequiredSkill({
        ...req.body,
        roleProfileId: req.params['id'] as string,
      });
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };

  addRequiredCompetency = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.roleProfileService.addRequiredCompetency({
        ...req.body,
        roleProfileId: req.params['id'] as string,
      });
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };

  evaluateCandidate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { candidateSkillScores, candidateCompetencyScores } = req.body;
      const evaluation = await this.roleProfileService.evaluateCandidateAgainstProfile(
        req.params['id'] as string,
        candidateSkillScores || {},
        candidateCompetencyScores || {}
      );
      res.status(200).json({ success: true, data: evaluation });
    } catch (err) {
      next(err);
    }
  };
}
