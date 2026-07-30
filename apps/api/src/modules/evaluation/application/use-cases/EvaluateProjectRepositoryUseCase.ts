import { createModuleLogger } from "@/core/logger.js";
import { PROMPTS, compilePrompt } from "@/infrastructure/ai/PromptManager.js";
import type { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";

const log = createModuleLogger("EvaluateProjectRepositoryUseCase");

export type EvaluateProjectRepositoryInput = {
  projectInstructions: string;
  repositoryContextJSON: string; // The chunks/metadata of the repo
};

export type EvaluateProjectRepositoryOutput = {
  projectScore: number;
  codeQuality: number;
  architectureScore: number;
  maintainability: number;
  strengths: string[];
  improvements: string[];
  summary: string;
};

/**
 * Phase 3 AI OS:
 * Evaluates GitHub repositories or ZIP project submissions holistically.
 */
export class EvaluateProjectRepositoryUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(input: EvaluateProjectRepositoryInput): Promise<EvaluateProjectRepositoryOutput> {
    log.info("Evaluating candidate project repository");

    try {
      const prompt = compilePrompt(PROMPTS.PROJECT_EVALUATION, {
        projectInstructions: input.projectInstructions,
        repositoryContextJSON: input.repositoryContextJSON,
      });

      const response = await this.aiEngine.complete({
        messages: [
          { role: "system", content: prompt.systemMessage },
          { role: "user", content: prompt.userMessage },
        ],
        responseFormat: { type: "json_object" },
      });

      const parsed = JSON.parse(response.content) as EvaluateProjectRepositoryOutput;

      if (typeof parsed.projectScore !== "number") {
        throw new Error("AI returned invalid JSON structure for project evaluation");
      }

      log.info("Successfully evaluated project repository");
      return parsed;
    } catch (error) {
      log.error({ err: error }, "Failed to evaluate project repository");
      throw new Error("Failed to evaluate project using AI");
    }
  }
}
