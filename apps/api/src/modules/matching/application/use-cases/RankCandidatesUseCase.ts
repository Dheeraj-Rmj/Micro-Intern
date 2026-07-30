import { DomainError } from "@/shared/errors/index.js";
import { createModuleLogger } from "@/core/logger.js";
import { PROMPTS, compilePrompt } from "@/infrastructure/ai/PromptManager.js";
import type { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";

const log = createModuleLogger("RankCandidatesUseCase");

export type CandidateData = {
  candidateId: string;
  verifiedSkills: string[];
  assessmentScore: number;
  learningGaps: string[];
};

export type RankCandidatesInput = {
  roleProfile: string;
  candidates: CandidateData[];
};

export type RankedCandidate = {
  candidateId: string;
  rank: number;
  fitScore: number;
  reasoning: string;
};

export type RankCandidatesOutput = {
  rankedCandidates: RankedCandidate[];
};

/**
 * Phase 3 AI OS:
 * Continuously evaluates and ranks applicants based on incoming assessment data.
 */
export class RankCandidatesUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(input: RankCandidatesInput): Promise<RankCandidatesOutput> {
    log.info({ candidateCount: input.candidates.length }, "Ranking candidates via AI");

    if (input.candidates.length === 0) {
      return { rankedCandidates: [] };
    }

    try {
      const prompt = compilePrompt(PROMPTS.CANDIDATE_RANKING, {
        roleProfile: input.roleProfile,
        candidatesDataJSON: JSON.stringify(input.candidates, null, 2),
      });

      const response = await this.aiEngine.complete({
        messages: [
          { role: "system", content: prompt.systemMessage },
          { role: "user", content: prompt.userMessage },
        ],
        responseFormat: { type: "json_object" },
      });

      const parsed = JSON.parse(response.content) as RankCandidatesOutput;

      if (!parsed.rankedCandidates || !Array.isArray(parsed.rankedCandidates)) {
        throw new Error("AI returned invalid JSON structure for candidate ranking");
      }

      log.info("Successfully ranked candidates");
      return parsed;
    } catch (error) {
      log.error({ err: error }, "Failed to rank candidates");
      throw new Error("Failed to generate candidate ranking using AI");
    }
  }
}
