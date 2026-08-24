import type {
  ISkillVerificationRepository,
  UpsertVerificationDTO,
} from "../domain/ISkillVerificationRepository.js";
import { SkillVerificationStatus } from "@microintern/database";
import type { SkillVerificationRecord } from "@microintern/database";
import { DomainEventDispatcher } from "@/core/events/DomainEventDispatcher.js";

export class SkillVerificationService {
  private static readonly STATE_HIERARCHY: Record<SkillVerificationStatus, number> = {
    CLAIMED: 1,
    OBSERVED: 2,
    DEMONSTRATED: 3,
    AI_VERIFIED: 4,
    HUMAN_VERIFIED: 5,
    CERTIFIED: 6,
  };

  constructor(
    private readonly verificationRepo: ISkillVerificationRepository,
    private readonly eventDispatcher = DomainEventDispatcher.getInstance(),
  ) {}

  async verifySkill(
    data: UpsertVerificationDTO,
    actorId: string,
  ): Promise<SkillVerificationRecord> {
    const existing = await this.verificationRepo.findByCandidateAndSkill(
      data.candidateId,
      data.skillId,
    );

    if (existing) {
      const currentRank = SkillVerificationService.STATE_HIERARCHY[existing.status];
      const targetRank = SkillVerificationService.STATE_HIERARCHY[data.status];

      // Prevent accidental demotion unless explicitly requested by admin/human verification
      if (targetRank < currentRank && !data.verificationNote?.includes("DEMOTION")) {
        throw new Error(
          `Cannot demote verification status from ${existing.status} to ${data.status} without explicit DEMOTION note.`,
        );
      }
    }

    const record = await this.verificationRepo.upsert(data);

    await this.eventDispatcher.dispatch({
      eventName: "SkillVerified",
      entityType: "SkillVerification",
      entityId: record.id,
      metadata: {
        candidateId: record.candidateId,
        skillId: record.skillId,
        oldStatus: existing?.status ?? null,
        newStatus: record.status,
        confidenceScore: record.confidenceScore,
      },
      actorId,
    });

    return record;
  }

  async getCandidateVerifiedSkills(
    candidateId: string,
    minStatus?: SkillVerificationStatus,
  ): Promise<SkillVerificationRecord[]> {
    const list = await this.verificationRepo.listByCandidate(candidateId);
    if (!minStatus) {
      return list;
    }
    const minRank = SkillVerificationService.STATE_HIERARCHY[minStatus];
    return list.filter((r) => SkillVerificationService.STATE_HIERARCHY[r.status] >= minRank);
  }

  async getSkillVerification(
    candidateId: string,
    skillId: string,
  ): Promise<SkillVerificationRecord | null> {
    return this.verificationRepo.findByCandidateAndSkill(candidateId, skillId);
  }
}
