import { NotificationChannel } from '@microintern/shared';
import { describe, it, expect } from 'vitest';

import { Notification } from '@/modules/notification/domain/entities/Notification.entity.js';
import { NotificationNotFoundError, UnauthorizedNotificationAccessError } from '@/modules/notification/domain/errors/notification.errors.js';

describe('Notification Domain Layer', () => {
  describe('Notification Entity', () => {
    it('should throw an error if userId is missing or empty', () => {
      expect(() =>
        Notification.create({ userId: '', type: 'ALERT', title: 'Test', body: 'Body' })
      ).toThrow('Notification requires a valid userId');
    });

    it('should throw an error if title or body is missing or empty', () => {
      expect(() =>
        Notification.create({ userId: 'usr-1', type: 'ALERT', title: '', body: 'Body' })
      ).toThrow('Notification requires a non-empty title');

      expect(() =>
        Notification.create({ userId: 'usr-1', type: 'ALERT', title: 'Title', body: '' })
      ).toThrow('Notification requires a non-empty body');
    });

    it('should create valid notification entity with defaults and allow markAsRead transition', () => {
      const notif = Notification.create({
        userId: 'usr-123',
        type: 'COMPANY_VERIFIED',
        title: 'Verified',
        body: 'You are verified.',
      });

      expect(notif.id).toBeDefined();
      expect(notif.channel).toBe(NotificationChannel.IN_APP);
      expect(notif.isRead).toBe(false);
      expect(notif.readAt).toBe(null);

      notif.markAsRead();
      expect(notif.isRead).toBe(true);
      expect(notif.readAt).toBeInstanceOf(Date);

      const json = notif.toJSON();
      expect(json).toMatchObject({
        id: notif.id,
        userId: 'usr-123',
        type: 'COMPANY_VERIFIED',
        title: 'Verified',
        isRead: true,
      });
    });
  });

  describe('Notification Domain Errors', () => {
    it('should correctly format NotificationNotFoundError', () => {
      const err = new NotificationNotFoundError('notif-100');
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('NOTIFICATION_NOT_FOUND');
    });

    it('should correctly format UnauthorizedNotificationAccessError', () => {
      const err = new UnauthorizedNotificationAccessError('notif-100', 'usr-200');
      expect(err.statusCode).toBe(403);
      expect(err.code).toBe('UNAUTHORIZED_NOTIFICATION_ACCESS');
    });
  });
});
