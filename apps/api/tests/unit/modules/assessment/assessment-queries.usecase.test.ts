import { AssessmentStatus, TaskType } from "@microintern/database";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { GetAssessmentDetailsUseCase } from "@/modules/assessment/application/use-cases/get-assessment-details.usecase.js";
import { ListPublicAssessmentsUseCase } from "@/modules/assessment/application/use-cases/list-public-assessments.usecase.js";
import { Assessment } from "@/modules/assessment/domain/entities/Assessment.entity.js";
import { AssessmentTask } from "@/modules/assessment/domain/entities/AssessmentTask.entity.js";
import { AssessmentNotPublishedError } from "@/modules/assessment/domain/errors/assessment.errors.js";

describe("Assessment Query & Directory Use Cases", () => {
  let mockAssessmentRepo: any;
  let mockCompanyRepo: any;

  const testTask = new AssessmentTask(
    "t-1",
    "assessment-20",
    1,
    "Algorithm challenge",
    "Solve two-sum problem",
    TaskType.CODE_SUBMISSION,
    true,
    100,
    {
      language: "python",
      answerKey: "def twoSum(): return [0,1]",
      privateRubric: "Check O(N) complexity",
    },
    new Date(),
    new Date(),
  );

  const testAssessment = (status: AssessmentStatus = AssessmentStatus.PUBLISHED) =>
    new Assessment(
      "assessment-20",
      "comp-1",
      "user-owner",
      status,
      "Python Data Structures Assessment",
      "python-data-structures",
      "Algorithm assessment.",
      "Complete in 60 mins.",
      ["Python"],
      "Software Engineer",
      null,
      null,
      null,
      null,
      60,
      70,
      1,
      true,
      status === AssessmentStatus.PUBLISHED ? new Date() : null,
      null,
      new Date(),
      new Date(),
      [testTask],
    );

  beforeEach(() => {
    mockAssessmentRepo = {
      findByIdOrSlug: vi.fn(),
      listPublicAssessments: vi.fn(),
    };
    mockCompanyRepo = {
      findByUserId: vi.fn(),
    };
  });

  describe("GetAssessmentDetailsUseCase", () => {
    it("should return masked candidate view when queried by an external candidate or public observer", async () => {
      const useCase = new GetAssessmentDetailsUseCase(mockAssessmentRepo, mockCompanyRepo);
      mockAssessmentRepo.findByIdOrSlug.mockResolvedValue(
        testAssessment(AssessmentStatus.PUBLISHED),
      );
      mockCompanyRepo.findByUserId.mockResolvedValue(null); // External candidate

      const res = await useCase.execute("python-data-structures", "candidate-user");
      expect((res as any).tasks[0].config.language).toBe("python");
      expect((res as any).tasks[0].config.answerKey).toBeUndefined();
    });

    it("should return unmasked evaluation answer key when queried by recruiter/owner of the owning company", async () => {
      const useCase = new GetAssessmentDetailsUseCase(mockAssessmentRepo, mockCompanyRepo);
      mockAssessmentRepo.findByIdOrSlug.mockResolvedValue(
        testAssessment(AssessmentStatus.PUBLISHED),
      );
      mockCompanyRepo.findByUserId.mockResolvedValue({ id: "comp-1" }); // Owning company member

      const res = await useCase.execute("python-data-structures", "recruiter-user");
      expect((res as any).tasks[0].config.answerKey).toBe("def twoSum(): return [0,1]");
    });

    it("should throw AssessmentNotPublishedError if an external user requests details for a DRAFT assessment", async () => {
      const useCase = new GetAssessmentDetailsUseCase(mockAssessmentRepo, mockCompanyRepo);
      mockAssessmentRepo.findByIdOrSlug.mockResolvedValue(testAssessment(AssessmentStatus.DRAFT));
      mockCompanyRepo.findByUserId.mockResolvedValue({ id: "other-comp-999" });

      await expect(useCase.execute("assessment-20", "stranger")).rejects.toThrow(
        AssessmentNotPublishedError,
      );
    });
  });

  describe("ListPublicAssessmentsUseCase", () => {
    it("should format public candidate views and build proper pagination metadata", async () => {
      const useCase = new ListPublicAssessmentsUseCase(mockAssessmentRepo);
      mockAssessmentRepo.listPublicAssessments.mockResolvedValue({
        assessments: [testAssessment(), testAssessment()],
        total: 14,
      });

      const res = await useCase.execute({ page: 2, limit: 10 });
      expect(res.assessments).toHaveLength(2);
      expect(res.assessments[0].tasks[0].config.answerKey).toBeUndefined();
      expect(res.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 14,
        totalPages: 2,
        hasNextPage: false,
        hasPreviousPage: true,
      });
    });
  });
});
