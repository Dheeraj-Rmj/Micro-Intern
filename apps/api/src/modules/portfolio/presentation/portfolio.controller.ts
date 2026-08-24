import type { PortfolioService } from "../application/PortfolioService.js";
import type { Request, Response, NextFunction } from "express";

export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  getMyPortfolio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = (req as any).user?.id || req.query["candidateId"];
      const portfolio = await this.portfolioService.getPortfolioByCandidateId(candidateId);
      res.status(200).json({ success: true, data: portfolio });
    } catch (err) {
      next(err);
    }
  };

  updateMyPortfolio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = (req as any).user?.id || req.body["candidateId"];
      const portfolio = await this.portfolioService.updatePortfolio(candidateId, req.body);
      res.status(200).json({ success: true, data: portfolio });
    } catch (err) {
      next(err);
    }
  };

  addProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = (req as any).user?.id || req.body.candidateId;
      const project = await this.portfolioService.addProject(candidateId, req.body);
      res.status(201).json({ success: true, data: project });
    } catch (err) {
      next(err);
    }
  };

  addAchievement = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = (req as any).user?.id || req.body.candidateId;
      const achievement = await this.portfolioService.addAchievement(candidateId, req.body);
      res.status(201).json({ success: true, data: achievement });
    } catch (err) {
      next(err);
    }
  };

  getTimeline = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const candidateId = (req as any).user?.id || req.params["candidateId"];
      const timeline = await this.portfolioService.getTimeline(candidateId);
      res.status(200).json({ success: true, data: timeline });
    } catch (err) {
      next(err);
    }
  };
}
