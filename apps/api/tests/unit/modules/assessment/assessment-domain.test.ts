import { AssessmentStatus, TaskType } from "@microintern/database";
import { describe, it, expect } from "vitest";

import { Assessment } from "@/modules/assessment/domain/entities/Assessment.entity.js";
import { AssessmentTask } from "@/modules/assessment/domain/entities/AssessmentTask.entity.js";
import {
  AssessmentCannotPublishWithoutTasksError,
  AssessmentImmutableWhenPublishedError,
} from "@/modules/assessment/domain/errors/assessment.errors.js";

describe("Assessment & AssessmentTask Domain Entities", () => {
  const sampleTask = new AssessmentTask(
    "task-1",
    "assessment-1",
    1,
    "Build API endpoint",
    "Implement POST /test using express",
    TaskType.CODE_SUBMISSION,
    true,
    100,
    {
      language: "typescript",
      answerKey: "secret-solution-code",
      privateRubric: "Check async/await usage",
    },
    new Date(),
    new Date(),
  );

  const sampleAssessment = (status: AssessmentStatus, tasks: AssessmentTask[] = []) =>
    new Assessment(
      "assessment-1",
      "comp-1",
      "user-1",
      status,
      "Backend Systems Assessment",
      "backend-systems-assessment",
      "An intense Node.js backend evaluation.",
      "Complete all required endpoints.",
      ["TypeScript", "Node.js"],
      "Senior Backend Developer",
      null,
      null, // location
      null, // workSetting
      null, // employmentType
      90,
      75,
      2,
      true,
      status === AssessmentStatus.PUBLISHED ? new Date() : null,
      null,
      new Date(),
      new Date(),
      tasks,
    );

  it("should throw AssessmentCannotPublishWithoutTasksError when attempting to publish a Assessment with 0 tasks", () => {
    const draftWithoutTasks = sampleAssessment(AssessmentStatus.DRAFT, []);
    expect(() => draftWithoutTasks.validateCanPublish()).toThrow(
      AssessmentCannotPublishWithoutTasksError,
    );
  });

  it("should pass publish validation when at least one task exists", () => {
    const draftWithTasks = sampleAssessment(AssessmentStatus.DRAFT, [sampleTask]);
    expect(() => draftWithTasks.validateCanPublish()).not.toThrow();
  });

  it("should throw AssessmentImmutableWhenPublishedError if trying to modify structural assessment tasks on a published or closed Assessment", () => {
    const publishedAssessment = sampleAssessment(AssessmentStatus.PUBLISHED, [sampleTask]);
    expect(() => publishedAssessment.validateCanBeModified()).toThrow(
      AssessmentImmutableWhenPublishedError,
    );

    const closedAssessment = sampleAssessment(AssessmentStatus.CLOSED, [sampleTask]);
    expect(() => closedAssessment.validateCanBeModified()).toThrow(
      AssessmentImmutableWhenPublishedError,
    );
  });

  it("should securely mask answerKey, solution, and privateRubric when converting tasks to public candidate view", () => {
    const publishedAssessment = sampleAssessment(AssessmentStatus.PUBLISHED, [sampleTask]);
    const publicView = publishedAssessment.toPublicCandidateView();

    expect(publicView.tasks).toHaveLength(1);
    const taskConfig = publicView.tasks[0]!.config;
    expect(taskConfig["language"]).toBe("typescript");
    expect(taskConfig["answerKey"]).toBeUndefined();
    expect(taskConfig["privateRubric"]).toBeUndefined();
  });
});
