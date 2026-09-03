import { AssessmentStatus, TaskType } from "@microintern/database";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { PublishAssessmentUseCase } from "@/modules/assessment/application/use-cases/publish-assessment.usecase.js";
import { Assessment } from "@/modules/assessment/domain/entities/Assessment.entity.js";
import { AssessmentTask } from "@/modules/assessment/domain/entities/AssessmentTask.entity.js";
import {
  AssessmentCannotPublishWithoutTasksError,
  AssessmentNotFoundError,
} from "@/modules/assessment/domain/errors/assessment.errors.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

describe("PublishAssessmentUseCase", () => {
  let useCase: PublishAssessmentUseCase;
  let mockAssessmentRepo: any;
  let mockCompanyRepo: any;

  const buildAssessment = (tasks: AssessmentTask[] = []) =>
    new Assessment(
      "assessment-10",
      "comp-1",
      "user-owner",
      AssessmentStatus.DRAFT,
      "Full-Stack Developer Assessment",
      "full-stack-developer-assessment",
      "Comprehensive assessment.",
      "Complete all tasks.",
      ["React", "Node.js"],
      "Full Stack Dev",
      null,
      null,
      null,
      null,
      120,
      70,
      1,
      true,
      null,
      null,
      new Date(),
      new Date(),
      tasks,
    );

  const sampleTask = new AssessmentTask(
    "t-1",
    "assessment-10",
    1,
    "Task 1",
    "Desc",
    TaskType.SHORT_ANSWER,
    true,
    100,
    {},
    new Date(),
    new Date(),
  );

  beforeEach(() => {
    mockAssessmentRepo = {
      findById: vi.fn(),
      publish: vi.fn().mockImplementation(async (id, publishedAt) => {
        const t = buildAssessment([sampleTask]);
        return new Assessment(
          t.id,
          t.companyId,
          t.createdById,
          AssessmentStatus.PUBLISHED,
          t.title,
          t.slug,
          t.description,
          t.instructions,
          t.skillsRequired,
          t.roleTitle,
          t.level,
          t.durationMinutes,
          t.passingScore,
          t.maxAttempts,
          t.isPublic,
          publishedAt,
          null,
          t.createdAt,
          new Date(),
          t.tasks,
        );
      }),
    };
    mockCompanyRepo = {
      findByUserId: vi.fn().mockResolvedValue({ id: "comp-1" }),
    };
    useCase = new PublishAssessmentUseCase(mockAssessmentRepo, mockCompanyRepo);
    vi.spyOn(eventBus, "emit").mockResolvedValue(undefined);
  });

  it("should reject publishing attempt with AssessmentCannotPublishWithoutTasksError when assessment has zero tasks", async () => {
    mockAssessmentRepo.findById.mockResolvedValue(buildAssessment([]));
    await expect(useCase.execute("user-owner", "assessment-10")).rejects.toThrow(
      AssessmentCannotPublishWithoutTasksError,
    );
    expect(mockAssessmentRepo.publish).not.toHaveBeenCalled();
  });

  it("should publish assessment and emit ASSESSMENT_PUBLISHED event when valid tasks exist", async () => {
    mockAssessmentRepo.findById.mockResolvedValue(buildAssessment([sampleTask]));
    const result = await useCase.execute("user-owner", "assessment-10");
    expect(result.status).toBe(AssessmentStatus.PUBLISHED);
    expect(result.publishedAt).toBeInstanceOf(Date);
    expect(mockAssessmentRepo.publish).toHaveBeenCalled();
    expect(eventBus.emit).toHaveBeenCalledWith(
      DOMAIN_EVENTS.ASSESSMENT_PUBLISHED,
      expect.objectContaining({ assessmentId: "assessment-10", companyId: "comp-1" }),
    );
  });
});
