import { describe, it, expect, vi, beforeEach } from 'vitest';

import { GetProfileUseCase } from '@/modules/candidate/application/use-cases/get-profile.usecase.js';

describe('GetProfileUseCase', () => {
  let useCase: GetProfileUseCase;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      candidateProfile: {
        findUnique: vi.fn(),
        create: vi.fn(),
      },
    };
    useCase = new GetProfileUseCase(mockDb);
  });

  it('should return existing candidate profile with all normalized relations', async () => {
    const mockProfile = {
      id: 'prof-123',
      userId: 'user-123',
      headline: 'Developer',
      skills: [],
      educations: [],
      experiences: [],
      certificates: [],
      socials: [],
      preferences: null,
      aiAnalyses: [],
    };
    mockDb.candidateProfile.findUnique.mockResolvedValue(mockProfile);

    const result = await useCase.execute('user-123');
    expect(result).toEqual(mockProfile);
    expect(mockDb.candidateProfile.findUnique).toHaveBeenCalledWith({
      where: { userId: 'user-123' },
      include: expect.any(Object),
    });
    expect(mockDb.candidateProfile.create).not.toHaveBeenCalled();
  });

  it('should initialize a new empty candidate profile if one does not exist (lazy creation)', async () => {
    mockDb.candidateProfile.findUnique.mockResolvedValue(null);
    const newProfile = {
      id: 'prof-new',
      userId: 'user-123',
      skills: [],
      educations: [],
      experiences: [],
      certificates: [],
      socials: [],
      preferences: null,
      aiAnalyses: [],
    };
    mockDb.candidateProfile.create.mockResolvedValue(newProfile);

    const result = await useCase.execute('user-123');
    expect(result).toEqual(newProfile);
    expect(mockDb.candidateProfile.create).toHaveBeenCalledWith({
      data: { userId: 'user-123' },
      include: {
        skills: true,
        educations: true,
        experiences: true,
        certificates: true,
        socials: true,
        preferences: true,
        aiAnalyses: true,
      },
    });
  });
});
