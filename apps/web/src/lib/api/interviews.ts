import { apiClient } from "./client";

export interface InterviewQuestion {
  id: string;
  interviewId: string;
  text: string;
  category?: string;
  difficulty?: string;
  maxPoints: number;
  rubric?: string;
  sortOrder: number;
}

export interface Interview {
  id: string;
  companyId: string;
  roleProfileId?: string;
  title: string;
  description?: string;
  status: "DRAFT" | "PUBLISHED" | "CLOSED";
  timeLimitMins?: number;
  passingScore: number;
  questions?: InterviewQuestion[];
  _count?: {
    sessions: number;
  };
}

export interface InterviewAnswer {
  id: string;
  sessionId: string;
  questionId: string;
  answerText: string;
  score?: number;
  aiFeedback?: string;
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  interviewId: string;
  candidateId: string;
  journeyId?: string;
  status: "INVITED" | "STARTED" | "SUBMITTED" | "EVALUATED";
  expiresAt?: string;
  startedAt?: string;
  submittedAt?: string;
  interview: Interview;
  answers?: InterviewAnswer[];
}

export const interviewsApi = {
  // --- Company / Recruiter Routes ---
  createInterview: async (data: {
    companyId: string;
    roleProfileId?: string;
    title: string;
    description?: string;
    timeLimitMins?: number;
    passingScore?: number;
    questions: Array<{
      text: string;
      category?: string;
      difficulty?: string;
      maxPoints?: number;
      rubric?: string;
    }>;
  }) => {
    const res = await apiClient.post<{ success: boolean; data: Interview }>("/interviews", data);
    return res.data;
  },

  listInterviews: async () => {
    const res = await apiClient.get<{ success: boolean; data: Interview[] }>("/interviews");
    return res.data;
  },

  getInterview: async (id: string) => {
    const res = await apiClient.get<{ success: boolean; data: Interview }>(`/interviews/${id}`);
    return res.data;
  },

  publishInterview: async (id: string) => {
    const res = await apiClient.put<{ success: boolean; data: Interview }>(`/interviews/${id}/publish`, {});
    return res.data;
  },

  inviteCandidate: async (id: string, candidateId: string, journeyId?: string) => {
    const res = await apiClient.post<{ success: boolean; data: InterviewSession }>(`/interviews/${id}/invite`, { candidateId, journeyId });
    return res.data;
  },

  // --- Candidate Routes ---
  getMySessions: async () => {
    const res = await apiClient.get<{ success: boolean; data: InterviewSession[] }>("/interviews/sessions/mine");
    return res.data;
  },

  getSession: async (sessionId: string) => {
    const res = await apiClient.get<{ success: boolean; data: InterviewSession }>(`/interviews/sessions/${sessionId}`);
    return res.data;
  },

  startSession: async (sessionId: string) => {
    const res = await apiClient.put<{ success: boolean; data: InterviewSession }>(`/interviews/sessions/${sessionId}/start`, {});
    return res.data;
  },

  submitAnswer: async (sessionId: string, questionId: string, answerText: string) => {
    const res = await apiClient.post<{ success: boolean; data: InterviewAnswer }>(`/interviews/sessions/${sessionId}/answers`, { questionId, answerText });
    return res.data;
  },

  submitSession: async (sessionId: string) => {
    const res = await apiClient.put<{ success: boolean; data: InterviewSession }>(`/interviews/sessions/${sessionId}/submit`, {});
    return res.data;
  },

  getSessionReport: async (sessionId: string) => {
    const res = await apiClient.get<{ success: boolean; data: any }>(`/interviews/sessions/${sessionId}/report`);
    return res.data;
  }
};
