import type {
  Evidence,
  EvidenceSkillMapping,
  EvidenceCompetencyMapping,
  EvidenceType,
  EvidenceVerificationStatus,
} from "@microintern/database";

export interface CreateEvidenceDTO {
  candidateId: string;
  submissionId?: string;
  title: string;
  type: EvidenceType;
  url: string;
  description?: string;
  confidenceScore?: number;
  qualityScore?: number;
  metadata?: Record<string, unknown>;
  skillIds?: Array<{ skillId: string; confidence?: number; notes?: string }>;
  competencyIds?: Array<{ competencyId: string; confidence?: number; notes?: string }>;
}

export interface VerifyEvidenceDTO {
  evidenceId: string;
  status: EvidenceVerificationStatus;
  reviewNotes?: string;
  qualityScore?: number;
}

export interface IEvidenceRepository {
  findById(id: string): Promise<Evidence | null>;
  listByCandidate(
    candidateId: string,
    options?: { type?: EvidenceType; status?: EvidenceVerificationStatus },
  ): Promise<Evidence[]>;
  listBySubmission(submissionId: string): Promise<Evidence[]>;
  create(data: CreateEvidenceDTO): Promise<Evidence>;
  updateVerificationStatus(data: VerifyEvidenceDTO): Promise<Evidence>;
  delete(id: string): Promise<void>;

  // Mappings
  linkSkill(
    evidenceId: string,
    skillId: string,
    confidence?: number,
    notes?: string,
  ): Promise<EvidenceSkillMapping>;
  linkCompetency(
    evidenceId: string,
    competencyId: string,
    confidence?: number,
    notes?: string,
  ): Promise<EvidenceCompetencyMapping>;
}
