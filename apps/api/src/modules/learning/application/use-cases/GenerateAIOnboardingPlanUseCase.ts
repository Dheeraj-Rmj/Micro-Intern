import { z } from "zod";
import { PrismaClient } from "@microintern/database";
import { createModuleLogger } from "@/core/logger.js";
import { PROMPTS, compilePrompt } from "@/infrastructure/ai/PromptManager.js";
import { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";

const log = createModuleLogger("GenerateAIOnboardingPlanUseCase");

const OutputSchema = z.object({
  skillGapsIdentified: z.array(z.string()),
  weeklyPlan: z.array(
    z.object({
      week: z.number(),
      focus: z.string(),
      tasks: z.array(z.string()),
    }),
  ),
  messageToCandidate: z.string(),
});

export type AIOnboardingPlan = z.infer<typeof OutputSchema>;

export class GenerateAIOnboardingPlanUseCase {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly aiEngine: AIFallbackEngine,
  ) {}

  public async execute(journeyId: string): Promise<AIOnboardingPlan | null> {
    log.info({ journeyId }, "Generating AI Onboarding Plan for newly hired candidate...");

    const journey: any = await this.prisma.candidateJourney.findUnique({
      where: { id: journeyId },
      include: {
        roleProfile: {
          include: {
            requiredSkills: {
              include: {
                skill: true,
              },
            },
          },
        },
      },
    });

    if (!journey || !journey.roleProfile) {
      log.warn({ journeyId }, "Journey or Role Profile not found for Onboarding generation");
      return null;
    }

    // In a full implementation, we'd pull the exact verified skills for this candidate.
    // We mock it for the pipeline proof of concept.
    const roleReqs = journey.roleProfile.requiredSkills.map((s: any) => s.skill.name).join(", ");
    const verifiedSkillsMock = roleReqs
      .split(", ")
      .slice(0, Math.max(1, roleReqs.split(", ").length - 1))
      .join(", "); // Mock missing the last skill

    const { systemMessage, userMessage } = compilePrompt(PROMPTS.ONBOARDING_PLAN_GENERATOR, {
      roleProfileRequirements: roleReqs,
      candidateVerifiedSkills: verifiedSkillsMock || "General Programming",
    });

    try {
      const response = await this.aiEngine.complete({
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        responseFormat: { type: "json_object" },
      });

      const responseText = response.content;
      const parsed = JSON.parse(responseText);
      const validated = OutputSchema.parse(parsed);

      log.info({ journeyId }, "Successfully generated AI Onboarding Plan");
      return validated;
    } catch (error) {
      log.error({ err: error, journeyId }, "Failed to generate Onboarding Plan");
      throw error;
    }
  }
}
