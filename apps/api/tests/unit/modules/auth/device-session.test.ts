import { describe, it, expect, vi, beforeEach } from 'vitest';
import { parseDeviceFromRequest } from '@/shared/utils/device-parser.js';
import {
  ListSessionsUseCase,
  RevokeSessionUseCase,
  RevokeOtherSessionsUseCase,
} from '@/modules/auth/application/use-cases/session.usecase.js';
import type { ISessionService } from '@/modules/auth/application/interfaces/ISessionService.js';
import type { Request } from 'express';

describe('Device Logins & Session History', () => {
  describe('Device Parser Utility', () => {
    it('should correctly identify Windows Desktop and Chrome browser', () => {
      const mockReq = {
        headers: {
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          'x-forwarded-for': '192.168.1.100, 10.0.0.1',
        },
      } as unknown as Request;

      const parsed = parseDeviceFromRequest(mockReq);
      expect(parsed.deviceType).toBe('desktop');
      expect(parsed.os).toBe('Windows 11/10');
      expect(parsed.browser).toBe('Chrome 131');
      expect(parsed.ipAddress).toBe('192.168.1.100');
    });

    it('should correctly identify iPhone and Safari browser', () => {
      const mockReq = {
        headers: {
          'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
          'cf-ipcity': 'San Francisco',
          'cf-ipcountry': 'US',
        },
      } as unknown as Request;

      const parsed = parseDeviceFromRequest(mockReq);
      expect(parsed.deviceType).toBe('mobile');
      expect(parsed.os).toBe('iOS 18.1');
      expect(parsed.browser).toBe('Safari 18');
      expect(parsed.location).toBe('San Francisco, US');
    });

    it('should correctly identify iPad / Tablet and Firefox', () => {
      const mockReq = {
        headers: {
          'user-agent': 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/133.0 Mobile/15E148 Safari/605.1.15',
        },
      } as unknown as Request;

      const parsed = parseDeviceFromRequest(mockReq);
      expect(parsed.deviceType).toBe('tablet');
      expect(parsed.os).toBe('iPadOS 17.5');
    });
  });

  describe('Session Use Cases', () => {
    let mockSessionService: ISessionService;

    beforeEach(() => {
      mockSessionService = {
        createSession: vi.fn().mockResolvedValue('session-uuid-1'),
        isSessionValid: vi.fn().mockResolvedValue(true),
        listUserSessions: vi.fn().mockResolvedValue([
          {
            id: 'session-1',
            userId: 'user-1',
            deviceType: 'desktop',
            browser: 'Chrome 131',
            os: 'Windows 11/10',
            ipAddress: '127.0.0.1',
            location: 'Local Network (Dev)',
            isCurrent: true,
            isActive: true,
            lastActiveAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            expiresAt: new Date().toISOString(),
            revokedAt: null,
          },
          {
            id: 'session-2',
            userId: 'user-1',
            deviceType: 'mobile',
            browser: 'Safari 18',
            os: 'iOS 18',
            ipAddress: '192.168.1.5',
            location: 'Local Network (Dev)',
            isCurrent: false,
            isActive: true,
            lastActiveAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            expiresAt: new Date().toISOString(),
            revokedAt: null,
          },
        ]),
        revokeSession: vi.fn().mockResolvedValue(undefined),
        revokeOtherSessions: vi.fn().mockResolvedValue(1),
        revokeAllSessions: vi.fn().mockResolvedValue(undefined),
        touchSession: vi.fn().mockResolvedValue(undefined),
      };
    });

    it('ListSessionsUseCase should return all active sessions with current flag', async () => {
      const useCase = new ListSessionsUseCase(mockSessionService);
      const result = await useCase.execute('user-1', 'session-1');

      expect(mockSessionService.listUserSessions).toHaveBeenCalledWith('user-1', 'session-1');
      expect(result).toHaveLength(2);
      expect(result[0]?.isCurrent).toBe(true);
      expect(result[1]?.isCurrent).toBe(false);
    });

    it('RevokeSessionUseCase should revoke specified session', async () => {
      const useCase = new RevokeSessionUseCase(mockSessionService);
      const result = await useCase.execute('user-1', 'session-2');

      expect(mockSessionService.revokeSession).toHaveBeenCalledWith('user-1', 'session-2');
      expect(result.success).toBe(true);
      expect(result.revokedSessionId).toBe('session-2');
    });

    it('RevokeOtherSessionsUseCase should revoke all sessions except current', async () => {
      const useCase = new RevokeOtherSessionsUseCase(mockSessionService);
      const result = await useCase.execute('user-1', 'session-1');

      expect(mockSessionService.revokeOtherSessions).toHaveBeenCalledWith('user-1', 'session-1');
      expect(result.success).toBe(true);
      expect(result.revokedCount).toBe(1);
    });
  });
});
