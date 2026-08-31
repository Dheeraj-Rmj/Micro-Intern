import { apiClient } from "./client";

export interface EvaluationResult {
  id: string;
  submissionId: string;
  score: number;
  aiSummary?: string;
  performanceClassification?: string;
  details?: Record<string, any>;
  createdAt: string;
}

export interface Submission {
  id: string;
  candidateId: string;
  assessmentId: string;
  status: "DRAFT" | "SUBMITTED" | "EVALUATING" | "EVALUATED" | "FAILED";
  repoUrl?: string;
  artifacts?: Record<string, any>;
  startedAt?: string;
  submittedAt?: string;
  createdAt: string;
  evaluation?: EvaluationResult;
}

export const submissionsApi = {
  // --- Candidate Routes ---
  listMySubmissions: async () => {
    const res = await apiClient.get<{ success: boolean; data: Submission[] }>("/submissions");
    return res.data;
  },

  getSubmissionEvaluation: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: EvaluationResult }>(`/submissions/${id}/evaluation`);
    return res.data;
  },

  // --- Company Routes ---
  listCompanySubmissions: async (assessmentId?: string) => {
    const url = assessmentId ? `/submissions?assessmentId=${assessmentId}` : "/submissions";
    const res = await apiClient.get<{ success: boolean; data: Submission[] }>(url);
    return res.data;
  }
};
