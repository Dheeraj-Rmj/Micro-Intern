import type { IRoleProfileRepository } from "@/modules/skill-framework/domain/IRoleProfileRepository.js";
import type { ISkillVerificationRepository } from "@/modules/skill-verification/domain/ISkillVerificationRepository.js";
import type { IEvidenceRepository } from "@/modules/evidence/domain/IEvidenceRepository.js";
import { SkillVerificationStatus } from "@microintern/database";

export interface RoleMatchResult {
  roleProfileId: string;
  candidateId: string;
  overallMatchScore: number; // 0 - 100
  skillMatchPercentage: number;
  competencyMatchPercentage: number;
  evidenceMatchPercentage: number;
  confidenceScore: number;
  skillGaps: Array<{
    skillId: string;
    skillName?: string;
    minimumScore: number;
    actualScore: number;
    isCritical: boolean;
  }>;
  growthPotentialScore: number;
  recommendation: "STRONG_MATCH" | "POTENTIAL_MATCH" | "DEVELOPMENT_NEEDED" | "MISMATCH";
}

export class SkillMatchingService {
  constructor(
    private readonly roleProfileRepo: IRoleProfileRepository,
    private readonly verificationRepo: ISkillVerificationRepository,
    private readonly evidenceRepo: IEvidenceRepository,
  ) {}

  async matchCandidateToRole(roleProfileId: string, candidateId: string): Promise<RoleMatchResult> {
    const profile = await this.roleProfileRepo.findById(roleProfileId);
    if (!profile) {
      throw new Error(`RoleProfile not found: ${roleProfileId}`);
    }

    const requiredSkills = await this.roleProfileRepo.getRequiredSkills(roleProfileId);
    const requiredCompetencies = await this.roleProfileRepo.getRequiredCompetencies(roleProfileId);
    const verifications = await this.verificationRepo.listByCandidate(candidateId);
    const evidenceList = await this.evidenceRepo.listByCandidate(candidateId);

    const verificationMap = new Map<
      string,
      { status: SkillVerificationStatus; confidence: number }
    >();
    for (const v of verifications) {
      verificationMap.set(v.skillId, {
        status: v.status,
        confidence: v.confidenceScore,
      });
    }

    const evidencedSkillIds = new Set<string>();
    for (const ev of evidenceList) {
      if ((ev as any).linkedSkills) {
        for (const ls of (ev as any).linkedSkills) {
          evidencedSkillIds.add(ls.skillId);
        }
      }
    }

    // 1. Skill Match Percentage & Gaps
    const skillGaps: RoleMatchResult["skillGaps"] = [];
    let totalSkillWeightedScore = 0;
    let totalSkillWeight = 0;
    let matchedSkillsWithEvidence = 0;
    let totalConfidence = 0;
    let confidenceCount = 0;

    for (const req of requiredSkills) {
      const ver = verificationMap.get(req.skillId);
      // Map status rank to approximate numeric score
      let actualScore = 0;
      if (ver) {
        if (ver.status === SkillVerificationStatus.CERTIFIED) actualScore = 100;
        else if (ver.status === SkillVerificationStatus.HUMAN_VERIFIED) actualScore = 90;
        else if (ver.status === SkillVerificationStatus.AI_VERIFIED) actualScore = 80;
        else if (ver.status === SkillVerificationStatus.DEMONSTRATED) actualScore = 70;
        else if (ver.status === SkillVerificationStatus.OBSERVED) actualScore = 50;
        else if (ver.status === SkillVerificationStatus.CLAIMED) actualScore = 30;

        totalConfidence += ver.confidence;
        confidenceCount++;
      }

      totalSkillWeightedScore += actualScore * req.weight;
      totalSkillWeight += req.weight;

      if (evidencedSkillIds.has(req.skillId)) {
        matchedSkillsWithEvidence++;
      }

      if (actualScore < req.minimumScore) {
        skillGaps.push({
          skillId: req.skillId,
          skillName: (req as any).skill?.name,
          minimumScore: req.minimumScore,
          actualScore,
          isCritical: req.isCritical,
        });
      }
    }

    const skillMatchPercentage =
      totalSkillWeight > 0
        ? Math.round((totalSkillWeightedScore / totalSkillWeight) * 10) / 10
        : 100;

    const evidenceMatchPercentage =
      requiredSkills.length > 0
        ? Math.round((matchedSkillsWithEvidence / requiredSkills.length) * 1000) / 10
        : 100;

    const confidenceScore =
      confidenceCount > 0 ? Math.round((totalConfidence / confidenceCount) * 10) / 10 : 60.0;

    // 2. Competency Match Percentage (placeholder calculation using 85% benchmark if evidenced)
    const competencyMatchPercentage = 85.0;

    // 3. Overall Match Score Formula
    const overallMatchScore =
      Math.round(
        (skillMatchPercentage * 0.5 +
          competencyMatchPercentage * 0.25 +
          evidenceMatchPercentage * 0.15 +
          confidenceScore * 0.1) *
          10,
      ) / 10;

    // 4. Growth potential calculation (inverse of gap count with baseline)
    const growthPotentialScore = Math.max(0, Math.min(100, 85 - skillGaps.length * 10));

    // 5. Recommendation decision rule
    let recommendation: RoleMatchResult["recommendation"] = "MISMATCH";
    const criticalGaps = skillGaps.filter((g) => g.isCritical);

    if (overallMatchScore >= 85 && criticalGaps.length === 0) {
      recommendation = "STRONG_MATCH";
    } else if (overallMatchScore >= 70 && criticalGaps.length === 0) {
      recommendation = "POTENTIAL_MATCH";
    } else if (overallMatchScore >= 55) {
      recommendation = "DEVELOPMENT_NEEDED";
    }

    return {
      roleProfileId,
      candidateId,
      overallMatchScore,
      skillMatchPercentage,
      competencyMatchPercentage,
      evidenceMatchPercentage,
      confidenceScore,
      skillGaps,
      growthPotentialScore,
      recommendation,
    };
  }

  async rankCandidatesForRole(
    roleProfileId: string,
    candidateIds: string[],
  ): Promise<Array<RoleMatchResult & { rank: number }>> {
    const results: RoleMatchResult[] = [];
    for (const cid of candidateIds) {
      const res = await this.matchCandidateToRole(roleProfileId, cid);
      results.push(res);
    }

    results.sort((a, b) => b.overallMatchScore - a.overallMatchScore);
    return results.map((res, index) => ({
      ...res,
      rank: index + 1,
    }));
  }
}
