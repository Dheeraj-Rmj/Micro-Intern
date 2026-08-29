import { createModuleLogger } from "@/core/logger.js";
import { PROMPTS, compilePrompt } from "@/infrastructure/ai/PromptManager.js";
import type { AIFallbackEngine } from "@/infrastructure/ai/AIFallbackEngine.js";
import { PrismaClient, TaskType, AssessmentStatus } from "@microintern/database";

const log = createModuleLogger("GenerateSkillTrailAssessmentUseCase");

export type GenerateSkillTrailAssessmentInput = {
  skillTrailId: string;
  companyId: string;
  createdById: string;
  difficulty?: string;
  isProctored?: boolean;
};

export class GenerateSkillTrailAssessmentUseCase {
  constructor(
    private readonly aiEngine: AIFallbackEngine,
    private readonly prisma: PrismaClient,
  ) {}

  async execute(input: GenerateSkillTrailAssessmentInput): Promise<{ id: string }> {
    log.info({ skillTrailId: input.skillTrailId }, "Generating AI Skill Trail Assessment");

    const skillTrail = await this.prisma.skillTrail.findUnique({
      where: { id: input.skillTrailId },
      include: {
        configuration: true,
        roleProfile: {
          include: {
            requiredSkills: { include: { skill: true } },
            requiredCompetencies: { include: { competency: true } },
          }
        }
      }
    });

    if (!skillTrail) {
      throw new Error(`SkillTrail not found: ${input.skillTrailId}`);
    }

    if (!skillTrail.configuration) {
      throw new Error(`SkillTrail configuration missing for: ${input.skillTrailId}`);
    }

    const rules = skillTrail.configuration.rulesJson as any;
    const count = rules.numberOfQuestions || 10;
    const passingScore = rules.passingScore || 70;
    const durationMinutes = rules.assessmentDurationMinutes || 60;

    const skillsList = skillTrail.roleProfile?.requiredSkills.map(rs => rs.skill.name).join(", ") || "General Technical Skills";
    const competenciesList = skillTrail.roleProfile?.requiredCompetencies.map(rc => rc.competency.name).join(", ") || "Problem Solving, Logic";

    const prompt = compilePrompt(PROMPTS.SKILL_TRAIL_MCQ_GENERATOR, {
      skillTrailName: skillTrail.title,
      skillTrailDescription: skillTrail.roleProfile?.description || "",
      skills: skillsList,
      competencies: competenciesList,
      difficulty: input.difficulty || rules.difficulty || "Medium",
      count,
    });

    const aiRes = await this.aiEngine.complete({
      messages: [
        { role: "system", content: prompt.systemMessage },
        { role: "user", content: prompt.userMessage },
      ],
      responseFormat: { type: "json_object" },
    });

    let generatedQuestions;
    try {
      const parsed = JSON.parse(aiRes.content);
      if (!Array.isArray(parsed.questions)) {
        throw new Error("AI response missing 'questions' array");
      }
      generatedQuestions = parsed.questions;
    } catch (error) {
      log.error({ err: error, content: aiRes.content }, "Failed to parse AI question generation response");
      throw new Error("AI failed to generate valid MCQ JSON format.");
    }

    // Ensure we only take the requested number of questions
    const finalQuestions = generatedQuestions.slice(0, count);

    // Use a transaction to create the Assessment, Tasks, and Link them
    const assessment = await this.prisma.$transaction(async (tx) => {
      const newAssessment = await tx.assessment.create({
        data: {
          companyId: input.companyId,
          createdById: input.createdById,
          title: `${skillTrail.title} - Auto Assessment`,
          slug: `skill-trail-${skillTrail.id}-${Date.now()}`,
          description: `Automatically generated assessment for ${skillTrail.title}`,
          instructions: "Please answer all multiple choice questions. Your final score will determine your progression.",
          status: AssessmentStatus.PUBLISHED,
          durationMinutes,
          passingScore,
          maxAttempts: 1,
          isPublic: false,
          isProctored: input.isProctored ?? rules.isProctored ?? false,
          difficulty: input.difficulty || rules.difficulty || "Medium",
          tasks: {
            create: finalQuestions.map((q: any, index: number) => ({
              title: `Question ${index + 1}`,
              description: q.question,
              taskType: TaskType.MULTIPLE_CHOICE,
              sortOrder: index,
              maxPoints: rules.marksPerQuestion || 10,
              config: {
                options: q.options,
                correctOption: q.correctOption, // SECURE: Kept in backend config JSON
                explanation: q.explanation,
                skillId: q.skillId,
                competencyId: q.competencyId,
                difficulty: q.difficulty,
              },
            })),
          },
        },
      });

      // Link to SkillTrailAssessment
      const currentAssessments = await tx.skillTrailAssessment.count({
        where: { skillTrailId: skillTrail.id }
      });

      await tx.skillTrailAssessment.create({
        data: {
          skillTrailId: skillTrail.id,
          assessmentId: newAssessment.id,
          sortOrder: currentAssessments,
        }
      });

      return newAssessment;
    });

    log.info({ assessmentId: assessment.id }, "Successfully generated and published AI Skill Trail Assessment");
    return { id: assessment.id };
  }
}
