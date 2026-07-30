import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillMatchingService } from "@/modules/matching/application/SkillMatchingService.js";
import { SkillVerificationStatus } from "@microintern/database";

describe("SkillMatchingService", () => {
  let service: SkillMatchingService;
  let mockRoleRepo: any;
  let mockVerRepo: any;
  let mockEvRepo: any;

  beforeEach(() => {
    mockRoleRepo = {
      findById: vi.fn(),
      getRequiredSkills: vi.fn(),
      getRequiredCompetencies: vi.fn(),
    };
    mockVerRepo = {
      listByCandidate: vi.fn(),
    };
    mockEvRepo = {
      listByCandidate: vi.fn(),
    };
    service = new SkillMatchingService(mockRoleRepo, mockVerRepo, mockEvRepo);
  });

  it("should compute overallMatchScore and recommend STRONG_MATCH when certified skills have evidence", async () => {
    mockRoleRepo.findById.mockResolvedValue({ id: "role-1", title: "Senior Engineer" });
    mockRoleRepo.getRequiredSkills.mockResolvedValue([
      {
        skillId: "sk-1",
        minimumScore: 80,
        weight: 1.0,
        isCritical: true,
        skill: { name: "TypeScript" },
      },
    ]);
    mockRoleRepo.getRequiredCompetencies.mockResolvedValue([]);
    mockVerRepo.listByCandidate.mockResolvedValue([
      { skillId: "sk-1", status: SkillVerificationStatus.CERTIFIED, confidenceScore: 95 },
    ]);
    mockEvRepo.listByCandidate.mockResolvedValue([
      { id: "ev-1", linkedSkills: [{ skillId: "sk-1" }] },
    ]);

    const res = await service.matchCandidateToRole("role-1", "cand-1");
    expect(res.overallMatchScore).toBeGreaterThanOrEqual(85);
    expect(res.recommendation).toBe("STRONG_MATCH");
    expect(res.skillGaps).toHaveLength(0);
  });

  it("should identify critical skill gaps and recommend MISMATCH or DEVELOPMENT_NEEDED", async () => {
    mockRoleRepo.findById.mockResolvedValue({ id: "role-1", title: "Senior Engineer" });
    mockRoleRepo.getRequiredSkills.mockResolvedValue([
      {
        skillId: "sk-1",
        minimumScore: 80,
        weight: 1.0,
        isCritical: true,
        skill: { name: "TypeScript" },
      },
    ]);
    mockRoleRepo.getRequiredCompetencies.mockResolvedValue([]);
    mockVerRepo.listByCandidate.mockResolvedValue([
      { skillId: "sk-1", status: SkillVerificationStatus.CLAIMED, confidenceScore: 30 },
    ]);
    mockEvRepo.listByCandidate.mockResolvedValue([]);

    const res = await service.matchCandidateToRole("role-1", "cand-1");
    expect(res.skillGaps).toHaveLength(1);
    expect(res.skillGaps[0].isCritical).toBe(true);
    expect(res.recommendation).not.toBe("STRONG_MATCH");
  });
});
