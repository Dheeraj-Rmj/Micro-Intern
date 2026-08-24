import { createModuleLogger } from "@/core/logger.js";
import { PrismaClient, SkillProficiency } from "@microintern/database";

const log = createModuleLogger("EvolveSkillProficiencyUseCase");

export type EvolveSkillProficiencyInput = {
  candidateId: string;
  skillName: string;
  assessmentScore: number;
  assessmentDifficulty: "Easy" | "Medium" | "Hard";
};

/**
 * Phase 3 AI OS:
 * Analyzes an incoming assessment score and determines if a candidate's skill should evolve
 * to the next proficiency level (e.g., Verified -> Advanced -> Expert).
 */
export class EvolveSkillProficiencyUseCase {
  constructor(private readonly prisma: PrismaClient) {}

  async execute(input: EvolveSkillProficiencyInput): Promise<void> {
    log.info(
      { candidateId: input.candidateId, skill: input.skillName },
      "Evaluating skill evolution",
    );

    try {
      // Find the existing skill record
      const candidateSkill = await this.prisma.candidateSkill.findFirst({
        where: {
          candidateId: input.candidateId,
          skill: input.skillName,
        },
      });

      if (!candidateSkill) {
        log.info("Candidate does not possess this skill explicitly, ignoring evolution");
        return;
      }

      const currentLevel = candidateSkill.proficiencyLevel;
      let newLevel = currentLevel;

      // Basic Evolution Rules Engine
      if (input.assessmentScore >= 90 && input.assessmentDifficulty === "Hard") {
        if (currentLevel === SkillProficiency.BEGINNER) newLevel = SkillProficiency.INTERMEDIATE;
        else if (currentLevel === SkillProficiency.INTERMEDIATE)
          newLevel = SkillProficiency.ADVANCED;
        else if (currentLevel === SkillProficiency.ADVANCED) newLevel = SkillProficiency.EXPERT;
      } else if (input.assessmentScore >= 80 && input.assessmentDifficulty === "Medium") {
        if (currentLevel === SkillProficiency.BEGINNER) newLevel = SkillProficiency.INTERMEDIATE;
      }

      if (newLevel !== currentLevel) {
        await this.prisma.candidateSkill.update({
          where: { id: candidateSkill.id },
          data: { proficiencyLevel: newLevel },
        });

        log.info(
          {
            candidateId: input.candidateId,
            skill: input.skillName,
            old: currentLevel,
            new: newLevel,
          },
          "Skill proficiency evolved successfully",
        );
      } else {
        log.info("Score was not high enough or difficulty too low for evolution");
      }
    } catch (error) {
      log.error({ err: error }, "Failed to evolve skill proficiency");
      throw new Error("Failed to evaluate skill evolution rules");
    }
  }
}
