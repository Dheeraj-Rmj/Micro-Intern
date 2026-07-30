import type {
  ICandidateJourneyRepository,
  CreateCandidateJourneyDTO,
  AdvanceJourneyStatusDTO,
} from "../domain/ICandidateJourneyRepository.js";
import { CandidateJourneyStatus } from "@microintern/database";
import type { CandidateJourney } from "@microintern/database";
import { DomainEventDispatcher } from "@/core/events/DomainEventDispatcher.js";

export class CandidateJourneyService {
  private static readonly VALID_TRANSITIONS: Record<
    CandidateJourneyStatus,
    CandidateJourneyStatus[]
  > = {
    INVITED: [CandidateJourneyStatus.ACCEPTED],
    ACCEPTED: [CandidateJourneyStatus.ASSESSMENT_STARTED],
    ASSESSMENT_STARTED: [CandidateJourneyStatus.ASSESSMENT_SUBMITTED],
    ASSESSMENT_SUBMITTED: [
      CandidateJourneyStatus.AI_EVALUATED,
      CandidateJourneyStatus.HUMAN_REVIEW,
      CandidateJourneyStatus.REJECTED,
    ],
    AI_EVALUATED: [
      CandidateJourneyStatus.HUMAN_REVIEW,
      CandidateJourneyStatus.SKILL_VERIFIED,
      CandidateJourneyStatus.REJECTED,
    ],
    HUMAN_REVIEW: [CandidateJourneyStatus.SKILL_VERIFIED, CandidateJourneyStatus.REJECTED],
    SKILL_VERIFIED: [
      CandidateJourneyStatus.INTERVIEW,
      CandidateJourneyStatus.OFFER,
      CandidateJourneyStatus.REJECTED,
    ],
    INTERVIEW: [
      CandidateJourneyStatus.OFFER,
      CandidateJourneyStatus.SKILL_VERIFIED,
      CandidateJourneyStatus.REJECTED,
    ],
    OFFER: [CandidateJourneyStatus.HIRED, CandidateJourneyStatus.REJECTED],
    HIRED: [],
    REJECTED: [],
  };

  constructor(
    private readonly journeyRepo: ICandidateJourneyRepository,
    private readonly eventDispatcher = DomainEventDispatcher.getInstance(),
  ) {}

  async startJourney(data: CreateCandidateJourneyDTO, actorId: string): Promise<CandidateJourney> {
    const existing = await this.journeyRepo.findByCandidateAndCompany(
      data.candidateId,
      data.companyId,
    );
    if (existing) {
      return existing;
    }

    const journey = await this.journeyRepo.create(data);

    await this.eventDispatcher.dispatch({
      eventName: "CandidateJourneyStarted",
      entityType: "CandidateJourney",
      entityId: journey.id,
      metadata: {
        journeyId: journey.id,
        candidateId: journey.candidateId,
        companyId: journey.companyId,
        status: journey.status,
      },
      actorId,
    });

    return journey;
  }

  async advanceJourney(data: AdvanceJourneyStatusDTO, actorId: string): Promise<CandidateJourney> {
    const existing = await this.journeyRepo.findById(data.journeyId);
    if (!existing) {
      throw new Error(`Journey not found: ${data.journeyId}`);
    }

    const allowed = CandidateJourneyService.VALID_TRANSITIONS[existing.status] || [];
    if (!allowed.includes(data.toStatus) && !data.reason?.includes("FORCE_OVERRIDE")) {
      throw new Error(
        `Invalid status transition from ${existing.status} to ${data.toStatus}. Allowed transitions: ${allowed.join(", ")}`,
      );
    }

    const updated = await this.journeyRepo.advanceStatus(data);

    await this.eventDispatcher.dispatch({
      eventName: "CandidateJourneyStatusChanged",
      entityType: "CandidateJourney",
      entityId: updated.id,
      metadata: {
        journeyId: updated.id,
        candidateId: updated.candidateId,
        oldStatus: existing.status,
        newStatus: updated.status,
        overallScore: updated.overallScore,
      },
      actorId,
    });

    return updated;
  }

  async getJourney(id: string): Promise<CandidateJourney> {
    const journey = await this.journeyRepo.findById(id);
    if (!journey) {
      throw new Error(`Journey not found: ${id}`);
    }
    return journey;
  }

  async listCandidateJourneys(candidateId: string): Promise<CandidateJourney[]> {
    return this.journeyRepo.listByCandidate(candidateId);
  }

  async listCompanyJourneys(
    companyId: string,
    status?: CandidateJourneyStatus,
  ): Promise<CandidateJourney[]> {
    return this.journeyRepo.listByCompany(companyId, status);
  }
}
