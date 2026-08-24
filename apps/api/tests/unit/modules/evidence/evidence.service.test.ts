import { describe, it, expect, vi, beforeEach } from "vitest";
import { EvidenceService } from "@/modules/evidence/application/EvidenceService.js";
import { EvidenceType, EvidenceVerificationStatus } from "@microintern/database";

describe("EvidenceService", () => {
  let service: EvidenceService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      listByCandidate: vi.fn(),
      listBySubmission: vi.fn(),
      create: vi.fn(),
      updateVerificationStatus: vi.fn(),
    };
    service = new EvidenceService(mockRepo);
  });

  it("should register evidence and emit EvidenceRegistered event", async () => {
    const createDTO = {
      candidateId: "cand-1",
      title: "Real-World Clean Arch Repo",
      type: EvidenceType.GITHUB_REPO,
      url: "https://github.com/microintern/clean-arch-example",
    };
    mockRepo.create.mockResolvedValue({
      id: "ev-1",
      ...createDTO,
      verificationStatus: "UNVERIFIED",
    });

    const created = await service.registerEvidence(createDTO, "cand-1");
    expect(created.id).toBe("ev-1");
    expect(mockRepo.create).toHaveBeenCalledWith(createDTO);
  });

  it("should update verification status on verifyEvidence", async () => {
    const existing = {
      id: "ev-1",
      candidateId: "cand-1",
      verificationStatus: "UNVERIFIED",
    };
    mockRepo.findById.mockResolvedValue(existing);
    mockRepo.updateVerificationStatus.mockResolvedValue({
      ...existing,
      verificationStatus: EvidenceVerificationStatus.VERIFIED,
      qualityScore: 92,
    });

    const updated = await service.verifyEvidence(
      { evidenceId: "ev-1", status: EvidenceVerificationStatus.VERIFIED, qualityScore: 92 },
      "admin-1",
    );
    expect(updated.verificationStatus).toBe(EvidenceVerificationStatus.VERIFIED);
    expect(updated.qualityScore).toBe(92);
  });
});
