import { createModuleLogger } from '@/core/logger.js';

import type { PrismaClient } from '@microintern/database';

const log = createModuleLogger('CalculateCompletionUseCase');

/**
 * Weights for the candidate profile completion algorithm.
 * Must total 100%.
 */
const WEIGHTS = {
  BASIC_INFO: 15,
  AVATAR: 5,
  RESUME: 15,
  SKILLS: 20,
  EDUCATION: 15,
  EXPERIENCE: 15,
  SOCIAL_LINKS: 10,
  PREFERENCES: 5,
};

export class CalculateCompletionUseCase {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Recalculates the profile completion percentage for a given user
   * based on the completeness of their normalized relations.
   */
  async execute(userId: string): Promise<number> {
    const profile = await this.db.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        educations: true,
        experiences: true,
        socials: true,
        preferences: true,
      },
    });

    if (!profile) {
      return 0;
    }

    let score = 0;

    // 1. Basic Info (15%)
    if ((profile.headline ?? '') !== '' && (profile.bio ?? '') !== '' && (profile.location ?? '') !== '') {
      score += WEIGHTS.BASIC_INFO;
    } else if ((profile.headline ?? '') !== '' || (profile.bio ?? '') !== '') {
      score += WEIGHTS.BASIC_INFO / 2; // Partial credit
    }

    // 2. Avatar (5%)
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if ((user?.avatarUrl ?? '') !== '') {
      score += WEIGHTS.AVATAR;
    }

    // 3. Resume (15%)
    if ((profile.resumeUrl ?? '') !== '') {
      score += WEIGHTS.RESUME;
    }

    // 4. Skills (20%) - Expecting at least 3 skills for full score
    if (profile.skills.length >= 3) {
      score += WEIGHTS.SKILLS;
    } else if (profile.skills.length > 0) {
      score += WEIGHTS.SKILLS / 2;
    }

    // 5. Education (15%) - Expecting at least 1
    if (profile.educations.length > 0) {
      score += WEIGHTS.EDUCATION;
    }

    // 6. Experience (15%) - Expecting at least 1
    if (profile.experiences.length > 0) {
      score += WEIGHTS.EXPERIENCE;
    }

    // 7. Social Links (10%) - Expecting at least 1 (e.g. LinkedIn or GitHub)
    if (profile.socials.length > 0) {
      score += WEIGHTS.SOCIAL_LINKS;
    }

    // 8. Preferences (5%)
    if (profile.preferences && profile.preferences.employmentType.length > 0) {
      score += WEIGHTS.PREFERENCES;
    }

    const finalScore = Math.min(100, Math.round(score));

    // Persist the computed score
    if (profile.completionPercentage !== finalScore) {
      await this.db.candidateProfile.update({
        where: { id: profile.id },
        data: { completionPercentage: finalScore },
      });
      log.info({ userId, oldScore: profile.completionPercentage, newScore: finalScore }, 'Recalculated profile completion');
    }

    return finalScore;
  }
}
