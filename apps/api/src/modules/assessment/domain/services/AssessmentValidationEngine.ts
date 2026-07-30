import { AssessmentStatus } from '@microintern/database';
import type { Assessment } from '../entities/Assessment.entity.js';
import type { AssessmentTask } from '../entities/AssessmentTask.entity.js';

export interface ValidationIssue {
  field: string;
  message: string;
  severity: 'ERROR' | 'WARNING';
}

export interface AssessmentValidationResult {
  isValid: boolean;
  canPublish: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
}

export class AssessmentValidationEngine {
  /**
   * Evaluates a Assessment aggregate against all 10 CTO-mandated pre-publishing dimensions.
   */
  static validate(assessment: {
    title?: string;
    description?: string;
    instructions?: string;
    skillsRequired?: string[];
    roleTitle?: string | null;
    durationMinutes?: number;
    passingScore?: number;
    maxAttempts?: number;
    isPublic?: boolean;
    tasks?: AssessmentTask[];
    deliverables?: any[];
    complexityScore?: number | null;
    aiDifficultyScore?: number | null;
  }): AssessmentValidationResult {
    const errors: ValidationIssue[] = [];
    const warnings: ValidationIssue[] = [];

    // 1. Title Validation
    if (!assessment.title || assessment.title.trim().length < 3) {
      errors.push({
        field: 'title',
        message: 'Assessment title must be at least 3 characters long.',
        severity: 'ERROR',
      });
    }

    // 2. Description Validation
    if (!assessment.description || assessment.description.trim().length < 10) {
      errors.push({
        field: 'description',
        message: 'Assessment description must be at least 10 characters long.',
        severity: 'ERROR',
      });
    }

    // 3. Instructions Validation
    if (!assessment.instructions || assessment.instructions.trim().length < 10) {
      errors.push({
        field: 'instructions',
        message: 'Assessment instructions must be at least 10 characters long.',
        severity: 'ERROR',
      });
    }

    // 4. Tasks & Rubric Validation
    if (!assessment.tasks || assessment.tasks.length === 0) {
      errors.push({
        field: 'tasks',
        message: 'Assessment must have at least one evaluation task configured.',
        severity: 'ERROR',
      });
    } else {
      let totalPoints = 0;
      assessment.tasks.forEach((task, idx) => {
        if (!task.title || task.title.trim().length === 0) {
          errors.push({
            field: `tasks[${idx}].title`,
            message: `Task #${idx + 1} is missing a title.`,
            severity: 'ERROR',
          });
        }
        if (task.maxPoints <= 0) {
          errors.push({
            field: `tasks[${idx}].maxPoints`,
            message: `Task #${idx + 1} must have a positive maxPoints value.`,
            severity: 'ERROR',
          });
        }
        totalPoints += task.maxPoints || 0;
      });

      if (totalPoints === 0) {
        errors.push({
          field: 'tasks.rubric',
          message: 'Total points across all tasks must be greater than zero.',
          severity: 'ERROR',
        });
      }
    }

    // 5. Passing Score Validation
    if (
      assessment.passingScore === undefined ||
      assessment.passingScore === null ||
      assessment.passingScore < 50 ||
      assessment.passingScore > 100
    ) {
      errors.push({
        field: 'passingScore',
        message: 'Passing score must be between 50 and 100.',
        severity: 'ERROR',
      });
    }

    // 6. Duration Validation
    if (
      assessment.durationMinutes === undefined ||
      assessment.durationMinutes === null ||
      assessment.durationMinutes < 15 ||
      assessment.durationMinutes > 600
    ) {
      errors.push({
        field: 'durationMinutes',
        message: 'Duration must be between 15 and 600 minutes.',
        severity: 'ERROR',
      });
    }

    // 7. Skills Required Validation
    if (!assessment.skillsRequired || assessment.skillsRequired.length === 0) {
      errors.push({
        field: 'skillsRequired',
        message: 'At least one skill tag must be specified.',
        severity: 'ERROR',
      });
    }

    // 8. Deliverables Warning
    if (!assessment.deliverables || assessment.deliverables.length === 0) {
      warnings.push({
        field: 'deliverables',
        message: 'No deliverables specified. Candidates will only submit standard task responses.',
        severity: 'WARNING',
      });
    }

    // 9. Visibility / Role Title Check
    if (assessment.isPublic && (!assessment.roleTitle || assessment.roleTitle.trim().length === 0)) {
      warnings.push({
        field: 'roleTitle',
        message: 'Public assessments should include a target Role Title for candidate discovery.',
        severity: 'WARNING',
      });
    }

    // 10. Complexity / Difficulty Bounds
    if (
      assessment.complexityScore !== undefined &&
      assessment.complexityScore !== null &&
      (assessment.complexityScore < 1 || assessment.complexityScore > 100)
    ) {
      errors.push({
        field: 'complexityScore',
        message: 'Complexity score must be between 1 and 100.',
        severity: 'ERROR',
      });
    }

    const canPublish = errors.length === 0;
    const isValid = errors.length === 0;

    return {
      isValid,
      canPublish,
      errors,
      warnings,
    };
  }

  /**
   * Validates and throws if the assessment is not ready for READY_FOR_REVIEW or PUBLISHED status.
   */
  static assertCanPublish(assessment: any): void {
    const result = this.validate(assessment);
    if (!result.canPublish) {
      const errorMsg = result.errors.map((e) => `${e.field}: ${e.message}`).join('; ');
      throw new Error(`Assessment validation failed for publishing: ${errorMsg}`);
    }
  }
}
