import { createModuleLogger } from "@/core/logger.js";

import {
  NotificationNotFoundError,
  UnauthorizedNotificationAccessError,
} from "../../domain/errors/notification.errors.js";

import type { INotificationRepository } from "../ports/INotificationRepository.js";

const log = createModuleLogger("MarkNotificationReadUseCase");

export class MarkNotificationReadUseCase {
  constructor(private readonly repository: INotificationRepository) {}

  async execute(userId: string, notificationId: string): Promise<Record<string, unknown>> {
    log.info({ userId, notificationId }, "Attempting to mark notification as read");

    const notification = await this.repository.findById(notificationId);
    if (!notification) {
      log.warn({ notificationId }, "Notification record not found");
      throw new NotificationNotFoundError(notificationId);
    }

    if (notification.userId !== userId) {
      log.warn(
        { notificationId, requestingUserId: userId, ownerId: notification.userId },
        "Unauthorized attempt to modify notification",
      );
      throw new UnauthorizedNotificationAccessError(notificationId, userId);
    }

    notification.markAsRead();
    await this.repository.update(notification);

    log.info({ notificationId }, "Notification successfully marked as read");
    return notification.toJSON();
  }
}
