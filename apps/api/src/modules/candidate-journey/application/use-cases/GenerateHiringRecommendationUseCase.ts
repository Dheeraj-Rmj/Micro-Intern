import { DomainError } from "@/shared/errors/index.js";
import { createModuleLogger } from "@/core/logger.js";
import { compilePrompt } from "@/infrastructure/ai/PromptManager.js";
import type { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";

const log = createModuleLogger("GenerateHiringRecommendationUseCase");

export type GenerateHiringRecommendationInput = {
  candidateId: string;
  roleProfile: string;
  evaluationClassification: string;
  evaluationScore: number;
  learningGaps: string[];
};

export type GenerateHiringRecommendationOutput = {
  hiringConfidence: number;
  riskScore: number;
  recommendedAction:
    | "Reject"
    | "Hold"
    | "Assign Learning"
    | "Technical Interview"
    | "HR Interview"
    | "Manager Round"
    | "Offer"
    | "Hire";
  reasoning: string;
};

/**
 * Phase 2 Intelligence Layer:
 * Analyzes the final evaluation and recommends the next hiring decision to the recruiter.
 */
export class GenerateHiringRecommendationUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(
    input: GenerateHiringRecommendationInput,
  ): Promise<GenerateHiringRecommendationOutput> {
    log.info({ candidateId: input.candidateId }, "Generating hiring recommendation via AI");

    try {
      const systemMessage = `You are an AI Hiring Manager.
Analyze the candidate's evaluation classification and score against the role profile.
Determine the most appropriate next action in the hiring pipeline.
Always respond with valid JSON matching the schema: { "hiringConfidence": number, "riskScore": number, "recommendedAction": "...", "reasoning": "..." }`;

      const userMessage = `Role: ${input.roleProfile}
Evaluation Classification: ${input.evaluationClassification}
Score: ${input.evaluationScore}
Learning Gaps: ${JSON.stringify(input.learningGaps)}`;

      const response = await this.aiEngine.complete({
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        responseFormat: { type: "json_object" },
      });

      const parsed = JSON.parse(response.content) as GenerateHiringRecommendationOutput;

      if (!parsed.recommendedAction) {
        throw new Error("AI returned invalid JSON structure for hiring recommendation");
      }

      log.info(
        { candidateId: input.candidateId, action: parsed.recommendedAction },
        "Successfully generated hiring recommendation",
      );

      return parsed;
    } catch (error) {
      log.error({ err: error }, "Failed to generate hiring recommendation");
      throw new Error("Failed to generate hiring recommendation using AI");
    }
  }
}
