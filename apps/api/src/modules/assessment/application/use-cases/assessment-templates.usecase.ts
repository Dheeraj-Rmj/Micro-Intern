import { createModuleLogger } from "@/core/logger.js";
import { AssessmentNotFoundError } from "../../domain/errors/assessment.errors.js";
import type { IAssessmentRepository } from "../ports/IAssessmentRepository.js";

const log = createModuleLogger("AssessmentTemplatesUseCase");

export class SaveAsTemplateUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(
    assessmentId: string,
    title: string,
    description: string,
    category: string,
    companyId?: string,
  ): Promise<{ id: string }> {
    const assessment = await this.assessmentRepository.findById(assessmentId);
    if (!assessment) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    log.info(
      { assessmentId, title, category, companyId },
      "Saving assessment as reusable template",
    );
    return await this.assessmentRepository.saveAsTemplate({
      title,
      description,
      category,
      companyId,
      snapshot: assessment,
    });
  }
}

export class ListTemplatesUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(category?: string, companyId?: string): Promise<Array<any>> {
    return await this.assessmentRepository.listTemplates(category, companyId);
  }
}
