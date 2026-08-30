import { SubmitAssessmentUseCase } from "./apps/api/src/modules/submission/application/use-cases/submit-assessment.usecase.js";
import { SubmissionStatus } from "@microintern/database";

const mockSubmissionRepo = {
  findActiveByCandidateAndAssessment: async () => ({
    id: "sub-123",
    assessmentId: "assessment-123",
    candidateId: "cand-123",
    validateCanSubmit: () => true,
  }),
  saveAnswers: async () => {},
  updateStatus: async (id: string, status: any, updateData: any) => {
    return { id, status, ...updateData, assessmentId: "assessment-123", candidateId: "cand-123" };
  },
};

const mockProfileRepo = {
  execute: async () => ({ id: "cand-123" }),
};

const mockStorageService = {
  upload: async () => ({ key: "fake-url" }),
};

const useCase = new SubmitAssessmentUseCase(
  mockSubmissionRepo as any,
  mockProfileRepo as any,
  mockStorageService as any
);

async function run() {
  const proctoringEvents = [
    "TAB_SWITCH_OR_MINIMIZED at 2026-08-30T00:00:00Z",
    "COPY_ATTEMPT at 2026-08-30T00:01:00Z",
    "EXITED_FULLSCREEN at 2026-08-30T00:02:00Z"
  ];
  
  const result = await useCase.execute("user-123", "assessment-123", [], proctoringEvents);
  
  console.log("Result:", JSON.stringify(result, null, 2));
  
  if (result.integrityScore === 70 && result.isSuspicious === true) {
    console.log("SUCCESS: Logic works correctly for 3 violations.");
  } else {
    console.log("FAILED");
  }
}

run().catch(console.error);
