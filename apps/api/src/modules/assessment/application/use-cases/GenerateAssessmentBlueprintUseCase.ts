import { createModuleLogger } from "@/core/logger.js";
import { PROMPTS, compilePrompt } from "@/infrastructure/ai/PromptManager.js";
import type { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";
import type { SkillTrailConfigurationType } from "../../../management/application/use-cases/ConfigureSkillTrailUseCase.js";

const log = createModuleLogger("GenerateAssessmentBlueprintUseCase");

export type GenerateAssessmentBlueprintInput = {
  roleProfile: string;
  competencies: Array<{ name: string; proficiencyLevel: string }>;
  configurationRules: SkillTrailConfigurationType;
};

export type GeneratedTask = {
  type: "MCQ" | "CODE" | "FILE_UPLOAD";
  title: string;
  description: string;
  competencies: string[];
  maxPoints: number;
  difficulty: "Easy" | "Medium" | "Hard";
  // MCQ specific
  options?: string[];
  correctOptionIndex?: number;
  explanation?: string;
  // CODE specific
  starterCode?: string;
  rubric?: string[];
};

export type GenerateAssessmentBlueprintOutput = {
  blueprint: {
    title: string;
    tasks: GeneratedTask[];
  };
};

/**
 * Phase 5 AI Skill Trail Config:
 * Automatically generates a multi-stage Assessment Blueprint based on strict configuration rules.
 */
export class GenerateAssessmentBlueprintUseCase {
  constructor(private readonly aiEngine: AIFallbackEngine) {}

  async execute(
    input: GenerateAssessmentBlueprintInput,
  ): Promise<GenerateAssessmentBlueprintOutput> {
    log.info({ roleProfile: input.roleProfile }, "Generating assessment blueprint via AI");

    try {
      const prompt = compilePrompt(PROMPTS.ASSESSMENT_GENERATOR, {
        roleProfile: input.roleProfile,
        competencies: JSON.stringify(input.competencies),
        configurationRules: JSON.stringify(input.configurationRules, null, 2),
      });

      const response = await this.aiEngine.complete({
        messages: [
          { role: "system", content: prompt.systemMessage },
          { role: "user", content: prompt.userMessage },
        ],
        responseFormat: { type: "json_object" },
      });

      const parsed = JSON.parse(response.content) as GenerateAssessmentBlueprintOutput;

      if (!parsed.blueprint || !Array.isArray(parsed.blueprint.tasks)) {
        throw new Error("AI returned invalid JSON structure for assessment blueprint");
      }

      log.info(
        {
          roleProfile: input.roleProfile,
          taskCount: parsed.blueprint.tasks.length,
        },
        "Successfully generated assessment blueprint adhering to Skill Trail Rules",
      );

      return parsed;
    } catch (error) {
      log.error({ err: error }, "Failed to generate assessment blueprint");
      throw new Error("Failed to generate assessment blueprint using AI");
    }
  }
}
