import { describe, it, expect, vi, beforeEach } from 'vitest';

import { UpdateProfileUseCase } from '@/modules/candidate/application/use-cases/update-profile.usecase.js';
import { CandidateProfileNotFoundError, CandidateProfileConflictError } from '@/modules/candidate/domain/candidate.errors.js';

describe('UpdateProfileUseCase', () => {
  let useCase: UpdateProfileUseCase;
  let mockDb: any;
  let mockCalcCompletion: any;

  beforeEach(() => {
    mockDb = {
      candidateProfile: {
        findUnique: vi.fn(),
      },
      $transaction: vi.fn(async (cb) => cb(mockTx)),
    };
    mockCalcCompletion = {
      execute: vi.fn().mockResolvedValue(80),
    };
    useCase = new UpdateProfileUseCase(mockDb, mockCalcCompletion);
  });

  const mockTx: any = {
    candidateProfile: { update: vi.fn().mockResolvedValue({ id: 'prof-1', headline: 'New Headline' }) },
    candidateSkill: { updateMany: vi.fn(), createMany: vi.fn() },
    candidateExperience: { updateMany: vi.fn(), createMany: vi.fn() },
    candidateEducation: { updateMany: vi.fn(), createMany: vi.fn() },
    candidateCertificate: { updateMany: vi.fn(), createMany: vi.fn() },
    candidateSocial: { deleteMany: vi.fn(), createMany: vi.fn() },
    candidatePreference: { upsert: vi.fn() },
    auditLog: { create: vi.fn() },
  };

  it('should throw CandidateProfileNotFoundError if user profile does not exist', async () => {
    mockDb.candidateProfile.findUnique.mockResolvedValue(null);
    await expect(useCase.execute('user-1', { profile: { headline: 'Dev' } } as any)).rejects.toThrow(
      CandidateProfileNotFoundError
    );
  });

  it('should throw CandidateProfileConflictError on optimistic concurrency timestamp mismatch', async () => {
    const now = Date.now();
    mockDb.candidateProfile.findUnique.mockResolvedValue({
      id: 'prof-1',
      updatedAt: new Date(now + 10000), // Server version is newer
    });
    await expect(
      useCase.execute('user-1', { profile: { headline: 'Dev', updatedAt: new Date(now).toISOString() } } as any)
    ).rejects.toThrow(CandidateProfileConflictError);
  });

  it('should successfully update core profile, skills, and trigger completion recalculation', async () => {
    const now = Date.now();
    mockDb.candidateProfile.findUnique.mockResolvedValue({
      id: 'prof-1',
      updatedAt: new Date(now),
    });

    const result = await useCase.execute('user-1', {
      profile: { headline: 'Updated Headline', updatedAt: new Date(now).toISOString() },
      skills: [{ skill: 'TypeScript', level: 'EXPERT' } as any],
    } as any);

    expect(result).toEqual({ id: 'prof-1', headline: 'New Headline' });
    expect(mockTx.candidateProfile.update).toHaveBeenCalled();
    expect(mockTx.candidateSkill.updateMany).toHaveBeenCalledWith({
      where: { candidateId: 'prof-1', deletedAt: null },
      data: { deletedAt: expect.any(Date) },
    });
    expect(mockTx.candidateSkill.createMany).toHaveBeenCalledWith({
      data: [{ candidateId: 'prof-1', skill: 'TypeScript', level: 'EXPERT' }],
    });
    expect(mockTx.auditLog.create).toHaveBeenCalled();
  });
});
