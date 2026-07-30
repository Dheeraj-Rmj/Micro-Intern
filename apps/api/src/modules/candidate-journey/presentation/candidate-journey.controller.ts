import type { CandidateJourneyService } from "../application/CandidateJourneyService.js";
import type { Request, Response, NextFunction } from "express";
import { CandidateJourneyStatus } from "@microintern/database";

export class CandidateJourneyController {
  constructor(private readonly journeyService: CandidateJourneyService) {}

  startJourney = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = (req as any).user?.id || "system";
      const journey = await this.journeyService.startJourney(req.body, actorId);
      res.status(201).json({ success: true, data: journey });
    } catch (err) {
      next(err);
    }
  };

  advanceJourney = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = (req as any).user?.id || "system";
      const journey = await this.journeyService.advanceJourney(
        {
          journeyId: req.params["id"] as string,
          toStatus: req.body.toStatus as CandidateJourneyStatus,
          reason: req.body.reason,
          overallScore: req.body.overallScore,
          skillMatchPercentage: req.body.skillMatchPercentage,
          changedById: actorId,
        },
        actorId,
      );
      res.status(200).json({ success: true, data: journey });
    } catch (err) {
      next(err);
    }
  };

  getJourney = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const journey = await this.journeyService.getJourney(req.params["id"] as string);
      res.status(200).json({ success: true, data: journey });
    } catch (err) {
      next(err);
    }
  };

  listCandidateJourneys = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const candidateId = (req as any).user?.id || req.params["candidateId"];
      const list = await this.journeyService.listCandidateJourneys(candidateId);
      res.status(200).json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };

  listCompanyJourneys = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const status = req.query["status"] as CandidateJourneyStatus | undefined;
      const list = await this.journeyService.listCompanyJourneys(
        req.params["companyId"] as string,
        status,
      );
      res.status(200).json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };
}
