import { SubmissionStatus, EvaluationStatus } from "@microintern/database";

import { createModuleLogger } from "@/core/logger.js";
import {
  getAIGateway,
  getAISafetyLayer,
  compilePrompt,
  PROMPTS,
  type AIFallbackEngine,
  type AISafetyLayer,
} from "@/infrastructure/ai/index.js";
import { AssessmentNotFoundError } from "@/modules/assessment/domain/errors/assessment.errors.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

import {
  SubmissionNotFoundError,
  EvaluationNotFoundError,
} from "../../../submission/domain/errors/submission.errors.js";
import type { IAssessmentRepository } from "@/modules/assessment/application/ports/IAssessmentRepository.js";
import type { Evaluation } from "../../domain/entities/Evaluation.entity.js";
import type { IEvaluationRepository } from "../ports/IEvaluationRepository.js";
import type { ISubmissionRepository } from "../../../submission/application/ports/ISubmissionRepository.js";
import type { Submission } from "../../../submission/domain/entities/Submission.entity.js";
import type { SubmissionAnswer } from "../../../submission/domain/entities/SubmissionAnswer.entity.js";

const log = createModuleLogger("ProcessEvaluationUseCase");

export class ProcessEvaluationUseCase {
  constructor(
    private readonly submissionRepository: ISubmissionRepository,
    private readonly evaluationRepository: IEvaluationRepository,
    private readonly assessmentRepository: IAssessmentRepository,
    private readonly aiEngine: AIFallbackEngine = getAIGateway(),
    private readonly aiSafetyLayer: AISafetyLayer = getAISafetyLayer(),
  ) {}

  async execute(submissionId: string): Promise<Evaluation> {
    log.info({ submissionId }, "Starting background AI evaluation processing");
    const startedAt = new Date();

    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) {
      throw new SubmissionNotFoundError(submissionId);
    }

    const assessment = await this.assessmentRepository.findById(submission.assessmentId);
    if (!assessment) {
      throw new AssessmentNotFoundError(submission.assessmentId);
    }

    await this.submissionRepository.updateStatus(submission.id, SubmissionStatus.UNDER_EVALUATION);

    let totalMaxPoints = 0;
    const tasks = assessment.tasks || [];
    const answers = submission.answers || [];

    // Compile submission context for Advanced AI Evaluation
    const compiledTasksAndAnswers = tasks.map((task) => {
      totalMaxPoints += task.maxPoints;
      const answer = answers.find((a) => a.taskId === task.id);
      const answerText =
        answer?.answerText ??
        (answer?.answerFileUrl ? `[File uploaded: ${answer.answerFileUrl}]` : "No response.");

      return {
        taskTitle: task.title,
        maxPoints: task.maxPoints,
        instructions: task.description,
        candidateAnswer: answerText,
      };
    });

    // Run Safety Check over the entire combined text
    const fullSubmissionText = compiledTasksAndAnswers.map((t) => t.candidateAnswer).join("\\n");
    const safetyCheck = this.aiSafetyLayer.checkInput(fullSubmissionText);
    if (!safetyCheck.passed && safetyCheck.flags.includes("PROMPT_INJECTION_DETECTED")) {
      log.warn(
        { submissionId },
        "Prompt injection attempt caught by AISafetyLayer in full submission",
      );
      // Early fail for malicious submission
      await this.submissionRepository.updateStatus(submission.id, SubmissionStatus.FAILED, {
        totalScore: 0,
        isPassed: false,
      });
      throw new Error("Security violation: AI prompt injection attempt detected.");
    }

    let percentageScore = 0;
    let isPassed = false;
    let summaryText = "Evaluation failed or incomplete.";
    let allStrengths: string[] = [];
    let allImprovements: string[] = [];
    let rawResponse: any = {};
    let performanceClassification = "Unknown";

    try {
      // Phase 2: Use Advanced Evaluation Prompt (Performance Classification)
      const prompt = compilePrompt(PROMPTS.ADVANCED_EVALUATION, {
        assessmentTitle: assessment.title,
        passingScore: assessment.passingScore,
        candidateSubmissionJSON: JSON.stringify(compiledTasksAndAnswers, null, 2),
      });

      const aiRes = await this.aiEngine.complete({
        messages: [
          { role: "system", content: prompt.systemMessage },
          { role: "user", content: prompt.userMessage },
        ],
        responseFormat: { type: "json_object" },
      });

      const parsed = JSON.parse(aiRes.content);

      percentageScore = typeof parsed.overallScore === "number" ? parsed.overallScore : 0;
      isPassed = parsed.isPassed ?? percentageScore >= assessment.passingScore;
      summaryText = parsed.summary ?? "Evaluation completed.";
      performanceClassification = parsed.performanceClassification ?? "Average";

      if (Array.isArray(parsed.strengths)) allStrengths = parsed.strengths;
      if (Array.isArray(parsed.weaknesses)) allImprovements = parsed.weaknesses;

      // Store all advanced AI metrics in the raw response
      rawResponse = {
        percentageScore,
        totalMaxPoints,
        performanceClassification,
        confidenceScore: parsed.confidenceScore ?? null,
        learningGaps: parsed.learningGaps ?? [],
      };
    } catch (error) {
      log.warn(
        { err: error, submissionId },
        "Advanced AI evaluation failed, utilizing fallback heuristic",
      );
      percentageScore = fullSubmissionText.length > 50 ? 50 : 10;
      isPassed = false;
      summaryText = "AI Engine unavailable. Automatic partial score applied.";
      rawResponse = {
        percentageScore,
        totalMaxPoints,
        performanceClassification: "Needs Improvement",
      };
    }

    const evaluation = await this.evaluationRepository.save({
      submissionId: submission.id,
      status: EvaluationStatus.COMPLETED,
      aiProvider: "gateway",
      aiModel: "multi-model-fallback",
      promptVersion: PROMPTS.ADVANCED_EVALUATION.version,
      totalScore: Math.round((percentageScore / 100) * totalMaxPoints), // Derive total from percentage
      maxPossibleScore: totalMaxPoints,
      percentageScore,
      isPassed,
      summary: summaryText,
      strengths: allStrengths,
      improvements: allImprovements,
      rawResponse,
      startedAt,
      completedAt: new Date(),
    });

    const finalSubmissionStatus = isPassed ? SubmissionStatus.PASSED : SubmissionStatus.FAILED;
    await this.submissionRepository.updateStatus(submission.id, finalSubmissionStatus, {
      totalScore: percentageScore,
      isPassed,
    });

    log.info(
      { submissionId, percentageScore, performanceClassification, isPassed },
      "Advanced Evaluation concluded",
    );

    await eventBus.emit(DOMAIN_EVENTS.EVALUATION_COMPLETED, {
      evaluationId: evaluation.id,
      submissionId: submission.id,
      assessmentId: assessment.id,
      candidateId: submission.candidateId,
      percentageScore,
      isPassed,
    });

    return evaluation;
  }
}
