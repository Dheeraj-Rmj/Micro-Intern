import type { Request, Response, NextFunction } from "express";
import type { SlackService } from "../SlackService.js";

export class SlackController {
  constructor(private readonly slackService: SlackService) {}

  configure = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId as string;
      const integration = await this.slackService.configureIntegration(
        companyId,
        req.body.webhookUrl,
        req.body.channelName,
        req.body.events ?? ["CANDIDATE_APPLIED", "ASSESSMENT_SUBMITTED", "CANDIDATE_HIRED"],
      );
      res.status(200).json({ success: true, data: integration });
    } catch (err) {
      next(err);
    }
  };

  getIntegration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId as string;
      const integration = await this.slackService.getIntegration(companyId);
      res.status(200).json({ success: true, data: integration });
    } catch (err) {
      next(err);
    }
  };

  deleteIntegration = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId as string;
      await this.slackService.deleteIntegration(companyId);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
