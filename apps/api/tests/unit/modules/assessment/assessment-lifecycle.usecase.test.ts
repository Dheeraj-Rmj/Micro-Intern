import { describe, it, expect, vi, beforeEach } from "vitest";
import { DuplicateAssessmentUseCase } from "@/modules/assessment/application/use-cases/duplicate-assessment.usecase.js";
import { ArchiveAssessmentUseCase } from "@/modules/assessment/application/use-cases/archive-assessment.usecase.js";
import { AssessmentStatus } from "@microintern/database";

describe("Assessment Lifecycle Use Cases", () => {
  let mockRepository: any;

  beforeEach(() => {
    mockRepository = {
      findById: vi.fn(),
      duplicate: vi.fn(),
      archive: vi.fn(),
      createVersion: vi.fn().mockResolvedValue(undefined),
    };
  });

  describe("DuplicateAssessmentUseCase", () => {
    it("duplicates an existing assessment and creates an initial version snapshot", async () => {
      const existingAssessment = {
        id: "assessment-1",
        title: "Senior Node.js Assessment",
        slug: "senior-nodejs",
        status: AssessmentStatus.PUBLISHED,
      };

      const duplicatedAssessment = {
        id: "assessment-copy-1",
        title: "Senior Node.js Assessment (Copy)",
        slug: "senior-nodejs-copy",
        status: AssessmentStatus.DRAFT,
      };

      mockRepository.findById.mockResolvedValue(existingAssessment);
      mockRepository.duplicate.mockResolvedValue(duplicatedAssessment);

      const useCase = new DuplicateAssessmentUseCase(mockRepository);
      const result = await useCase.execute("assessment-1", "recruiter-1");

      expect(mockRepository.findById).toHaveBeenCalledWith("assessment-1");
      expect(mockRepository.duplicate).toHaveBeenCalledWith(
        "assessment-1",
        expect.stringContaining("senior-nodejs-copy"),
        "recruiter-1",
      );
      expect(mockRepository.createVersion).toHaveBeenCalledWith(
        "assessment-copy-1",
        1,
        duplicatedAssessment,
        expect.stringContaining("Duplicated from assessment"),
        "recruiter-1",
      );
      expect(result).toEqual(duplicatedAssessment);
    });

    it("throws AssessmentNotFoundError when duplicating a non-existent assessment", async () => {
      mockRepository.findById.mockResolvedValue(null);
      const useCase = new DuplicateAssessmentUseCase(mockRepository);

      await expect(useCase.execute("unknown-id", "recruiter-1")).rejects.toThrow();
    });
  });

  describe("ArchiveAssessmentUseCase", () => {
    it("archives a assessment and records a version snapshot", async () => {
      const existingAssessment = {
        id: "assessment-1",
        title: "Senior Node.js Assessment",
        status: AssessmentStatus.PUBLISHED,
      };

      const archivedAssessment = {
        ...existingAssessment,
        status: AssessmentStatus.ARCHIVED,
      };

      mockRepository.findById.mockResolvedValue(existingAssessment);
      mockRepository.archive.mockResolvedValue(archivedAssessment);

      const useCase = new ArchiveAssessmentUseCase(mockRepository);
      const result = await useCase.execute("assessment-1", "recruiter-1");

      expect(mockRepository.archive).toHaveBeenCalledWith("assessment-1");
      expect(mockRepository.createVersion).toHaveBeenCalled();
      expect(result.status).toBe(AssessmentStatus.ARCHIVED);
    });
  });
});
