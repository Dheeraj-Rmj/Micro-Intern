import { createModuleLogger } from "@/core/logger.js";
import { buildPaginationMeta, toPrismaPage } from "@/shared/response/ResponseFormatter.js";

import type { IAssessmentRepository } from "../ports/IAssessmentRepository.js";
import type { ExperienceLevel } from "@microintern/database";
import type { PaginationMeta } from "@microintern/shared";

const log = createModuleLogger("ListPublicAssessmentsUseCase");

export class ListPublicAssessmentsUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(query: {
    skill?: string;
    level?: ExperienceLevel;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ assessments: Array<ReturnType<any>>; pagination: PaginationMeta }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;
    log.info({ page, limit, query }, "Listing open marketplace assessment assessments");

    const paginationInput = toPrismaPage(page, limit);
    const { assessments, total } = await this.assessmentRepository.listPublicAssessments({
      skill: query.skill,
      level: query.level,
      search: query.search,
      ...paginationInput,
    });

    const publicAssessments = assessments.map((t) => t.toPublicCandidateView());
    const pagination = buildPaginationMeta({ page, limit, total });

    return { assessments: publicAssessments, pagination };
  }
}
