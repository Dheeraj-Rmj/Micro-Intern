import { createModuleLogger } from "@/core/logger.js";
import { PROMPTS, compilePrompt } from "@/infrastructure/ai/PromptManager.js";
import type { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";

const log = createModuleLogger("GenerateCandidateRecoveryReportUseCase");

export type GenerateCandidateRecoveryReportInput = {
  candidateId: string;
  roleProfile: string;
  candidateEvaluationJSON: string;
};

export type GenerateCandidateRecoveryReportOutput = {
  readinessScore: number;
  performanceRating: string;
  strengths: string[];
  weakSkills: string[];
  missingCompetencies: string[];
  areasForImprovement: string[];
  skillGapAnalysis: {
    skillsYouHave: string[];
    skillsYouNeed: string[];
  };
  motivationalSummary: string;
};

/**
 * Phase 4 Candidate Recovery Engine:
 * Generates an encouraging, highly detailed rejection report.
 */
export class GenerateCandidateRecoveryReportUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(
    input: GenerateCandidateRecoveryReportInput,
  ): Promise<GenerateCandidateRecoveryReportOutput> {
    log.info({ candidateId: input.candidateId }, "Generating Candidate Recovery Report");

    try {
      const prompt = compilePrompt(PROMPTS.CANDIDATE_RECOVERY_REPORT, {
        roleProfile: input.roleProfile,
        candidateEvaluationJSON: input.candidateEvaluationJSON,
      });

      const response = await this.aiEngine.complete({
        messages: [
          { role: "system", content: prompt.systemMessage },
          { role: "user", content: prompt.userMessage },
        ],
        responseFormat: { type: "json_object" },
      });

      const parsed = JSON.parse(response.content) as GenerateCandidateRecoveryReportOutput;

      if (typeof parsed.readinessScore !== "number") {
        throw new Error("AI returned invalid JSON structure for Candidate Recovery Report");
      }

      log.info("Successfully generated Recovery Report");
      return parsed;
    } catch (error) {
      log.error({ err: error }, "Failed to generate Recovery Report");
      throw new Error("Failed to generate Recovery Report using AI");
    }
  }
}
