import { prisma } from "@/core/database.js";
import { createModuleLogger } from "@/core/logger.js";

const log = createModuleLogger("FeatureFlagService");

export type AIFeatureKey =
  | "AI_ASSESSMENT_GENERATION"
  | "AI_RUBRIC"
  | "AI_REWRITE"
  | "AI_SKILL_SUGGESTIONS"
  | "AI_INTERVIEW_QUESTIONS"
  | "AI_EVALUATION_NOTES"
  | string;

export interface IFeatureFlagService {
  isEnabled(key: AIFeatureKey, companyId?: string): Promise<boolean>;
  listFlags(): Promise<any[]>;
  setFlag(
    key: string,
    isEnabled: boolean,
    description?: string,
    companyIds?: string[],
  ): Promise<any>;
}

export class FeatureFlagService implements IFeatureFlagService {
  private static instance: FeatureFlagService;

  private constructor() {}

  public static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Check if an AI capability or feature flag is enabled for a given company.
   * Defaults to TRUE if no override flag exists in the database.
   */
  public async isEnabled(key: AIFeatureKey, companyId?: string): Promise<boolean> {
    try {
      const flag = await prisma.featureFlag.findUnique({
        where: { key },
      });

      if (!flag) {
        // By default, enterprise AI Studio capabilities are active unless explicitly disabled
        return true;
      }

      if (!flag.isEnabled) {
        return false;
      }

      // If companyIds whitelist is non-empty, companyId must be present
      if (flag.companyIds && flag.companyIds.length > 0) {
        if (!companyId) return false;
        return flag.companyIds.includes(companyId);
      }

      return true;
    } catch (err) {
      log.error({ err, key }, "Error reading feature flag, defaulting to enabled");
      return true;
    }
  }

  /**
   * List all system feature flags.
   */
  public async listFlags(): Promise<any[]> {
    return prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    });
  }

  /**
   * Create or update a feature flag.
   */
  public async setFlag(
    key: string,
    isEnabled: boolean,
    description = "AI Capability flag",
    companyIds: string[] = [],
  ): Promise<any> {
    return prisma.featureFlag.upsert({
      where: { key },
      create: {
        key,
        isEnabled,
        description,
        companyIds,
      },
      update: {
        isEnabled,
        description,
        companyIds,
      },
    });
  }
}
