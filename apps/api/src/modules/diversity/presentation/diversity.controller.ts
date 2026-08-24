import type { Request, Response, NextFunction } from "express";
import type { DiversityAnalyticsService } from "../application/DiversityAnalyticsService.js";

export class DiversityController {
  constructor(private readonly diversityService: DiversityAnalyticsService) {}

  submitData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = (req as any).user?.id as string;
      const data = await this.diversityService.submitDiversityData(candidateId, req.body);
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  };

  getCompanyReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId as string;
      const report = await this.diversityService.getCompanyDiversityReport(companyId);
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  };

  getPlatformReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const report = await this.diversityService.getPlatformDiversityReport();
      res.status(200).json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  };
}
