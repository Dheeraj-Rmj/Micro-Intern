import type { SkillFrameworkService } from "../application/SkillFrameworkService.js";
import type { Request, Response, NextFunction } from "express";
import { SkillRelationshipType } from "@microintern/database";

export class SkillController {
  constructor(private readonly skillService: SkillFrameworkService) {}

  createSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const skill = await this.skillService.createSkill(req.body);
      res.status(201).json({ success: true, data: skill });
    } catch (err) {
      next(err);
    }
  };

  getSkill = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const skill = await this.skillService.getSkill(req.params["id"] as string);
      res.status(200).json({ success: true, data: skill });
    } catch (err) {
      next(err);
    }
  };

  listSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categoryId = req.query["categoryId"] as string | undefined;
      const minDifficulty = req.query["minDifficulty"]
        ? Number(req.query["minDifficulty"])
        : undefined;
      const skills = await this.skillService.listSkills({ categoryId, minDifficulty });
      res.status(200).json({ success: true, data: skills });
    } catch (err) {
      next(err);
    }
  };

  createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, description } = req.body;
      const category = await this.skillService.createCategory(name, description);
      res.status(201).json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  };

  listCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.skillService.listCategories();
      res.status(200).json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  };

  getSkillGraph = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const graph = await this.skillService.getSkillGraph(req.params["id"] as string);
      res.status(200).json({ success: true, data: graph });
    } catch (err) {
      next(err);
    }
  };

  linkSkills = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rel = await this.skillService.linkSkills({
        sourceSkillId: req.body.sourceSkillId,
        targetSkillId: req.body.targetSkillId,
        relationshipType: req.body.relationshipType as SkillRelationshipType,
        strength: req.body.strength,
      });
      res.status(201).json({ success: true, data: rel });
    } catch (err) {
      next(err);
    }
  };
}
