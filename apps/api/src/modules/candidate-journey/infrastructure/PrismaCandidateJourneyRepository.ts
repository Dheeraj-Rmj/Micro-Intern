import { PrismaClient, CandidateJourneyStatus } from '@microintern/database';
import type { CandidateJourney, CandidateJourneyHistory } from '@microintern/database';
import type {
  ICandidateJourneyRepository,
  CreateCandidateJourneyDTO,
  AdvanceJourneyStatusDTO,
} from '../domain/ICandidateJourneyRepository.js';

export class PrismaCandidateJourneyRepository implements ICandidateJourneyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<CandidateJourney | null> {
    return this.prisma.candidateJourney.findUnique({
      where: { id },
      include: {
        roleProfile: true,
        history: { orderBy: { timestamp: 'desc' } },
      } as any,
    });
  }

  async findByCandidateAndCompany(candidateId: string, companyId: string): Promise<CandidateJourney | null> {
    return this.prisma.candidateJourney.findFirst({
      where: { candidateId, companyId },
      include: {
        roleProfile: true,
        history: { orderBy: { timestamp: 'desc' } },
      } as any,
    });
  }

  async listByCandidate(candidateId: string): Promise<CandidateJourney[]> {
    return this.prisma.candidateJourney.findMany({
      where: { candidateId },
      orderBy: { updatedAt: 'desc' },
      include: {
        roleProfile: true,
      } as any,
    });
  }

  async listByCompany(companyId: string, status?: CandidateJourneyStatus): Promise<CandidateJourney[]> {
    const where: any = { companyId };
    if (status) {
      where.status = status;
    }
    return this.prisma.candidateJourney.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        roleProfile: true,
      } as any,
    });
  }

  async create(data: CreateCandidateJourneyDTO): Promise<CandidateJourney> {
    const journey = await this.prisma.candidateJourney.create({
      data: {
        candidateId: data.candidateId,
        companyId: data.companyId,
        roleProfileId: data.roleProfileId,
        assessmentId: data.assessmentId,
        submissionId: data.submissionId,
        status: data.status ?? CandidateJourneyStatus.INVITED,
        notes: data.notes,
      },
    });

    await this.prisma.candidateJourneyHistory.create({
      data: {
        journeyId: journey.id,
        fromStatus: CandidateJourneyStatus.INVITED,
        toStatus: journey.status,
        reason: 'Journey initiated',
      },
    });

    return (await this.findById(journey.id))!;
  }

  async advanceStatus(data: AdvanceJourneyStatusDTO): Promise<CandidateJourney> {
    const existing = await this.prisma.candidateJourney.findUnique({
      where: { id: data.journeyId },
    });
    if (!existing) {
      throw new Error(`CandidateJourney not found: ${data.journeyId}`);
    }

    const updateData: any = {
      status: data.toStatus,
    };
    if (data.overallScore !== undefined) {
      updateData.overallScore = data.overallScore;
    }
    if (data.skillMatchPercentage !== undefined) {
      updateData.skillMatchPercentage = data.skillMatchPercentage;
    }

    const updated = await this.prisma.candidateJourney.update({
      where: { id: data.journeyId },
      data: updateData,
    });

    await this.prisma.candidateJourneyHistory.create({
      data: {
        journeyId: updated.id,
        fromStatus: existing.status,
        toStatus: data.toStatus,
        changedById: data.changedById,
        reason: data.reason,
      },
    });

    return (await this.findById(updated.id))!;
  }

  async getHistory(journeyId: string): Promise<CandidateJourneyHistory[]> {
    return this.prisma.candidateJourneyHistory.findMany({
      where: { journeyId },
      orderBy: { timestamp: 'desc' },
    });
  }
}
