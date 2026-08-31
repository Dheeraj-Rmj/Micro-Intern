import { apiClient } from "./client";

export interface LearningRecommendationResult {
  candidateId: string;
  roleProfileId?: string;
  missingSkills: Array<{
    skillId: string;
    skillName: string;
    targetScore: number;
    currentScore: number;
  }>;
  recommendedResources: Array<{
    title: string;
    type: "TUTORIAL" | "DOCUMENTATION" | "COURSE" | "PRACTICE_PROJECT";
    url: string;
    skillName: string;
    description: string;
  }>;
  practiceProjects: Array<{
    title: string;
    description: string;
    targetSkills: string[];
    estimatedHours: number;
  }>;
  improvementRoadmap: Array<{
    stepNumber: number;
    title: string;
    description: string;
    focusSkill: string;
  }>;
}

export const learningApi = {
  /**
   * Fetches learning recommendations for a candidate based on their verifications
   * and optionally against a specific role profile.
   */
  getRecommendations: async (candidateId?: string, roleProfileId?: string): Promise<LearningRecommendationResult> => {
    const params = new URLSearchParams();
    if (candidateId) params.append("candidateId", candidateId);
    if (roleProfileId) params.append("roleProfileId", roleProfileId);
    
    const url = `/learning-recommendations${params.toString() ? `?${params.toString()}` : ""}`;
    const response = await apiClient.get<{ success: boolean; data: LearningRecommendationResult }>(url);
    
    return response.data.data;
  },
};
