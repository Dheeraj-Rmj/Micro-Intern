import type {
  IEvidenceRepository,
  CreateEvidenceDTO,
  VerifyEvidenceDTO,
} from '../domain/IEvidenceRepository.js';
import type { Evidence, EvidenceType, EvidenceVerificationStatus } from '@microintern/database';
import { DomainEventDispatcher } from '@/core/events/DomainEventDispatcher.js';

export class EvidenceService {
  constructor(
    private readonly evidenceRepo: IEvidenceRepository,
    private readonly eventDispatcher = DomainEventDispatcher.getInstance()
  ) {}

  async registerEvidence(data: CreateEvidenceDTO, actorId: string): Promise<Evidence> {
    const evidence = await this.evidenceRepo.create(data);

    await this.eventDispatcher.dispatch({
      eventName: 'EvidenceRegistered',
      entityType: 'Evidence',
      entityId: evidence.id,
      metadata: {
        evidenceId: evidence.id,
        candidateId: evidence.candidateId,
        type: evidence.type,
        title: evidence.title,
      },
      actorId,
    });

    return evidence;
  }

  async verifyEvidence(data: VerifyEvidenceDTO, actorId: string): Promise<Evidence> {
    const existing = await this.evidenceRepo.findById(data.evidenceId);
    if (!existing) {
      throw new Error(`Evidence not found: ${data.evidenceId}`);
    }

    const updated = await this.evidenceRepo.updateVerificationStatus(data);

    await this.eventDispatcher.dispatch({
      eventName: 'EvidenceVerified',
      entityType: 'Evidence',
      entityId: updated.id,
      metadata: {
        evidenceId: updated.id,
        candidateId: updated.candidateId,
        oldStatus: existing.verificationStatus,
        newStatus: updated.verificationStatus,
        qualityScore: updated.qualityScore,
      },
      actorId,
    });

    return updated;
  }

  async getEvidence(id: string): Promise<Evidence> {
    const evidence = await this.evidenceRepo.findById(id);
    if (!evidence) {
      throw new Error(`Evidence not found: ${id}`);
    }
    return evidence;
  }

  async listCandidateEvidence(
    candidateId: string,
    options?: { type?: EvidenceType; status?: EvidenceVerificationStatus }
  ): Promise<Evidence[]> {
    return this.evidenceRepo.listByCandidate(candidateId, options);
  }

  async listSubmissionEvidence(submissionId: string): Promise<Evidence[]> {
    return this.evidenceRepo.listBySubmission(submissionId);
  }

  async linkSkill(evidenceId: string, skillId: string, confidence?: number, notes?: string) {
    return this.evidenceRepo.linkSkill(evidenceId, skillId, confidence, notes);
  }

  async linkCompetency(evidenceId: string, competencyId: string, confidence?: number, notes?: string) {
    return this.evidenceRepo.linkCompetency(evidenceId, competencyId, confidence, notes);
  }
}
