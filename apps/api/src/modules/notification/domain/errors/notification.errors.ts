import { AppError } from "@/shared/errors/AppError.js";

export class NotificationNotFoundError extends AppError {
  constructor(notificationId: string) {
    super({
      code: "NOTIFICATION_NOT_FOUND" as any,
      message: `Notification with ID ${notificationId} was not found`,
      statusCode: 404,
    });
  }
}

export class UnauthorizedNotificationAccessError extends AppError {
  constructor(notificationId: string, userId: string) {
    super({
      code: "UNAUTHORIZED_NOTIFICATION_ACCESS" as any,
      message: `User ${userId} does not have access to notification ${notificationId}`,
      statusCode: 403,
    });
  }
}
