import { PrismaClient } from "@microintern/database";
import { NotFoundError } from "@/shared/errors/AppError.js";

export class GetDashboardStatsUseCase {
  constructor(private db: PrismaClient) {}

  async execute(userId: string) {
    const candidate = await this.db.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: true,
        experiences: true,
        educations: true,
        certificates: true,
      },
    });

    if (!candidate) {
      throw new NotFoundError("Candidate profile not found");
    }

    // Calculate Trust Score (max 100)
    let trustScore = 0;
    
    // Base score from completion percentage (up to 40 points)
    trustScore += (candidate.completionPercentage || 0) * 0.4;
    
    // Verified skills bonus (up to 20 points, 4 pts each)
    const verifiedSkillsCount = candidate.skills.filter(s => s.verified).length;
    trustScore += Math.min(20, verifiedSkillsCount * 4);
    
    // Experience & Education (up to 20 points)
    if (candidate.experiences.length > 0) trustScore += 10;
    if (candidate.educations.length > 0) trustScore += 10;
    
    // Cap at 100
    trustScore = Math.min(100, Math.round(trustScore));

    // Calculate Real Earnings from database
    const earningsRecords = await this.db.candidateEarning.findMany({
      where: { candidateId: candidate.id },
    });

    let totalEarnings = 0;
    let pendingEarnings = 0;

    for (const earning of earningsRecords) {
      const amount = Number(earning.amount) || 0;
      if (earning.status === "AVAILABLE" || earning.status === "PAID") {
        totalEarnings += amount;
      } else if (earning.status === "PENDING") {
        pendingEarnings += amount;
      }
    }

    return {
      trustScore,
      earnings: {
        total: totalEarnings,
        pending: pendingEarnings,
        currency: "USD"
      }
    };
  }
}
