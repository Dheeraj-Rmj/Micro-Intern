import { describe, it, expect } from 'vitest';

import {
  PlatformStats,
  AdminUserNotFoundError,
  AdminCompanyNotFoundError,
  CompanyAlreadyVerifiedError,
  UserAlreadySuspendedError,
  CannotSuspendAdminError,
} from '@/modules/admin/domain/index.js';

describe('Admin Module Domain', () => {
  describe('PlatformStats Entity', () => {
    it('should aggregate metrics and accurately compute AI pass rates and rounding', () => {
      const stats = new PlatformStats({
        totalUsers: 150,
        activeUsers: 140,
        suspendedUsers: 10,
        totalCompanies: 25,
        activeCompanies: 20,
        pendingCompanies: 5,
        totalTrials: 50,
        activeTrials: 30,
        aiMetrics: {
          totalEvaluations: 3,
          passedEvaluations: 2,
          averagePercentageScore: 82.456,
        },
        timestamp: new Date('2026-07-26T12:00:00.000Z'),
      });

      expect(stats.passRate).toBe(66.67);
      expect(stats.aiMetrics.averagePercentageScore).toBe(82.46);

      const json = stats.toJSON();
      expect(json).toEqual({
        users: { total: 150, active: 140, suspended: 10 },
        companies: { total: 25, active: 20, pendingVerification: 5 },
        trials: { total: 50, active: 30 },
        aiUsage: {
          totalEvaluations: 3,
          passedEvaluations: 2,
          passRate: 66.67,
          averagePercentageScore: 82.46,
        },
        generatedAt: '2026-07-26T12:00:00.000Z',
      });
    });

    it('should handle zero evaluations cleanly without division by zero errors', () => {
      const stats = new PlatformStats({
        totalUsers: 10,
        activeUsers: 10,
        suspendedUsers: 0,
        totalCompanies: 2,
        activeCompanies: 2,
        pendingCompanies: 0,
        totalTrials: 5,
        activeTrials: 5,
        aiMetrics: {
          totalEvaluations: 0,
          passedEvaluations: 0,
          averagePercentageScore: 0,
        },
      });

      expect(stats.passRate).toBe(0);
      expect(stats.toJSON()).toHaveProperty('aiUsage.passRate', 0);
    });
  });

  describe('Admin Domain Errors', () => {
    it('should correctly format AdminUserNotFoundError', () => {
      const err = new AdminUserNotFoundError('usr-100');
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('ADMIN_USER_NOT_FOUND');
      expect(err.message).toContain('usr-100');
    });

    it('should correctly format AdminCompanyNotFoundError', () => {
      const err = new AdminCompanyNotFoundError('comp-100');
      expect(err.statusCode).toBe(404);
      expect(err.code).toBe('ADMIN_COMPANY_NOT_FOUND');
      expect(err.message).toContain('comp-100');
    });

    it('should correctly format CompanyAlreadyVerifiedError', () => {
      const err = new CompanyAlreadyVerifiedError('comp-100');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('COMPANY_ALREADY_VERIFIED');
    });

    it('should correctly format UserAlreadySuspendedError', () => {
      const err = new UserAlreadySuspendedError('usr-100');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('USER_ALREADY_SUSPENDED');
    });

    it('should correctly format CannotSuspendAdminError', () => {
      const err = new CannotSuspendAdminError('admin-100');
      expect(err.statusCode).toBe(400);
      expect(err.code).toBe('CANNOT_SUSPEND_ADMIN');
    });
  });
});
