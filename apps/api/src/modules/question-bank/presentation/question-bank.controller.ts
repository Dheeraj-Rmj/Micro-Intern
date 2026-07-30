import type { Request, Response, NextFunction } from "express";
import type { QuestionBankService } from "../application/QuestionBankService.js";

export class QuestionBankController {
  constructor(private readonly questionBankService: QuestionBankService) {}

  createQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId || req.body.companyId;
      const question = await this.questionBankService.createQuestion({ ...req.body, companyId });
      res.status(201).json({ success: true, data: question });
    } catch (err) {
      next(err);
    }
  };

  listQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId as string;
      const questions = await this.questionBankService.listQuestions(companyId, {
        difficulty: req.query["difficulty"] as string | undefined,
        type: req.query["type"] as string | undefined,
        skill: req.query["skill"] as string | undefined,
      });
      res.status(200).json({ success: true, data: questions });
    } catch (err) {
      next(err);
    }
  };

  generateQuestions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId as string;
      const questions = await this.questionBankService.generateQuestions({
        ...req.body,
        companyId,
      });
      res.status(201).json({ success: true, data: questions });
    } catch (err) {
      next(err);
    }
  };

  deleteQuestion = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.questionBankService.deleteQuestion(req.params["id"] as string);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
