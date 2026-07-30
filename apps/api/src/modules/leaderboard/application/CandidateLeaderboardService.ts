import { createModuleLogger } from '@/core/logger.js';
import type { PrismaClient } from '@microintern/database';

const log = createModuleLogger('CandidateLeaderboardService');

export type LeaderboardEntry = {
  rank: number;
  candidateId: string;
  candidateName: string;
  compositeScore: number;
  skillMatchPercentage: number | null;
  assessmentScore: number | null;
  verifiedSkillsCount: number;
  evidenceCount: number;
  journeyId: string;
  journeyStatus: string;
};

export class CandidateLeaderboardService {
  constructor(private readonly db: PrismaClient) {}

  async getRoleProfileLeaderboard(
    roleProfileId: string,
    companyId: string,
    limit = 50,
  ): Promise<LeaderboardEntry[]> {
    log.info({ roleProfileId, companyId }, 'Computing leaderboard');

    const journeys = await this.db.candidateJourney.findMany({
      where: { companyId, roleProfileId },
    });

    if (journeys.length === 0) return [];

    const candidateIds = journeys.map((j) => j.candidateId);

    // Count verified skills per candidate (using SkillVerificationRecord)
    const verificationRows = await this.db.skillVerificationRecord.findMany({
      where: {
        candidateId: { in: candidateIds },
        status: { in: ['AI_VERIFIED', 'HUMAN_VERIFIED', 'CERTIFIED'] },
      },
      select: { candidateId: true },
    });
    const verifiedMap = new Map<string, number>();
    for (const row of verificationRows) {
      verifiedMap.set(row.candidateId, (verifiedMap.get(row.candidateId) ?? 0) + 1);
    }

    // Count verified evidence per candidate
    const evidenceRows = await this.db.evidence.findMany({
      where: {
        candidateId: { in: candidateIds },
        verificationStatus: 'VERIFIED',
      },
      select: { candidateId: true },
    });
    const evidenceMap = new Map<string, number>();
    for (const row of evidenceRows) {
      evidenceMap.set(row.candidateId, (evidenceMap.get(row.candidateId) ?? 0) + 1);
    }

    // Get best submission score per candidate
    const submissions = await this.db.submission.findMany({
      where: { candidateId: { in: candidateIds }, status: 'PASSED' },
      orderBy: { totalScore: 'desc' },
      select: { candidateId: true, totalScore: true },
    });
    const submissionMap = new Map<string, number>();
    for (const sub of submissions) {
      if (!submissionMap.has(sub.candidateId) && sub.totalScore != null) {
        submissionMap.set(sub.candidateId, sub.totalScore);
      }
    }

    // Get candidate names
    const profiles = await this.db.candidateProfile.findMany({
      where: { id: { in: candidateIds } },
      select: { id: true, userId: true },
    });
    const users = await this.db.user.findMany({
      where: { id: { in: profiles.map((p) => p.userId) } },
      select: { id: true, firstName: true, lastName: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u]));
    const profileUserMap = new Map(profiles.map((p) => [p.id, p.userId]));

    // Compute composite scores
    const entries: LeaderboardEntry[] = journeys.map((journey) => {
      const skillMatch = journey.skillMatchPercentage ?? 0;
      const assessmentScore = submissionMap.get(journey.candidateId) ?? 0;
      const verifiedCount: number = verifiedMap.get(journey.candidateId) ?? 0;
      const evidenceCount: number = evidenceMap.get(journey.candidateId) ?? 0;

      // Weighted composite: 40% skill match, 35% assessment, 15% verifications, 10% evidence
      const composite =
        skillMatch * 0.4 +
        assessmentScore * 0.35 +
        Math.min(verifiedCount * 10, 100) * 0.15 +
        Math.min(evidenceCount * 10, 100) * 0.1;

      const userId = profileUserMap.get(journey.candidateId);
      const user = userId ? userMap.get(userId) : null;

      return {
        rank: 0,
        candidateId: journey.candidateId,
        candidateName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        compositeScore: Math.round(composite * 10) / 10,
        skillMatchPercentage: journey.skillMatchPercentage,
        assessmentScore: submissionMap.get(journey.candidateId) ?? null,
        verifiedSkillsCount: verifiedCount,
        evidenceCount: evidenceCount,
        journeyId: journey.id,
        journeyStatus: journey.status as string,
      };
    });

    // Sort and assign ranks
    entries.sort((a, b) => b.compositeScore - a.compositeScore);
    entries.forEach((entry, idx) => { entry.rank = idx + 1; });

    return entries.slice(0, limit);
  }

  async getCompanyLeaderboard(companyId: string, limit = 20): Promise<LeaderboardEntry[]> {
    const journeys = await this.db.candidateJourney.findMany({
      where: { companyId },
      orderBy: { overallScore: 'desc' },
      take: limit * 3,
      select: { roleProfileId: true },
    });

    const topRoleProfileId = journeys.find((j) => j.roleProfileId)?.roleProfileId;
    if (!topRoleProfileId) return [];

    return this.getRoleProfileLeaderboard(topRoleProfileId, companyId, limit);
  }
}
