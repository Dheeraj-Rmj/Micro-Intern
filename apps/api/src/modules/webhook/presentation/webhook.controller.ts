import type { Request, Response, NextFunction } from 'express';
import type { WebhookService } from '../application/WebhookService.js';

export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  createWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId || req.body.companyId;
      const webhook = await this.webhookService.createWebhook({ ...req.body, companyId });
      res.status(201).json({ success: true, data: webhook });
    } catch (err) { next(err); }
  };

  listWebhooks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const companyId = (req as any).user?.companyId as string;
      const webhooks = await this.webhookService.listCompanyWebhooks(companyId);
      res.status(200).json({ success: true, data: webhooks });
    } catch (err) { next(err); }
  };

  deleteWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.webhookService.deleteWebhook(req.params['id'] as string);
      res.status(204).send();
    } catch (err) { next(err); }
  };

  toggleWebhook = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const webhook = await this.webhookService.toggleWebhook(req.params['id'] as string, req.body.isActive);
      res.status(200).json({ success: true, data: webhook });
    } catch (err) { next(err); }
  };

  getDeliveries = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const deliveries = await this.webhookService.getDeliveries(req.params['id'] as string);
      res.status(200).json({ success: true, data: deliveries });
    } catch (err) { next(err); }
  };
}
