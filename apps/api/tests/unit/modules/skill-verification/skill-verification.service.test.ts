import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillVerificationService } from "@/modules/skill-verification/application/SkillVerificationService.js";
import { SkillVerificationStatus } from "@microintern/database";

describe("SkillVerificationService", () => {
  let service: SkillVerificationService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByCandidateAndSkill: vi.fn(),
      listByCandidate: vi.fn(),
      upsert: vi.fn(),
    };
    service = new SkillVerificationService(mockRepo);
  });

  it("should promote skill status from CLAIMED to CERTIFIED smoothly", async () => {
    mockRepo.findByCandidateAndSkill.mockResolvedValue({
      candidateId: "cand-1",
      skillId: "sk-1",
      status: SkillVerificationStatus.CLAIMED,
    });
    mockRepo.upsert.mockResolvedValue({
      candidateId: "cand-1",
      skillId: "sk-1",
      status: SkillVerificationStatus.CERTIFIED,
      confidenceScore: 98,
    });

    const record = await service.verifySkill(
      {
        candidateId: "cand-1",
        skillId: "sk-1",
        status: SkillVerificationStatus.CERTIFIED,
        confidenceScore: 98,
      },
      "admin-1",
    );
    expect(record.status).toBe(SkillVerificationStatus.CERTIFIED);
  });

  it("should prevent accidental demotion unless explicit DEMOTION note is provided", async () => {
    mockRepo.findByCandidateAndSkill.mockResolvedValue({
      candidateId: "cand-1",
      skillId: "sk-1",
      status: SkillVerificationStatus.CERTIFIED,
    });

    await expect(
      service.verifySkill(
        {
          candidateId: "cand-1",
          skillId: "sk-1",
          status: SkillVerificationStatus.CLAIMED,
        },
        "admin-1",
      ),
    ).rejects.toThrow(
      "Cannot demote verification status from CERTIFIED to CLAIMED without explicit DEMOTION note.",
    );
  });
});
