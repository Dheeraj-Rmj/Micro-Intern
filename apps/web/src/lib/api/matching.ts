import { apiClient } from "./client";

export interface RoleMatchResult {
  roleProfileId: string;
  candidateId: string;
  overallMatchScore: number;
  skillMatchPercentage: number;
  competencyMatchPercentage: number;
  evidenceMatchPercentage: number;
  confidenceScore: number;
  skillGaps: Array<{
    skillId: string;
    skillName?: string;
    minimumScore: number;
    actualScore: number;
    isCritical: boolean;
  }>;
  growthPotentialScore: number;
  recommendation: "STRONG_MATCH" | "POTENTIAL_MATCH" | "DEVELOPMENT_NEEDED" | "MISMATCH";
}

export const matchingApi = {
  /**
   * Evaluates a candidate against a specific role profile using the AI engine.
   */
  matchCandidate: async (roleProfileId: string, candidateId: string): Promise<RoleMatchResult> => {
    const response = await apiClient.post<{ success: boolean; data: RoleMatchResult }>(
      "/matching/candidate",
      { roleProfileId, candidateId }
    );
    return response.data.data;
  },

  /**
   * Evaluates and ranks multiple candidates against a role profile.
   */
  rankCandidates: async (roleProfileId: string, candidateIds: string[]): Promise<Array<RoleMatchResult & { rank: number }>> => {
    const response = await apiClient.post<{ success: boolean; data: Array<RoleMatchResult & { rank: number }> }>(
      "/matching/rank",
      { roleProfileId, candidateIds }
    );
    return response.data.data;
  },
};
