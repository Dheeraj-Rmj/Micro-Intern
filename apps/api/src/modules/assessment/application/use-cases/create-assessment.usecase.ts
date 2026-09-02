import { createModuleLogger } from "@/core/logger.js";
import { CompanyNotFoundError } from "@/modules/company/domain/errors/company.errors.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

import type { Assessment } from "../../domain/entities/Assessment.entity.js";
import type {
  IAssessmentRepository,
  CreateAssessmentData,
} from "../ports/IAssessmentRepository.js";
import type { ICompanyRepository } from "@/modules/company/domain/repositories/ICompanyRepository.js";
import type { ExperienceLevel } from "@microintern/database";

const log = createModuleLogger("CreateAssessmentUseCase");

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export class CreateAssessmentUseCase {
  constructor(
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly companyRepository: ICompanyRepository,
  ) {}

  async execute(
    userId: string,
    input: {
      title: string;
      description: string;
      instructions: string;
      skillsRequired?: string[];
      roleTitle?: string;
      level?: ExperienceLevel;
      location?: string;
      workSetting?: string;
      employmentType?: string;
      durationMinutes: number;
      maxAttempts?: number;
      isPublic?: boolean;
      isProctored?: boolean;
      difficulty?: string;
      passingScore?: number;
      tasks?: Array<{
        title: string;
        description: string;
        taskType: string;
        isRequired?: boolean;
        maxPoints?: number;
        sortOrder: number;
        config?: Record<string, unknown>;
      }>;
    },
  ): Promise<Assessment> {
    log.info({ userId, title: input.title }, "Creating new assessment assessment");

    const company = await this.companyRepository.findByUserId(userId);
    if (!company) {
      throw new CompanyNotFoundError();
    }

    let slug = slugify(input.title);
    const existing = await this.assessmentRepository.findBySlug(slug);
    if (existing && existing.companyId === company.id) {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      slug = `${slug}-${suffix}`;
    }

    const assessmentData: CreateAssessmentData = {
      companyId: company.id,
      createdById: userId,
      title: input.title.trim(),
      slug,
      description: input.description,
      instructions: input.instructions,
      skillsRequired: input.skillsRequired || [],
      roleTitle: input.roleTitle,
      level: input.level,
      location: input.location,
      workSetting: input.workSetting,
      employmentType: input.employmentType,
      durationMinutes: input.durationMinutes,
      passingScore: input.passingScore ?? 70,
      maxAttempts: input.maxAttempts ?? 1,
      isPublic: input.isPublic ?? false,
      isProctored: input.isProctored ?? false,
      difficulty: input.difficulty ?? "Medium",
      tasks: input.tasks,
    };

    const assessment = await this.assessmentRepository.create(assessmentData);
    log.info(
      { assessmentId: assessment.id, companyId: company.id },
      "Assessment created in DRAFT status",
    );

    await eventBus.emit(DOMAIN_EVENTS.ASSESSMENT_CREATED, {
      assessmentId: assessment.id,
      companyId: company.id,
      title: assessment.title,
      slug: assessment.slug,
      createdById: userId,
    });

    return assessment;
  }
}
