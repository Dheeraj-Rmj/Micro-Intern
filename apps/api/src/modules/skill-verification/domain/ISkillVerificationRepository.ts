import type { SkillVerificationRecord, SkillVerificationStatus } from "@microintern/database";

export interface UpsertVerificationDTO {
  candidateId: string;
  skillId: string;
  status: SkillVerificationStatus;
  confidenceScore?: number;
  verifiedById?: string;
  verificationNote?: string;
}

export interface ISkillVerificationRepository {
  findByCandidateAndSkill(
    candidateId: string,
    skillId: string,
  ): Promise<SkillVerificationRecord | null>;
  listByCandidate(
    candidateId: string,
    status?: SkillVerificationStatus,
  ): Promise<SkillVerificationRecord[]>;
  upsert(data: UpsertVerificationDTO): Promise<SkillVerificationRecord>;
  delete(candidateId: string, skillId: string): Promise<void>;
}
