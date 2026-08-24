import { createModuleLogger } from "@/core/logger.js";
import type { PrismaClient } from "@microintern/database";

const log = createModuleLogger("DiversityAnalyticsService");

export class DiversityAnalyticsService {
  constructor(private readonly db: PrismaClient) {}

  async submitDiversityData(
    candidateId: string,
    data: {
      gender?: string;
      ageRange?: string;
      ethnicity?: string;
      disability?: boolean;
      veteranStatus?: boolean;
    },
  ) {
    return this.db.diversityAnalytics.upsert({
      where: { candidateId },
      create: { candidateId, ...data },
      update: { ...data },
    });
  }

  async getCompanyDiversityReport(companyId: string) {
    log.info({ companyId }, "Generating diversity report");

    // Get all candidates who applied to this company
    const journeys = await this.db.candidateJourney.findMany({
      where: { companyId },
      select: { candidateId: true, status: true },
    });

    const candidateIds = journeys.map((j) => j.candidateId);
    const datapoints = await this.db.diversityAnalytics.findMany({
      where: { candidateId: { in: candidateIds } },
    });

    const totalCandidates = candidateIds.length;
    const withData = datapoints.length;

    // Aggregate gender breakdown
    const genderBreakdown = this.aggregate(datapoints, "gender");
    const ageRangeBreakdown = this.aggregate(datapoints, "ageRange");
    const ethnicityBreakdown = this.aggregate(datapoints, "ethnicity");

    // Pipeline funnel by stage
    const funnelByStage = this.buildFunnel(journeys);

    return {
      summary: {
        totalCandidates,
        candidatesWithDiversityData: withData,
        dataCompletionRate:
          totalCandidates > 0 ? Math.round((withData / totalCandidates) * 100) : 0,
      },
      breakdown: {
        gender: genderBreakdown,
        ageRange: ageRangeBreakdown,
        ethnicity: ethnicityBreakdown,
        disabilityCount: datapoints.filter((d) => d.disability).length,
        veteranCount: datapoints.filter((d) => d.veteranStatus).length,
      },
      pipelineFunnel: funnelByStage,
      disclaimer:
        "All data is anonymized and aggregated. Individual candidates are never identified in this report.",
    };
  }

  async getPlatformDiversityReport() {
    const datapoints = await this.db.diversityAnalytics.findMany();
    return {
      total: datapoints.length,
      gender: this.aggregate(datapoints, "gender"),
      ageRange: this.aggregate(datapoints, "ageRange"),
      ethnicity: this.aggregate(datapoints, "ethnicity"),
      disclaimer: "Platform-wide anonymized aggregate data.",
    };
  }

  private aggregate(data: any[], field: string): Record<string, number> {
    const result: Record<string, number> = {};
    for (const item of data) {
      const val = item[field] ?? "Not specified";
      result[val] = (result[val] ?? 0) + 1;
    }
    return result;
  }

  private buildFunnel(journeys: Array<{ status: string }>): Record<string, number> {
    const funnel: Record<string, number> = {};
    for (const j of journeys) {
      funnel[j.status] = (funnel[j.status] ?? 0) + 1;
    }
    return funnel;
  }
}
