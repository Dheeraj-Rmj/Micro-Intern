import type { IRoleProfileRepository } from "@/modules/skill-framework/domain/IRoleProfileRepository.js";
import type { ISkillVerificationRepository } from "@/modules/skill-verification/domain/ISkillVerificationRepository.js";
import type { ISkillRepository } from "@/modules/skill-framework/domain/ISkillRepository.js";
import { SkillVerificationStatus } from "@microintern/database";

export interface LearningRecommendationResult {
  candidateId: string;
  roleProfileId?: string;
  missingSkills: Array<{
    skillId: string;
    skillName: string;
    targetScore: number;
    currentScore: number;
  }>;
  recommendedResources: Array<{
    title: string;
    type: "TUTORIAL" | "DOCUMENTATION" | "COURSE" | "PRACTICE_PROJECT";
    url: string;
    skillName: string;
    description: string;
  }>;
  practiceProjects: Array<{
    title: string;
    description: string;
    targetSkills: string[];
    estimatedHours: number;
  }>;
  improvementRoadmap: Array<{
    stepNumber: number;
    title: string;
    description: string;
    focusSkill: string;
  }>;
}

export class GenerateLearningRecommendationsUseCase {
  constructor(
    private readonly roleProfileRepo: IRoleProfileRepository,
    private readonly verificationRepo: ISkillVerificationRepository,
    private readonly skillRepo: ISkillRepository,
  ) {}

  async execute(
    candidateId: string,
    roleProfileId?: string,
  ): Promise<LearningRecommendationResult> {
    const verifications = await this.verificationRepo.listByCandidate(candidateId);
    const verificationMap = new Map<string, SkillVerificationStatus>();
    for (const v of verifications) {
      verificationMap.set(v.skillId, v.status);
    }

    const missingSkills: LearningRecommendationResult["missingSkills"] = [];
    const recommendedResources: LearningRecommendationResult["recommendedResources"] = [];
    const practiceProjects: LearningRecommendationResult["practiceProjects"] = [];
    const improvementRoadmap: LearningRecommendationResult["improvementRoadmap"] = [];

    if (roleProfileId) {
      const requiredSkills = await this.roleProfileRepo.getRequiredSkills(roleProfileId);
      for (const req of requiredSkills) {
        const currentStatus = verificationMap.get(req.skillId);
        let currentScore = 0;
        if (currentStatus === SkillVerificationStatus.CERTIFIED) currentScore = 100;
        else if (currentStatus === SkillVerificationStatus.HUMAN_VERIFIED) currentScore = 90;
        else if (currentStatus === SkillVerificationStatus.AI_VERIFIED) currentScore = 80;
        else if (currentStatus === SkillVerificationStatus.DEMONSTRATED) currentScore = 70;
        else if (currentStatus === SkillVerificationStatus.OBSERVED) currentScore = 50;
        else if (currentStatus === SkillVerificationStatus.CLAIMED) currentScore = 30;

        if (currentScore < req.minimumScore) {
          const skillName = (req as any).skill?.name || "Technical Skill";
          missingSkills.push({
            skillId: req.skillId,
            skillName,
            targetScore: req.minimumScore,
            currentScore,
          });

          recommendedResources.push({
            title: `Advanced ${skillName} Masterclass`,
            type: "COURSE",
            url: `https://docs.microintern.com/learning/${encodeURIComponent(skillName.toLowerCase())}`,
            skillName,
            description: `Deep-dive tutorial on real-world ${skillName} architecture and best practices.`,
          });

          practiceProjects.push({
            title: `Build a production-grade ${skillName} service`,
            description: `Create an open-source project demonstrating advanced ${skillName} capabilities with tests.`,
            targetSkills: [skillName],
            estimatedHours: 15,
          });
        }
      }
    } else {
      // Default recommendations based on unverified skills
      const allSkills = await this.skillRepo.findAll();
      for (const skill of allSkills.slice(0, 5)) {
        if (!verificationMap.has(skill.id)) {
          missingSkills.push({
            skillId: skill.id,
            skillName: skill.name,
            targetScore: 75,
            currentScore: 0,
          });

          recommendedResources.push({
            title: `${skill.name} Fundamentals & Architecture`,
            type: "DOCUMENTATION",
            url: `https://docs.microintern.com/learning/${encodeURIComponent(skill.name.toLowerCase())}`,
            skillName: skill.name,
            description: `Official MicroIntern learning guide for ${skill.name}.`,
          });
        }
      }
    }

    missingSkills.forEach((item, index) => {
      improvementRoadmap.push({
        stepNumber: index + 1,
        title: `Master ${item.skillName}`,
        description: `Complete practice project and submit code evidence to achieve verified ${item.skillName} proficiency.`,
        focusSkill: item.skillName,
      });
    });

    return {
      candidateId,
      roleProfileId,
      missingSkills,
      recommendedResources,
      practiceProjects,
      improvementRoadmap,
    };
  }
}
