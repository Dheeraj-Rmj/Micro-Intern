import { createModuleLogger } from "@/core/logger.js";
import { PrismaClient, NotificationChannel, Notification } from "@microintern/database";

const log = createModuleLogger("NotificationService");

export interface CreateNotificationDTO {
  userId: string;
  channel: NotificationChannel;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export class NotificationService {
  constructor(private readonly prisma: PrismaClient) {}

  async createNotification(dto: CreateNotificationDTO): Promise<Notification> {
    log.info({ userId: dto.userId, type: dto.type }, "Creating in-app notification");
    return this.prisma.notification.create({
      data: {
        userId: dto.userId,
        channel: dto.channel,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        data: (dto.data || {}) as any,
      },
    });
  }

  async getUserNotifications(userId: string, limit = 50, includeRead = true): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(includeRead ? {} : { isRead: false }),
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    log.info({ notificationId, userId }, "Marking notification as read");
    return this.prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async markAllAsRead(userId: string) {
    log.info({ userId }, "Marking all notifications as read");
    return this.prisma.notification.updateMany({
      where: {
        userId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }
}
