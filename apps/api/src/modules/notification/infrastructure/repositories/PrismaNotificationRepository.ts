import { Notification } from "../../domain/entities/Notification.entity.js";

import type {
  INotificationRepository,
  PaginatedNotifications,
} from "../../application/ports/INotificationRepository.js";
import type { PrismaClient } from "@microintern/database";
import type { NotificationChannel } from "@microintern/shared";

export class PrismaNotificationRepository implements INotificationRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(notification: Notification): Promise<void> {
    await this.db.notification.create({
      data: {
        id: notification.id,
        userId: notification.userId,
        channel: notification.channel as unknown as any,
        type: notification.type,
        title: notification.title,
        body: notification.body,
        data: notification.data as unknown as any,
        isRead: notification.isRead,
        readAt: notification.readAt,
        sentAt: notification.sentAt,
        createdAt: notification.createdAt,
      },
    });
  }

  async findById(id: string): Promise<Notification | null> {
    const record = await this.db.notification.findUnique({
      where: { id },
    });
    if (!record) return null;

    return Notification.create({
      id: record.id,
      userId: record.userId,
      channel: record.channel as unknown as NotificationChannel,
      type: record.type,
      title: record.title,
      body: record.body,
      data: (record.data as Record<string, unknown>) || {},
      isRead: record.isRead,
      readAt: record.readAt,
      sentAt: record.sentAt,
      createdAt: record.createdAt,
    });
  }

  async listByUser(
    userId: string,
    page: number,
    limit: number,
    unreadOnly?: boolean,
  ): Promise<PaginatedNotifications> {
    const where: { userId: string; isRead?: boolean } = { userId };
    if (unreadOnly) {
      where.isRead = false;
    }

    const skip = (page - 1) * limit;
    const [records, total] = await Promise.all([
      this.db.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.db.notification.count({ where }),
    ]);

    const items = records.map((r) =>
      Notification.create({
        id: r.id,
        userId: r.userId,
        channel: r.channel as unknown as NotificationChannel,
        type: r.type,
        title: r.title,
        body: r.body,
        data: (r.data as Record<string, unknown>) || {},
        isRead: r.isRead,
        readAt: r.readAt,
        sentAt: r.sentAt,
        createdAt: r.createdAt,
      }).toJSON(),
    );

    const totalPages = Math.ceil(total / limit) || 1;

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async update(notification: Notification): Promise<void> {
    await this.db.notification.update({
      where: { id: notification.id },
      data: {
        isRead: notification.isRead,
        readAt: notification.readAt,
      },
    });
  }

  async markAllReadByUser(userId: string): Promise<number> {
    const result = await this.db.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
    return result.count;
  }
}
