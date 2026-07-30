import { createModuleLogger } from "@/core/logger.js";
import type { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";

const log = createModuleLogger("GenerateShortlistUseCase");

export type GenerateShortlistInput = {
  roleProfile: string;
  rankedCandidates: Array<{
    candidateId: string;
    rank: number;
    fitScore: number;
    reasoning: string;
  }>;
  shortlistSize: number;
  criteria: "Fastest Learners" | "Highest Assessment Score" | "Best Skill Match";
};

export type GenerateShortlistOutput = {
  shortlist: Array<{ candidateId: string; reason: string }>;
};

/**
 * Phase 3 AI OS:
 * Extracts a targeted shortlist from the globally ranked candidate pool.
 */
export class GenerateShortlistUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(input: GenerateShortlistInput): Promise<GenerateShortlistOutput> {
    log.info({ criteria: input.criteria }, "Generating AI shortlist");

    try {
      const systemMessage = `You are an AI Sourcing Agent.
You must extract the top ${input.shortlistSize} candidates that best fit the criteria: "${input.criteria}".
Always respond with valid JSON matching the schema: { "shortlist": [ { "candidateId": "...", "reason": "..." } ] }`;

      const userMessage = `Role: ${input.roleProfile}
Ranked Candidate Data: ${JSON.stringify(input.rankedCandidates, null, 2)}`;

      const response = await this.aiEngine.complete({
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        responseFormat: { type: "json_object" },
      });

      const parsed = JSON.parse(response.content) as GenerateShortlistOutput;

      if (!parsed.shortlist || !Array.isArray(parsed.shortlist)) {
        throw new Error("AI returned invalid JSON structure for shortlist generation");
      }

      log.info("Successfully generated shortlist");
      return parsed;
    } catch (error) {
      log.error({ err: error }, "Failed to generate shortlist");
      throw new Error("Failed to generate shortlist using AI");
    }
  }
}
