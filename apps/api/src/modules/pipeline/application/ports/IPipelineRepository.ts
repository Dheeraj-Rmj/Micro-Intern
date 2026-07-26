import type { Pipeline, PipelineEntry, PipelineStage } from '../../domain/index.js';

export interface CreateEntryData {
  pipelineId: string;
  stageId: string;
  userId: string;
  movedBy?: string | null;
  notes?: string | null;
}

export interface UpdateEntryData {
  stageId: string;
  movedBy: string;
  notes?: string | null;
}

export interface IPipelineRepository {
  findByTrialId(trialId: string): Promise<Pipeline | null>;
  findById(id: string): Promise<Pipeline | null>;
  findEntryById(entryId: string): Promise<PipelineEntry | null>;
  findEntryByPipelineAndUser(pipelineId: string, userId: string): Promise<PipelineEntry | null>;
  findStageById(stageId: string): Promise<PipelineStage | null>;
  createDefaultPipeline(companyId: string, trialId: string, name: string, jobTitle: string): Promise<Pipeline>;
  createEntry(data: CreateEntryData): Promise<PipelineEntry>;
  updateEntry(entryId: string, data: UpdateEntryData): Promise<PipelineEntry>;
}
