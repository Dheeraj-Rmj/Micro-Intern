import type { TaskType } from '@microintern/database';

export class AssessmentTask {
  constructor(
    public readonly id: string,
    public readonly assessmentId: string,
    public readonly sortOrder: number,
    public readonly title: string,
    public readonly description: string,
    public readonly taskType: TaskType,
    public readonly isRequired: boolean,
    public readonly maxPoints: number,
    public readonly config: Record<string, unknown>,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  /**
   * Returns a clean copy of the task with evaluation secrets or answers masked for public candidate view.
   */
  toPublicView(): Omit<AssessmentTask, 'config'> & { config: Record<string, unknown> } {
    const safeConfig = { ...this.config };
    delete safeConfig['answerKey'];
    delete safeConfig['solution'];
    delete safeConfig['correctAnswer'];
    delete safeConfig['privateRubric'];

    return {
      id: this.id,
      assessmentId: this.assessmentId,
      sortOrder: this.sortOrder,
      title: this.title,
      description: this.description,
      taskType: this.taskType,
      isRequired: this.isRequired,
      maxPoints: this.maxPoints,
      config: safeConfig,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      toPublicView: this.toPublicView,
    };
  }

  static fromPrisma(record: any): AssessmentTask {
    const configObj = typeof record.config === 'string' ? JSON.parse(record.config) : (record.config || {});
    return new AssessmentTask(
      record.id,
      record.assessmentId,
      record.sortOrder,
      record.title,
      record.description,
      record.taskType,
      record.isRequired ?? true,
      record.maxPoints ?? 100,
      configObj,
      record.createdAt,
      record.updatedAt
    );
  }
}
