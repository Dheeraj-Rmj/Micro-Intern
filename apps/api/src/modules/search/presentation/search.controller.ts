import type { SearchEngineService } from "../application/SearchEngineService.js";
import type { Request, Response, NextFunction } from "express";

export class SearchController {
  constructor(private readonly searchService: SearchEngineService) {}

  searchSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query, categoryId, minDifficulty, limit, cursor } = req.query;
      const result = await this.searchService.searchSkills(
        query as string | undefined,
        categoryId as string | undefined,
        minDifficulty ? Number(minDifficulty) : undefined,
        { limit: limit ? Number(limit) : undefined, cursor: cursor as string | undefined },
      );
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  searchRoleProfiles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query, companyId, limit, cursor } = req.query;
      const result = await this.searchService.searchRoleProfiles(
        query as string | undefined,
        companyId as string | undefined,
        { limit: limit ? Number(limit) : undefined, cursor: cursor as string | undefined },
      );
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  searchEvidence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query, candidateId, status, limit, cursor } = req.query;
      const result = await this.searchService.searchEvidence(
        query as string | undefined,
        candidateId as string | undefined,
        status as string | undefined,
        { limit: limit ? Number(limit) : undefined, cursor: cursor as string | undefined },
      );
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  searchPortfolios = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query, minScore, limit, cursor } = req.query;
      const result = await this.searchService.searchPortfolios(
        query as string | undefined,
        minScore ? Number(minScore) : undefined,
        { limit: limit ? Number(limit) : undefined, cursor: cursor as string | undefined },
      );
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };
}
