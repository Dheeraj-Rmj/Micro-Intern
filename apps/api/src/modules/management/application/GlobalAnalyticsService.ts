import { PrismaClient } from '@microintern/database';
import { createModuleLogger } from '@/core/logger.js';

const log = createModuleLogger('GlobalAnalyticsService');

export class GlobalAnalyticsService {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * For Super Admins: Get a bird's-eye view of platform AI usage
   */
  public async getAITelemetryAndCosts(): Promise<any> {
    log.info('Aggregating global AI telemetry data...');

    const logs = await this.prisma.aILog.findMany();
    
    let totalCost = 0;
    let totalTokens = 0;
    const promptUsage: Record<string, number> = {};
    const companyCosts: Record<string, number> = {};

    for (const entry of logs) {
      totalCost += entry.cost;
      totalTokens += entry.tokensUsed;

      promptUsage[entry.promptType] = (promptUsage[entry.promptType] || 0) + 1;
      
      if (entry.companyId) {
        companyCosts[entry.companyId] = (companyCosts[entry.companyId] || 0) + entry.cost;
      }
    }

    return {
      totalPlatformCost: totalCost,
      totalTokensConsumed: totalTokens,
      breakdownByPromptType: promptUsage,
      topCostingCompanies: Object.entries(companyCosts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([companyId, cost]) => ({ companyId, cost }))
    };
  }

  /**
   * For Super Admins: See which skills are trending globally across all Role Profiles
   */
  public async getGlobalSkillTrends(): Promise<any> {
    log.info('Analyzing global skill demand trends...');

    // Group by skillId in RequiredSkill
    const requiredSkills = await this.prisma.requiredSkill.groupBy({
      by: ['skillId'],
      _count: {
        skillId: true,
      },
      orderBy: {
        _count: {
          skillId: 'desc',
        },
      },
      take: 20
    });

    const topSkillIds = requiredSkills.map(s => s.skillId);
    
    const skills = await this.prisma.skill.findMany({
      where: { id: { in: topSkillIds } }
    });

    const skillMap = new Map(skills.map(s => [s.id, s.name]));

    const trends = requiredSkills.map(rs => ({
      skillId: rs.skillId,
      skillName: skillMap.get(rs.skillId) || 'Unknown',
      companiesDemandingIt: rs._count.skillId
    }));

    return {
      topDemandedSkills: trends,
    };
  }
}
