import { describe, it, expect } from "vitest";
import { AssessmentValidationEngine } from "@/modules/assessment/domain/services/AssessmentValidationEngine.js";

describe("AssessmentValidationEngine", () => {
  const validAssessment = {
    title: "Senior Backend TypeScript Assessment",
    description: "An enterprise evaluation assessment for senior backend engineers.",
    instructions: "Please complete all tasks using Node.js and TypeScript.",
    skillsRequired: ["TypeScript", "Node.js", "PostgreSQL"],
    roleTitle: "Senior Backend Engineer",
    durationMinutes: 120,
    passingScore: 70,
    maxAttempts: 1,
    isPublic: true,
    tasks: [
      {
        id: "task-1",
        title: "Implement Clean Architecture API",
        description: "Build a REST API endpoint.",
        maxPoints: 100,
      } as any,
    ],
    deliverables: [{ id: "deliv-1", title: "GitHub Repository" }],
    complexityScore: 75,
  };

  it("passes validation for a well-formed enterprise assessment", () => {
    const result = AssessmentValidationEngine.validate(validAssessment);
    expect(result.isValid).toBe(true);
    expect(result.canPublish).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });

  it("fails validation when title is too short or missing", () => {
    const result = AssessmentValidationEngine.validate({
      ...validAssessment,
      title: "Hi",
    });
    expect(result.isValid).toBe(false);
    expect(result.canPublish).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({ field: "title" }));
  });

  it("fails validation when no tasks are configured", () => {
    const result = AssessmentValidationEngine.validate({
      ...validAssessment,
      tasks: [],
    });
    expect(result.isValid).toBe(false);
    expect(result.canPublish).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({ field: "tasks" }));
  });

  it("fails validation when passingScore is outside 50-100 range", () => {
    const result = AssessmentValidationEngine.validate({
      ...validAssessment,
      passingScore: 40,
    });
    expect(result.isValid).toBe(false);
    expect(result.canPublish).toBe(false);
    expect(result.errors).toContainEqual(expect.objectContaining({ field: "passingScore" }));
  });

  it("generates a warning when no deliverables are configured", () => {
    const result = AssessmentValidationEngine.validate({
      ...validAssessment,
      deliverables: [],
    });
    expect(result.isValid).toBe(true);
    expect(result.canPublish).toBe(true);
    expect(result.warnings).toContainEqual(expect.objectContaining({ field: "deliverables" }));
  });

  it("assertCanPublish throws an error when assessment is invalid", () => {
    expect(() =>
      AssessmentValidationEngine.assertCanPublish({ ...validAssessment, title: "" }),
    ).toThrow(/Assessment validation failed for publishing/);
  });
});
