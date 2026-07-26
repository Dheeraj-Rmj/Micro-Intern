import { describe, it, expect, vi, beforeEach } from 'vitest';

import {
  ListNotificationsUseCase,
  MarkNotificationReadUseCase,
  MarkAllNotificationsReadUseCase,
} from '@/modules/notification/application/index.js';
import { Notification } from '@/modules/notification/domain/entities/Notification.entity.js';
import { NotificationNotFoundError, UnauthorizedNotificationAccessError } from '@/modules/notification/domain/errors/notification.errors.js';

describe('Notification Use Cases', () => {
  let listUseCase: ListNotificationsUseCase;
  let markReadUseCase: MarkNotificationReadUseCase;
  let markAllReadUseCase: MarkAllNotificationsReadUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      create: vi.fn(),
      findById: vi.fn(),
      listByUser: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, limit: 10, totalPages: 1 }),
      update: vi.fn(),
      markAllReadByUser: vi.fn().mockResolvedValue(5),
    };

    listUseCase = new ListNotificationsUseCase(mockRepo);
    markReadUseCase = new MarkNotificationReadUseCase(mockRepo);
    markAllReadUseCase = new MarkAllNotificationsReadUseCase(mockRepo);
  });

  describe('ListNotificationsUseCase', () => {
    it('should query repository with paginated user constraints and unread filter options', async () => {
      await listUseCase.execute('usr-123', { page: 2, limit: 20, unreadOnly: true });
      expect(mockRepo.listByUser).toHaveBeenCalledWith('usr-123', 2, 20, true);
    });
  });

  describe('MarkNotificationReadUseCase', () => {
    it('should throw NotificationNotFoundError if notification does not exist in repo', async () => {
      mockRepo.findById.mockResolvedValueOnce(null);
      await expect(markReadUseCase.execute('usr-123', 'notif-999')).rejects.toThrow(NotificationNotFoundError);
    });

    it('should throw UnauthorizedNotificationAccessError if user is not the notification owner', async () => {
      const notif = Notification.create({ userId: 'usr-owner', type: 'INFO', title: 'Hi', body: 'Text' });
      mockRepo.findById.mockResolvedValueOnce(notif);
      await expect(markReadUseCase.execute('usr-stranger', notif.id)).rejects.toThrow(UnauthorizedNotificationAccessError);
    });

    it('should mark notification as read and invoke repository update', async () => {
      const notif = Notification.create({ userId: 'usr-owner', type: 'INFO', title: 'Hi', body: 'Text' });
      mockRepo.findById.mockResolvedValueOnce(notif);

      const result = await markReadUseCase.execute('usr-owner', notif.id);
      expect(result['isRead']).toBe(true);
      expect(mockRepo.update).toHaveBeenCalledOnce();
    });
  });

  describe('MarkAllNotificationsReadUseCase', () => {
    it('should instruct repository to bulk clear unread alerts for the authenticating user', async () => {
      const res = await markAllReadUseCase.execute('usr-bulk');
      expect(mockRepo.markAllReadByUser).toHaveBeenCalledWith('usr-bulk');
      expect(res).toEqual({ count: 5 });
    });
  });
});
