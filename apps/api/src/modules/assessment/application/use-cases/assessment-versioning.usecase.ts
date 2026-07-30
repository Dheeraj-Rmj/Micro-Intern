import { createModuleLogger } from "@/core/logger.js";
import { AssessmentNotFoundError } from "../../domain/errors/assessment.errors.js";
import type { Assessment } from "../../domain/entities/Assessment.entity.js";
import type {
  IAssessmentRepository,
  AssessmentVersionSummary,
} from "../ports/IAssessmentRepository.js";

const log = createModuleLogger("AssessmentVersioningUseCase");

export class CreateAssessmentVersionUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(assessmentId: string, changeSummary: string, createdBy: string): Promise<void> {
    const assessment = await this.assessmentRepository.findById(assessmentId);
    if (!assessment) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    const versions = await this.assessmentRepository.listVersions(assessmentId);
    const nextVersion =
      versions.length > 0 ? Math.max(...versions.map((v) => v.versionNumber)) + 1 : 1;

    log.info({ assessmentId, nextVersion, changeSummary }, "Creating assessment version snapshot");
    await this.assessmentRepository.createVersion(
      assessmentId,
      nextVersion,
      assessment,
      changeSummary,
      createdBy,
    );
  }
}

export class ListAssessmentVersionsUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(assessmentId: string): Promise<AssessmentVersionSummary[]> {
    const assessment = await this.assessmentRepository.findById(assessmentId);
    if (!assessment) {
      throw new AssessmentNotFoundError(assessmentId);
    }
    return await this.assessmentRepository.listVersions(assessmentId);
  }
}

export class RestoreAssessmentVersionUseCase {
  constructor(private readonly assessmentRepository: IAssessmentRepository) {}

  async execute(
    assessmentId: string,
    versionNumber: number,
    restoredBy: string,
  ): Promise<Assessment> {
    const assessment = await this.assessmentRepository.findById(assessmentId);
    if (!assessment) {
      throw new AssessmentNotFoundError(assessmentId);
    }

    log.info({ assessmentId, versionNumber, restoredBy }, "Restoring assessment from version");
    const restored = await this.assessmentRepository.restoreVersion(assessmentId, versionNumber);

    // Snapshot restoration action
    await this.assessmentRepository.createVersion(
      assessmentId,
      Date.now() % 100000,
      restored,
      `Restored from version #${versionNumber}`,
      restoredBy,
    );

    return restored;
  }
}
