import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GetPlatformStatsUseCase } from '@/modules/admin/application/index.js';

import type { IAdminRepository } from '@/modules/admin/application/index.js';

describe('GetPlatformStatsUseCase', () => {
  let useCase: GetPlatformStatsUseCase;
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      getPlatformStatsProps: vi.fn(),
      findCompanyById: vi.fn(),
      updateCompanyStatus: vi.fn(),
      listPendingCompanies: vi.fn(),
      findUserById: vi.fn(),
      updateUserStatus: vi.fn(),
    };

    useCase = new GetPlatformStatsUseCase(mockRepository);
  });

  it('should retrieve metrics from repository and return formatted JSON output', async () => {
    mockRepository.getPlatformStatsProps.mockResolvedValue({
      totalUsers: 100,
      activeUsers: 95,
      suspendedUsers: 5,
      totalCompanies: 20,
      activeCompanies: 15,
      pendingCompanies: 5,
      totalAssessments: 40,
      activeAssessments: 25,
      aiMetrics: {
        totalEvaluations: 50,
        passedEvaluations: 40,
        averagePercentageScore: 88.5,
      },
      timestamp: new Date('2026-07-26T15:00:00.000Z'),
    });

    const result = await useCase.execute();

    expect(mockRepository.getPlatformStatsProps).toHaveBeenCalledOnce();
    expect(result).toEqual({
      users: { total: 100, active: 95, suspended: 5 },
      companies: { total: 20, active: 15, pendingVerification: 5 },
      assessments: { total: 40, active: 25 },
      aiUsage: {
        totalEvaluations: 50,
        passedEvaluations: 40,
        passRate: 80,
        averagePercentageScore: 88.5,
      },
      generatedAt: '2026-07-26T15:00:00.000Z',
    });
  });
});
