import type { Notification } from '../../domain/entities/Notification.entity.js';

export interface PaginatedNotifications {
  items: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface INotificationRepository {
  create(notification: Notification): Promise<void>;
  findById(id: string): Promise<Notification | null>;
  listByUser(userId: string, page: number, limit: number, unreadOnly?: boolean): Promise<PaginatedNotifications>;
  update(notification: Notification): Promise<void>;
  markAllReadByUser(userId: string): Promise<number>;
}
