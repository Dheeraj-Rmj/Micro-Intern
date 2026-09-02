import { AssessmentStatus } from "@microintern/database";

import {
  AssessmentCannotPublishWithoutTasksError,
  AssessmentImmutableWhenPublishedError,
} from "../errors/assessment.errors.js";

import { AssessmentTask } from "./AssessmentTask.entity.js";

import type { ExperienceLevel } from "@microintern/database";

export class Assessment {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly createdById: string,
    public readonly status: AssessmentStatus,
    public readonly title: string,
    public readonly slug: string,
    public readonly description: string,
    public readonly instructions: string,
    public readonly skillsRequired: string[],
    public readonly roleTitle: string | null,
    public readonly level: ExperienceLevel | null,
    public readonly durationMinutes: number,
    public readonly passingScore: number,
    public readonly maxAttempts: number,
    public readonly isPublic: boolean,
    public readonly publishedAt: Date | null,
    public readonly expiresAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly tasks: AssessmentTask[] = [],
    public readonly company?: { id: string; name: string; slug: string; logoUrl?: string | null },
  ) {}

  isDraft(): boolean {
    return this.status === AssessmentStatus.DRAFT;
  }

  isPublished(): boolean {
    return this.status === AssessmentStatus.PUBLISHED;
  }

  isClosed(): boolean {
    return this.status === AssessmentStatus.CLOSED || this.status === AssessmentStatus.ARCHIVED;
  }

  /**
   * Evaluates if structural modifications (task additions/removals) are allowed.
   * Throws an explicit conflict error if already published.
   */
  validateCanBeModified(): void {
    if (!this.isDraft()) {
      throw new AssessmentImmutableWhenPublishedError();
    }
  }

  /**
   * Validates publishing readiness (must have at least 1 assessment task configured).
   */
  validateCanPublish(): void {
    if (!this.tasks || this.tasks.length === 0) {
      throw new AssessmentCannotPublishWithoutTasksError();
    }
  }

  /**
   * Returns a candidate-safe view with evaluation rubrics and answer keys stripped from tasks.
   */
  toPublicCandidateView() {
    return {
      id: this.id,
      companyId: this.companyId,
      company: this.company
        ? { name: this.company.name, slug: this.company.slug, logoUrl: this.company.logoUrl }
        : undefined,
      title: this.title,
      slug: this.slug,
      description: this.description,
      instructions: this.instructions,
      skillsRequired: this.skillsRequired,
      roleTitle: this.roleTitle,
      level: this.level,
      durationMinutes: this.durationMinutes,
      passingScore: this.passingScore,
      maxAttempts: this.maxAttempts,
      isPublic: this.isPublic,
      publishedAt: this.publishedAt,
      tasks: this.tasks.map((task) => task.toPublicView()),
    };
  }

  static fromPrisma(record: any): Assessment {
    const tasks = Array.isArray(record.tasks)
      ? record.tasks.map((t: any) => AssessmentTask.fromPrisma(t))
      : [];

    return new Assessment(
      record.id,
      record.companyId,
      record.createdById,
      record.status,
      record.title,
      record.slug,
      record.description,
      record.instructions,
      record.skillsRequired || [],
      record.roleTitle ?? null,
      record.level ?? null,
      record.durationMinutes,
      record.passingScore,
      record.maxAttempts,
      record.isPublic,
      record.publishedAt ?? null,
      record.expiresAt ?? null,
      record.createdAt,
      record.updatedAt,
      tasks,
      record.company
        ? {
            id: record.company.id,
            name: record.company.name,
            slug: record.company.slug,
            logoUrl: record.company.logoUrl,
          }
        : undefined,
    );
  }
}
