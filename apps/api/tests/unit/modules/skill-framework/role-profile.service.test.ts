import { describe, it, expect, vi, beforeEach } from "vitest";
import { RoleProfileService } from "@/modules/skill-framework/application/RoleProfileService.js";

describe("RoleProfileService", () => {
  let service: RoleProfileService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      listByCompany: vi.fn(),
      create: vi.fn(),
      addRequiredSkill: vi.fn(),
      addRequiredCompetency: vi.fn(),
      getRequiredSkills: vi.fn(),
      getRequiredCompetencies: vi.fn(),
    };
    service = new RoleProfileService(mockRepo);
  });

  it("should evaluate candidate against required skills correctly", async () => {
    const requiredSkills = [
      { skillId: "sk-1", minimumScore: 70, weight: 1.0, isCritical: true },
      { skillId: "sk-2", minimumScore: 50, weight: 1.0, isCritical: false },
    ];
    mockRepo.findById.mockResolvedValue({ id: "role-123", minimumOverallScore: 60 });
    mockRepo.getRequiredSkills.mockResolvedValue(requiredSkills);
    mockRepo.getRequiredCompetencies.mockResolvedValue([]);

    const candidateScores = {
      "sk-1": 85,
      "sk-2": 60,
    };

    const evaluation = await service.evaluateCandidateAgainstProfile(
      "role-123",
      candidateScores,
      {},
    );
    expect(evaluation.passedMinimumThreshold).toBe(true);
    expect(evaluation.skillGaps).toHaveLength(0);
    expect(evaluation.overallMatchPercentage).toBeGreaterThanOrEqual(70);
  });

  it("should flag gaps when candidate score is below minimum", async () => {
    const requiredSkills = [{ skillId: "sk-1", minimumScore: 80, weight: 1.0, isCritical: true }];
    mockRepo.findById.mockResolvedValue({ id: "role-123", minimumOverallScore: 60 });
    mockRepo.getRequiredSkills.mockResolvedValue(requiredSkills);
    mockRepo.getRequiredCompetencies.mockResolvedValue([]);

    const evaluation = await service.evaluateCandidateAgainstProfile(
      "role-123",
      { "sk-1": 60 },
      {},
    );
    expect(evaluation.passedMinimumThreshold).toBe(false);
    expect(evaluation.skillGaps).toHaveLength(1);
    expect(evaluation.skillGaps[0].required).toBe(80);
    expect(evaluation.skillGaps[0].actual).toBe(60);
  });
});
