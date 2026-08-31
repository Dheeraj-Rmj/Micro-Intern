import { ResponseFormatter } from "@/shared/response/ResponseFormatter.js";
import { QUEUE_NAMES } from "@microintern/shared";
import { queues } from "@/infrastructure/queue/queues.js";
import { AssessmentValidationEngine } from "../domain/services/AssessmentValidationEngine.js";
import { competencyService } from "@/modules/competency/application/CompetencyService.js";
import { learningOutcomeService } from "../application/services/LearningOutcomeService.js";
import { activityTimelineService } from "@/modules/timeline/application/ActivityTimelineService.js";
import { resourceLibraryService } from "@/modules/resource/application/ResourceLibraryService.js";
import { FeatureFlagService } from "@/modules/feature-flags/FeatureFlagService.js";
import { aiUsageAnalyticsService } from "@/modules/ai-analytics/application/AIUsageAnalyticsService.js";

import type { CreateAssessmentUseCase } from "../application/use-cases/create-assessment.usecase.js";
import type { GetAssessmentDetailsUseCase } from "../application/use-cases/get-assessment-details.usecase.js";
import type { ListPublicAssessmentsUseCase } from "../application/use-cases/list-public-assessments.usecase.js";
import type { PublishAssessmentUseCase } from "../application/use-cases/publish-assessment.usecase.js";
import type { UpdateAssessmentUseCase } from "../application/use-cases/update-assessment.usecase.js";
import type { DuplicateAssessmentUseCase } from "../application/use-cases/duplicate-assessment.usecase.js";
import type { ArchiveAssessmentUseCase } from "../application/use-cases/archive-assessment.usecase.js";
import type { DeleteAssessmentUseCase } from "../application/use-cases/delete-assessment.usecase.js";
import type {
  CreateAssessmentVersionUseCase,
  ListAssessmentVersionsUseCase,
  RestoreAssessmentVersionUseCase,
} from "../application/use-cases/assessment-versioning.usecase.js";
import type {
  SaveAsTemplateUseCase,
  ListTemplatesUseCase,
} from "../application/use-cases/assessment-templates.usecase.js";
import type { GetAssessmentAnalyticsUseCase } from "../application/use-cases/get-assessment-analytics.usecase.js";
import type { GenerateMicroTasksUseCase } from "../application/use-cases/generate-micro-tasks.usecase.js";
import type { GenerateSkillTrailAssessmentUseCase } from "../application/use-cases/generate-skill-trail-assessment.usecase.js";
import type { GenerateAssessmentBlueprintUseCase } from "../application/use-cases/GenerateAssessmentBlueprintUseCase.js";
import type { Request, Response, NextFunction } from "express";

export class AssessmentController {
  constructor(
    private readonly createAssessmentUseCase: CreateAssessmentUseCase,
    private readonly updateAssessmentUseCase: UpdateAssessmentUseCase,
    private readonly publishAssessmentUseCase: PublishAssessmentUseCase,
    private readonly listPublicAssessmentsUseCase: ListPublicAssessmentsUseCase,
    private readonly getAssessmentDetailsUseCase: GetAssessmentDetailsUseCase,
    private readonly duplicateAssessmentUseCase?: DuplicateAssessmentUseCase,
    private readonly archiveAssessmentUseCase?: ArchiveAssessmentUseCase,
    private readonly deleteAssessmentUseCase?: DeleteAssessmentUseCase,
    private readonly createAssessmentVersionUseCase?: CreateAssessmentVersionUseCase,
    private readonly listAssessmentVersionsUseCase?: ListAssessmentVersionsUseCase,
    private readonly restoreAssessmentVersionUseCase?: RestoreAssessmentVersionUseCase,
    private readonly saveAsTemplateUseCase?: SaveAsTemplateUseCase,
    private readonly listTemplatesUseCase?: ListTemplatesUseCase,
    private readonly getAssessmentAnalyticsUseCase?: GetAssessmentAnalyticsUseCase,
    private readonly generateMicroTasksUseCase?: GenerateMicroTasksUseCase,
    private readonly generateSkillTrailAssessmentUseCase?: GenerateSkillTrailAssessmentUseCase,
    private readonly generateAssessmentBlueprintUseCase?: GenerateAssessmentBlueprintUseCase,
  ) {}

  async createAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessment = await this.createAssessmentUseCase.execute(req.user!.id, req.body);
    ResponseFormatter.created(res, assessment);
  }

  async updateAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessment = await this.updateAssessmentUseCase.execute(
      req.user!.id,
      req.params["id"] as string,
      req.body,
    );
    ResponseFormatter.success(res, assessment);
  }

  async publishAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessment = await this.publishAssessmentUseCase.execute(
      req.user!.id,
      req.params["id"] as string,
    );
    ResponseFormatter.success(res, assessment);
  }

  async listPublicAssessments(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { assessments, pagination } = await this.listPublicAssessmentsUseCase.execute(req.query);
    ResponseFormatter.paginated(res, assessments, pagination);
  }

  async getAssessmentDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    const details = await this.getAssessmentDetailsUseCase.execute(
      req.params["id"] as string,
      req.user?.id,
    );
    ResponseFormatter.success(res, details);
  }

  async duplicateAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessment = await this.duplicateAssessmentUseCase!.execute(
      req.params["id"] as string,
      req.user!.id,
    );
    ResponseFormatter.created(res, assessment);
  }

  async archiveAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessment = await this.archiveAssessmentUseCase!.execute(
      req.params["id"] as string,
      req.user!.id,
    );
    ResponseFormatter.success(res, assessment);
  }

  async deleteAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    await this.deleteAssessmentUseCase!.execute(req.params["id"] as string, req.user!.id);
    ResponseFormatter.success(res, { message: "Assessment deleted successfully" });
  }

  async createVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { changeSummary } = req.body;
    await this.createAssessmentVersionUseCase!.execute(
      req.params["id"] as string,
      changeSummary,
      req.user!.id,
    );
    ResponseFormatter.created(res, { message: "Version snapshot created successfully" });
  }

  async listVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    const versions = await this.listAssessmentVersionsUseCase!.execute(req.params["id"] as string);
    ResponseFormatter.success(res, versions);
  }

  async restoreVersion(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { versionNumber } = req.body;
    const restored = await this.restoreAssessmentVersionUseCase!.execute(
      req.params["id"] as string,
      versionNumber,
      req.user!.id,
    );
    ResponseFormatter.success(res, restored);
  }

  async saveAsTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { title, description, category, isGlobal } = req.body;
    const companyId = req.user?.companyId ?? undefined;
    const result = await this.saveAsTemplateUseCase!.execute(
      req.params["id"] as string,
      title,
      description,
      category,
      isGlobal ? undefined : companyId,
    );
    ResponseFormatter.created(res, result);
  }

  async listTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { category } = req.query;
    const companyId = req.user?.companyId ?? undefined;
    const templates = await this.listTemplatesUseCase!.execute(
      category as string | undefined,
      companyId,
    );
    ResponseFormatter.success(res, templates);
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    const analytics = await this.getAssessmentAnalyticsUseCase!.execute(req.params["id"] as string);
    ResponseFormatter.success(res, analytics);
  }

  async validateAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessment = await this.getAssessmentDetailsUseCase.execute(
      req.params["id"] as string,
      req.user?.id,
    );
    const result = AssessmentValidationEngine.validate(assessment as any);
    ResponseFormatter.success(res, result);
  }

  async triggerAIJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    const { action, input } = req.body;
    const assessmentId = req.params["id"] as string;
    const recruiterId = req.user!.id;

    const job = await queues.assessmentAi.add(`ai:${action}:${assessmentId}`, {
      assessmentId,
      recruiterId,
      action,
      input: input || {},
    });

    ResponseFormatter.success(
      res,
      {
        message: "AI assistant job queued successfully",
        jobId: job.id,
        action,
      },
      { statusCode: 202 },
    );
  }

  // ============================================================
  // ENTERPRISE ARCHITECTURAL HANDLERS
  // ============================================================

  async getCompetencyMatrix(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessmentId = req.params["id"] as string;
    const matrix = await competencyService.getAssessmentCompetencyMatrix(assessmentId);
    ResponseFormatter.success(res, matrix);
  }

  async mapCompetency(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessmentId = req.params["id"] as string;
    const { competencyName, weight, importance } = req.body;
    const mapping = await competencyService.mapCompetencyToAssessment(
      assessmentId,
      competencyName,
      weight || 10,
      importance || "MEDIUM",
    );
    ResponseFormatter.success(res, mapping, { statusCode: 201 });
  }

  async listLearningOutcomes(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessmentId = req.params["id"] as string;
    const outcomes = await learningOutcomeService.listOutcomes(assessmentId);
    ResponseFormatter.success(res, outcomes);
  }

  async updateLearningOutcomes(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessmentId = req.params["id"] as string;
    const { descriptions, isAiGenerated } = req.body;
    const outcomes = await learningOutcomeService.setOutcomes(
      assessmentId,
      descriptions || [],
      isAiGenerated || false,
    );
    ResponseFormatter.success(res, outcomes);
  }

  async generateLearningOutcomes(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessmentId = req.params["id"] as string;
    const { roleTitle, description } = req.body;
    const outcomes = await learningOutcomeService.generateAIOutcomes(
      assessmentId,
      roleTitle || "Full Stack Engineer",
      description || "",
    );
    ResponseFormatter.success(res, outcomes);
  }

  async getTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessmentId = req.params["id"] as string;
    const limit = req.query["limit"] ? Number(req.query["limit"]) : 50;
    const timeline = await activityTimelineService.getTimeline({ assessmentId, limit });
    ResponseFormatter.success(res, timeline);
  }

  async listResources(req: Request, res: Response, next: NextFunction): Promise<void> {
    const companyId = req.query["companyId"] as string | undefined;
    const resources = await resourceLibraryService.listResources(companyId);
    ResponseFormatter.success(res, resources);
  }

  async createResource(req: Request, res: Response, next: NextFunction): Promise<void> {
    const resource = await resourceLibraryService.createResource(req.body);
    ResponseFormatter.success(res, resource, { statusCode: 201 });
  }

  async listFeatureFlags(req: Request, res: Response, next: NextFunction): Promise<void> {
    const flags = await FeatureFlagService.getInstance().listFlags();
    ResponseFormatter.success(res, flags);
  }

  async getAIUsageAnalytics(req: Request, res: Response, next: NextFunction): Promise<void> {
    const assessmentId = req.params["id"] as string | undefined;
    const companyId = req.query["companyId"] as string | undefined;
    const summary = await aiUsageAnalyticsService.getSummary({ assessmentId, companyId });
    ResponseFormatter.success(res, summary);
  }
  async generateMicroTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!this.generateMicroTasksUseCase) {
      throw new Error("GenerateMicroTasksUseCase not initialized");
    }
    const result = await this.generateMicroTasksUseCase.execute({
      projectContext: req.body.projectContext,
      techStack: req.body.techStack,
      difficulty: req.body.difficulty,
      companyId: req.user!.companyId!,
      createdById: req.user!.id,
    });
    ResponseFormatter.success(res, result);
  }

  async generateSkillTrailAssessment(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!this.generateSkillTrailAssessmentUseCase) {
      throw new Error("GenerateSkillTrailAssessmentUseCase not initialized");
    }
    const result = await this.generateSkillTrailAssessmentUseCase.execute({
      skillTrailId: req.body.skillTrailId,
      companyId: req.user!.companyId!,
      createdById: req.user!.id,
      difficulty: req.body.difficulty,
    });
    ResponseFormatter.success(res, result);
  }

  async generateAssessmentBlueprint(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (!this.generateAssessmentBlueprintUseCase) {
      throw new Error("GenerateAssessmentBlueprintUseCase not initialized");
    }

    const { roleProfile, competencies, configurationRules } = req.body;
    
    const result = await this.generateAssessmentBlueprintUseCase.execute({
      roleProfile,
      competencies,
      configurationRules,
    });
    
    ResponseFormatter.success(res, result);
  }
}
