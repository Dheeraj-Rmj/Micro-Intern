import { AssessmentStatus } from "@microintern/database";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { CompanyNotFoundError } from "@/modules/company/domain/errors/company.errors.js";
import { CreateAssessmentUseCase } from "@/modules/assessment/application/use-cases/create-assessment.usecase.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

describe("CreateAssessmentUseCase", () => {
  let useCase: CreateAssessmentUseCase;
  let mockAssessmentRepo: any;
  let mockCompanyRepo: any;

  beforeEach(() => {
    mockAssessmentRepo = {
      findBySlug: vi.fn(),
      create: vi.fn().mockImplementation(async (data) => ({
        id: "assessment-new",
        ...data,
        status: AssessmentStatus.DRAFT,
        createdAt: new Date(),
        updatedAt: new Date(),
      })),
    };

    mockCompanyRepo = {
      findByUserId: vi.fn(),
    };

    useCase = new CreateAssessmentUseCase(mockAssessmentRepo, mockCompanyRepo);
    vi.spyOn(eventBus, "emit").mockResolvedValue(undefined);
  });

  it("should throw CompanyNotFoundError if requesting user is not linked to any company", async () => {
    mockCompanyRepo.findByUserId.mockResolvedValue(null);

    await expect(
      useCase.execute("user-unlinked", {
        title: "New Assessment",
        description: "Testing description",
        instructions: "Test instructions",
        durationMinutes: 60,
      }),
    ).rejects.toThrow(CompanyNotFoundError);
  });

  it("should format URL slug cleanly, create DRAFT assessment, and emit ASSESSMENT_CREATED event", async () => {
    mockCompanyRepo.findByUserId.mockResolvedValue({ id: "comp-1", name: "MicroIntern AI" });
    mockAssessmentRepo.findBySlug.mockResolvedValue(null);

    const result = await useCase.execute("user-owner", {
      title: "  Senior Backend Architecture Evaluation  ",
      description: "System design and Node.js testing.",
      instructions: "Complete within 90 minutes.",
      durationMinutes: 90,
      passingScore: 80,
    });

    expect(result.id).toBe("assessment-new");
    expect(result.slug).toBe("senior-backend-architecture-evaluation");
    expect(result.status).toBe(AssessmentStatus.DRAFT);
    expect(mockAssessmentRepo.create).toHaveBeenCalled();
    expect(eventBus.emit).toHaveBeenCalledWith(DOMAIN_EVENTS.ASSESSMENT_CREATED, {
      assessmentId: "assessment-new",
      companyId: "comp-1",
      title: "Senior Backend Architecture Evaluation",
      slug: "senior-backend-architecture-evaluation",
      createdById: "user-owner",
    });
  });
});
