import { ResponseFormatter } from "@/shared/response/ResponseFormatter.js";

import type {
  ListNotificationsUseCase,
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
} from "../application/index.js";
import type { Request, Response, NextFunction } from "express";

export class NotificationController {
  constructor(
    private readonly listNotificationsUseCase: ListNotificationsUseCase,
    private readonly markNotificationReadUseCase: MarkNotificationReadUseCase,
    private readonly markAllNotificationsReadUseCase: MarkAllNotificationsReadUseCase,
  ) {}

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    const page = parseInt(req.query["page"] as string, 10) || 1;
    const limit = parseInt(req.query["limit"] as string, 10) || 10;
    const unreadOnly = req.query["unreadOnly"] === "true";

    const paginated = await this.listNotificationsUseCase.execute(req.user!.id, {
      page,
      limit,
      unreadOnly,
    });
    ResponseFormatter.success(res, paginated);
  }

  async markRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    const id = req.params["id"] as string;
    const result = await this.markNotificationReadUseCase.execute(req.user!.id, id);
    ResponseFormatter.success(res, result);
  }

  async markAllRead(req: Request, res: Response, next: NextFunction): Promise<void> {
    const result = await this.markAllNotificationsReadUseCase.execute(req.user!.id);
    ResponseFormatter.success(res, result);
  }
}
