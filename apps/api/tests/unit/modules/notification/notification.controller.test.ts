import { describe, it, expect, vi, beforeEach } from 'vitest';

import { NotificationController } from '@/modules/notification/presentation/notification.controller.js';
import { ResponseFormatter } from '@/shared/response/ResponseFormatter.js';

import type { Request, Response, NextFunction } from 'express';

describe('NotificationController', () => {
  let controller: NotificationController;
  let mockListUseCase: any;
  let mockMarkReadUseCase: any;
  let mockMarkAllReadUseCase: any;

  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    mockListUseCase = {
      execute: vi.fn().mockResolvedValue({ items: [{ id: 'notif-1' }], total: 1 }),
    };
    mockMarkReadUseCase = {
      execute: vi.fn().mockResolvedValue({ id: 'notif-1', isRead: true }),
    };
    mockMarkAllReadUseCase = {
      execute: vi.fn().mockResolvedValue({ count: 3 }),
    };

    controller = new NotificationController(mockListUseCase, mockMarkReadUseCase, mockMarkAllReadUseCase);

    req = {
      user: { id: 'usr-authed', role: 'CANDIDATE' } as any,
      query: { page: '1', limit: '10', unreadOnly: 'false' },
      params: { id: 'notif-1' },
    };

    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      req: { id: 'req-uuid' } as any,
    } as any;

    next = vi.fn();
    vi.spyOn(ResponseFormatter, 'success');
  });

  describe('list', () => {
    it('should retrieve paginated user alerts and respond with 200 Success', async () => {
      await controller.list(req as Request, res as Response, next);
      expect(mockListUseCase.execute).toHaveBeenCalledWith('usr-authed', { page: 1, limit: 10, unreadOnly: false });
      expect(ResponseFormatter.success).toHaveBeenCalledWith(res, expect.objectContaining({ total: 1 }));
    });
  });

  describe('markRead', () => {
    it('should mark specific notification as read and respond with 200 Success', async () => {
      await controller.markRead(req as Request, res as Response, next);
      expect(mockMarkReadUseCase.execute).toHaveBeenCalledWith('usr-authed', 'notif-1');
      expect(ResponseFormatter.success).toHaveBeenCalledWith(res, expect.objectContaining({ isRead: true }));
    });
  });

  describe('markAllRead', () => {
    it('should clear all unread alerts for user and respond with 200 Success', async () => {
      await controller.markAllRead(req as Request, res as Response, next);
      expect(mockMarkAllReadUseCase.execute).toHaveBeenCalledWith('usr-authed');
      expect(ResponseFormatter.success).toHaveBeenCalledWith(res, { count: 3 });
    });
  });
});
