import { PipelineStageType } from '@microintern/shared';

import { PipelineStageNotFoundError } from '../errors/pipeline.errors.js';

import { PipelineEntry } from './PipelineEntry.entity.js';
import { PipelineStage } from './PipelineStage.entity.js';

export class Pipeline {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly trialId: string,
    public readonly name: string,
    public readonly jobTitle: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly stages: PipelineStage[] = [],
    public readonly entries: PipelineEntry[] = []
  ) {}

  getInitialStage(): PipelineStage {
    if (!this.stages || this.stages.length === 0) {
      throw new PipelineStageNotFoundError('No stages defined in pipeline.');
    }
    return [...this.stages].sort((a, b) => a.sortOrder - b.sortOrder)[0]!;
  }

  getRejectedStage(): PipelineStage | undefined {
    return this.stages.find((stage) => stage.stageType === PipelineStageType.REJECTED);
  }

  findStageById(stageId: string): PipelineStage {
    const stage = this.stages.find((s) => s.id === stageId);
    if (!stage) {
      throw new PipelineStageNotFoundError(stageId);
    }
    return stage;
  }

  static fromPrisma(record: any): Pipeline {
    const stages = (record.stages || []).map((s: any) => PipelineStage.fromPrisma(s));
    const entries = (record.candidates || record.entries || []).map((e: any) => PipelineEntry.fromPrisma(e));

    return new Pipeline(
      record.id,
      record.companyId,
      record.trialId,
      record.name,
      record.jobTitle,
      record.isActive ?? true,
      record.createdAt,
      record.updatedAt,
      stages,
      entries
    );
  }
}
