import type { PrismaClient } from '@microintern/database';

export class GetProfileUseCase {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Retrieves a candidate profile and all its normalized relations.
   * Creates an empty profile if one doesn't exist.
   */
  async execute(userId: string) {
    let profile = await this.db.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: {
          where: { deletedAt: null },
          orderBy: { level: 'desc' },
        },
        educations: {
          where: { deletedAt: null },
          orderBy: { startDate: 'desc' },
        },
        experiences: {
          where: { deletedAt: null },
          orderBy: { startDate: 'desc' },
        },
        certificates: {
          where: { deletedAt: null },
          orderBy: { issueDate: 'desc' },
        },
        socials: {
          where: { deletedAt: null },
        },
        preferences: true,
        aiAnalyses: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Only return the latest AI analysis
        },
      },
    });

    // Lazy creation pattern: if a candidate hits the endpoint and doesn't have a profile, initialize it.
    profile ??= await this.db.candidateProfile.create({
      data: { userId },
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

    return profile;
  }
}
