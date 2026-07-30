import type { PrismaClient } from "@microintern/database";

export class ReportingService {
  constructor(private readonly prisma: PrismaClient) {}

  async generateCandidateReport(candidateId: string) {
    const portfolio = await this.prisma.candidatePortfolio.findUnique({
      where: { candidateId },
      include: { projects: true, achievements: true },
    });

    const verifications = await this.prisma.skillVerificationRecord.findMany({
      where: { candidateId },
      include: { skill: true } as any,
    });

    const evidence = await this.prisma.evidence.findMany({
      where: { candidateId, deletedAt: null },
    });

    const journeys = await this.prisma.candidateJourney.findMany({
      where: { candidateId },
    });

    return {
      candidateId,
      overallSkillScore: portfolio?.overallSkillScore ?? 0,
      verifiedSkillsCount: verifications.length,
      evidenceCount: evidence.length,
      projectsCount: portfolio?.projects?.length ?? 0,
      achievementsCount: portfolio?.achievements?.length ?? 0,
      journeys: journeys.map((j) => ({
        journeyId: j.id,
        companyId: j.companyId,
        status: j.status,
        overallScore: j.overallScore,
      })),
      verifications: verifications.map((v) => ({
        skillId: v.skillId,
        skillName: (v as any).skill?.name,
        status: v.status,
        confidenceScore: v.confidenceScore,
      })),
    };
  }

  async generateSkillReport() {
    const totalSkills = await this.prisma.skill.count();
    const totalCategories = await this.prisma.skillCategory.count();
    const verificationsGrouped = await this.prisma.skillVerificationRecord.groupBy({
      by: ["status"],
      _count: { skillId: true },
    });

    return {
      totalSkills,
      totalCategories,
      verificationsByStatus: verificationsGrouped.map((g) => ({
        status: g.status,
        count: g._count.skillId,
      })),
    };
  }

  async generateOrganizationReport(companyId: string) {
    const roleProfiles = await this.prisma.roleProfile.findMany({
      where: { companyId },
    });
    const journeys = await this.prisma.candidateJourney.findMany({
      where: { companyId },
    });

    const statusCounts: Record<string, number> = {};
    for (const j of journeys) {
      statusCounts[j.status] = (statusCounts[j.status] || 0) + 1;
    }

    return {
      companyId,
      roleProfilesCount: roleProfiles.length,
      candidatePipelineTotal: journeys.length,
      pipelineByStatus: statusCounts,
    };
  }

  exportToCsv(rows: Record<string, unknown>[]): string {
    if (rows.length === 0) {
      return "";
    }
    const headers = Object.keys(rows[0]!);
    const lines = [headers.join(",")];

    for (const row of rows) {
      const values = headers.map((h) => {
        const val = row[h];
        if (val === null || val === undefined) return "";
        const stringVal = typeof val === "object" ? JSON.stringify(val) : String(val);
        return `"${stringVal.replace(/"/g, '""')}"`;
      });
      lines.push(values.join(","));
    }

    return lines.join("\n");
  }
}
