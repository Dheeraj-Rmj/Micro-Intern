import type { Request, Response, NextFunction } from "express";
import type { MessagingService } from "../application/MessagingService.js";

export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  sendMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const senderId = (req as any).user?.id as string;
      const senderRole = (req as any).user?.role as string;
      const message = await this.messagingService.sendMessage({
        journeyId: req.params["journeyId"] as string,
        senderId,
        senderRole,
        body: req.body.body,
      });
      res.status(201).json({ success: true, data: message });
    } catch (err) {
      next(err);
    }
  };

  getThread = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const thread = await this.messagingService.getThread(req.params["journeyId"] as string);
      res.status(200).json({ success: true, data: thread });
    } catch (err) {
      next(err);
    }
  };

  markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      await this.messagingService.markAsRead(req.params["journeyId"] as string, userId);
      res.status(200).json({ success: true });
    } catch (err) {
      next(err);
    }
  };

  getUnreadCount = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id as string;
      const count = await this.messagingService.getUnreadCount(
        req.params["journeyId"] as string,
        userId,
      );
      res.status(200).json({ success: true, data: { unreadCount: count } });
    } catch (err) {
      next(err);
    }
  };
}
