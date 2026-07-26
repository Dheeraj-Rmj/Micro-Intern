import { PipelineStageType as DbPipelineStageType } from '@microintern/database';

import { Pipeline, PipelineStage, PipelineEntry } from '../../domain/index.js';

import type { IPipelineRepository, CreateEntryData, UpdateEntryData } from '../../application/ports/IPipelineRepository.js';
import type { PrismaClient } from '@microintern/database';

export class PrismaPipelineRepository implements IPipelineRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByTrialId(trialId: string): Promise<Pipeline | null> {
    const record = await this.db.pipeline.findUnique({
      where: { trialId },
      include: {
        stages: {
          orderBy: { sortOrder: 'asc' },
        },
        candidates: {
          include: {
            stage: true,
          },
        },
      },
    });

    return record ? Pipeline.fromPrisma(record) : null;
  }

  async findById(id: string): Promise<Pipeline | null> {
    const record = await this.db.pipeline.findUnique({
      where: { id },
      include: {
        stages: {
          orderBy: { sortOrder: 'asc' },
        },
        candidates: {
          include: {
            stage: true,
          },
        },
      },
    });

    return record ? Pipeline.fromPrisma(record) : null;
  }

  async findEntryById(entryId: string): Promise<PipelineEntry | null> {
    const record = await this.db.pipelineCandidate.findUnique({
      where: { id: entryId },
      include: {
        stage: true,
      },
    });

    return record ? PipelineEntry.fromPrisma(record) : null;
  }

  async findEntryByPipelineAndUser(pipelineId: string, userId: string): Promise<PipelineEntry | null> {
    const record = await this.db.pipelineCandidate.findFirst({
      where: { pipelineId, userId },
      include: {
        stage: true,
      },
    });

    return record ? PipelineEntry.fromPrisma(record) : null;
  }

  async findStageById(stageId: string): Promise<PipelineStage | null> {
    const record = await this.db.pipelineStage.findUnique({
      where: { id: stageId },
    });

    return record ? PipelineStage.fromPrisma(record) : null;
  }

  async createDefaultPipeline(companyId: string, trialId: string, name: string, jobTitle: string): Promise<Pipeline> {
    const record = await this.db.pipeline.create({
      data: {
        companyId,
        trialId,
        name,
        jobTitle,
        isActive: true,
        stages: {
          create: [
            { name: 'Screening & Application', stageType: DbPipelineStageType.SCREENING, sortOrder: 10 },
            { name: 'Skill Trial Review', stageType: DbPipelineStageType.SKILL_TRIAL, sortOrder: 20 },
            { name: 'Technical Interview', stageType: DbPipelineStageType.TECHNICAL_INTERVIEW, sortOrder: 30 },
            { name: 'Offer Extended', stageType: DbPipelineStageType.OFFER, sortOrder: 40 },
            { name: 'Rejected', stageType: DbPipelineStageType.REJECTED, sortOrder: 99 },
          ],
        },
      },
      include: {
        stages: {
          orderBy: { sortOrder: 'asc' },
        },
        candidates: {
          include: {
            stage: true,
          },
        },
      },
    });

    return Pipeline.fromPrisma(record);
  }

  async createEntry(data: CreateEntryData): Promise<PipelineEntry> {
    const record = await this.db.pipelineCandidate.create({
      data: {
        pipelineId: data.pipelineId,
        stageId: data.stageId,
        userId: data.userId,
        ...(data.movedBy !== undefined && { movedBy: data.movedBy }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        stage: true,
      },
    });

    return PipelineEntry.fromPrisma(record);
  }

  async updateEntry(entryId: string, data: UpdateEntryData): Promise<PipelineEntry> {
    const record = await this.db.pipelineCandidate.update({
      where: { id: entryId },
      data: {
        stageId: data.stageId,
        movedBy: data.movedBy,
        movedAt: new Date(),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
      include: {
        stage: true,
      },
    });

    return PipelineEntry.fromPrisma(record);
  }
}
