import { PipelineStageType } from '@microintern/shared';

export class PipelineStage {
  constructor(
    public readonly id: string,
    public readonly pipelineId: string,
    public readonly name: string,
    public readonly stageType: PipelineStageType,
    public readonly sortOrder: number,
    public readonly config: Record<string, unknown> = {}
  ) {}

  isTerminal(): boolean {
    return (
      this.stageType === PipelineStageType.OFFER ||
      this.stageType === PipelineStageType.REJECTED ||
      this.stageType === PipelineStageType.WITHDRAWN
    );
  }

  static fromPrisma(record: any): PipelineStage {
    return new PipelineStage(
      record.id,
      record.pipelineId,
      record.name,
      record.stageType as PipelineStageType,
      record.sortOrder,
      (record.config as Record<string, unknown>) || {}
    );
  }
}
