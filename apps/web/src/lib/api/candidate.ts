import { apiClient } from "./client";

import type {
  CandidateProfile,
  CandidateSkill,
  CandidateEducation,
  CandidateExperience,
  CandidateCertificate,
  CandidateSocial,
  CandidatePreference,
  CandidateAIAnalysis,
} from "@microintern/database";
import type { UpdateCandidateGraphDto } from "@microintern/shared";

// Extend the Prisma type with included relations for the frontend
export type CandidateProfileWithRelations = CandidateProfile & {
  skills: CandidateSkill[];
  educations: CandidateEducation[];
  experiences: CandidateExperience[];
  certificates: CandidateCertificate[];
  socials: CandidateSocial[];
  preferences: CandidatePreference | null;
  aiAnalyses: CandidateAIAnalysis[];
};

export const candidateApi = {
  getProfile: async (): Promise<CandidateProfileWithRelations> => {
    const { data } = await apiClient.get<{ data: CandidateProfileWithRelations }>("/candidates/me");
    return data.data;
  },

  updateProfile: async (
    payload: UpdateCandidateGraphDto,
  ): Promise<CandidateProfileWithRelations> => {
    const { data } = await apiClient.put<{ data: CandidateProfileWithRelations }>(
      "/candidates/me",
      payload,
    );
    return data.data;
  },

  uploadAvatar: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("avatar", file);

    const { data } = await apiClient.post<{ data: { url: string } }>(
      "/candidates/me/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data.data;
  },

  uploadResume: async (file: File): Promise<{ status: string; message: string }> => {
    const formData = new FormData();
    formData.append("resume", file);

    const { data } = await apiClient.post<{ data: { status: string; message: string } }>(
      "/candidates/me/resume",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return data.data;
  },

  getResumeUrl: async (): Promise<{ url: string; expiresAt: Date }> => {
    const { data } = await apiClient.get<{ data: { url: string; expiresAt: Date } }>(
      "/candidates/me/resume",
    );
    return data.data;
  },
};
