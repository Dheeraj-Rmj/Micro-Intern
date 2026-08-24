import type { EvidenceService } from "../application/EvidenceService.js";
import type { Request, Response, NextFunction } from "express";
import { EvidenceType, EvidenceVerificationStatus } from "@microintern/database";

export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  registerEvidence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = (req as any).user?.id || req.body.candidateId;
      const evidence = await this.evidenceService.registerEvidence(req.body, actorId);
      res.status(201).json({ success: true, data: evidence });
    } catch (err) {
      next(err);
    }
  };

  verifyEvidence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const actorId = (req as any).user?.id || "system";
      const evidence = await this.evidenceService.verifyEvidence(
        {
          evidenceId: req.params["id"] as string,
          status: req.body.status as EvidenceVerificationStatus,
          reviewNotes: req.body.reviewNotes,
          qualityScore: req.body.qualityScore,
        },
        actorId,
      );
      res.status(200).json({ success: true, data: evidence });
    } catch (err) {
      next(err);
    }
  };

  getEvidence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const evidence = await this.evidenceService.getEvidence(req.params["id"] as string);
      res.status(200).json({ success: true, data: evidence });
    } catch (err) {
      next(err);
    }
  };

  listCandidateEvidence = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const type = req.query["type"] as EvidenceType | undefined;
      const status = req.query["status"] as EvidenceVerificationStatus | undefined;
      const list = await this.evidenceService.listCandidateEvidence(
        req.params["candidateId"] as string,
        {
          type,
          status,
        },
      );
      res.status(200).json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };

  listSubmissionEvidence = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const list = await this.evidenceService.listSubmissionEvidence(
        req.params["submissionId"] as string,
      );
      res.status(200).json({ success: true, data: list });
    } catch (err) {
      next(err);
    }
  };

  linkSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.evidenceService.linkSkill(
        req.params["id"] as string,
        req.body.skillId,
        req.body.confidence,
        req.body.notes,
      );
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };

  linkCompetency = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const item = await this.evidenceService.linkCompetency(
        req.params["id"] as string,
        req.body.competencyId,
        req.body.confidence,
        req.body.notes,
      );
      res.status(201).json({ success: true, data: item });
    } catch (err) {
      next(err);
    }
  };
}
