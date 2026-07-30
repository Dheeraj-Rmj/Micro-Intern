import { DomainError } from "@/shared/errors/index.js";
import { createModuleLogger } from "@/core/logger.js";
import { PROMPTS, compilePrompt } from "@/infrastructure/ai/PromptManager.js";
import type { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";

const log = createModuleLogger("AnalyzeRoleProfileUseCase");

export type AnalyzeRoleProfileInput = {
  jobTitle: string;
  jobDescription: string;
  seniorityLevel: string;
  companyStandards?: string;
};

export type AnalyzedCompetency = {
  name: string;
  importance: "High" | "Medium" | "Low";
  proficiencyLevel: "Beginner" | "Intermediate" | "Advanced" | "Expert";
};

export type AnalyzeRoleProfileOutput = {
  competencies: AnalyzedCompetency[];
  difficultyProfile: "Easy" | "Medium" | "Hard";
  recommendedAssessmentDurationMins: number;
};

/**
 * Phase 2 Intelligence Layer:
 * Analyzes a raw Job Description and outputs structured competency requirements using the AI Engine.
 */
export class AnalyzeRoleProfileUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(input: AnalyzeRoleProfileInput): Promise<AnalyzeRoleProfileOutput> {
    log.info({ jobTitle: input.jobTitle }, "Analyzing role profile via AI");

    try {
      const prompt = compilePrompt(PROMPTS.ROLE_UNDERSTANDING, input);

      const response = await this.aiEngine.complete({
        messages: [
          { role: "system", content: prompt.systemMessage },
          { role: "user", content: prompt.userMessage },
        ],
        responseFormat: { type: "json_object" },
      });

      const parsed = JSON.parse(response.content) as AnalyzeRoleProfileOutput;

      // Basic runtime validation
      if (!parsed.competencies || !Array.isArray(parsed.competencies)) {
        throw new Error("AI returned invalid JSON structure for competencies");
      }

      log.info(
        {
          jobTitle: input.jobTitle,
          competencyCount: parsed.competencies.length,
        },
        "Successfully analyzed role profile",
      );

      return parsed;
    } catch (error) {
      log.error({ err: error }, "Failed to analyze role profile");
      throw new Error("Failed to generate role intelligence from job description");
    }
  }
}
