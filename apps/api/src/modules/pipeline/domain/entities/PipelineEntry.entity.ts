import { PipelineInvalidTransitionError } from '../errors/pipeline.errors.js';

import { PipelineStage } from './PipelineStage.entity.js';

export class PipelineEntry {
  constructor(
    public readonly id: string,
    public readonly pipelineId: string,
    public readonly stageId: string,
    public readonly userId: string,
    public readonly movedAt: Date,
    public readonly movedBy: string | null,
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly stage?: PipelineStage,
    public readonly candidateDetails?: Record<string, unknown>
  ) {}

  validateCanMoveTo(targetStage: PipelineStage): void {
    if (targetStage.pipelineId !== this.pipelineId) {
      throw new PipelineInvalidTransitionError('Target stage belongs to a different pipeline.');
    }
    if (this.stageId === targetStage.id) {
      throw new PipelineInvalidTransitionError('Candidate is already in the designated stage.');
    }
  }

  static fromPrisma(record: any): PipelineEntry {
    return new PipelineEntry(
      record.id,
      record.pipelineId,
      record.stageId,
      record.userId,
      record.movedAt,
      record.movedBy,
      record.notes,
      record.createdAt,
      record.updatedAt,
      record.stage ? PipelineStage.fromPrisma(record.stage) : undefined,
      record.candidateDetails
    );
  }
}
