import type {
  IRoleProfileRepository,
  CreateRoleProfileDTO,
  AddRequiredSkillDTO,
  AddRequiredCompetencyDTO,
  AddHiringBenchmarkDTO,
} from "../domain/IRoleProfileRepository.js";
import type {
  RoleProfile,
  RequiredSkill,
  RequiredCompetency,
  HiringBenchmark,
} from "@microintern/database";

export class RoleProfileService {
  constructor(private readonly roleProfileRepo: IRoleProfileRepository) {}

  async createRoleProfile(data: CreateRoleProfileDTO): Promise<RoleProfile> {
    return this.roleProfileRepo.create(data);
  }

  async getRoleProfile(id: string): Promise<RoleProfile> {
    const profile = await this.roleProfileRepo.findById(id);
    if (!profile) {
      throw new Error(`Role profile not found: ${id}`);
    }
    return profile;
  }

  async listCompanyRoleProfiles(companyId: string): Promise<RoleProfile[]> {
    return this.roleProfileRepo.listByCompany(companyId);
  }

  async addRequiredSkill(data: AddRequiredSkillDTO): Promise<RequiredSkill> {
    return this.roleProfileRepo.addRequiredSkill(data);
  }

  async addRequiredCompetency(data: AddRequiredCompetencyDTO): Promise<RequiredCompetency> {
    return this.roleProfileRepo.addRequiredCompetency(data);
  }

  async addBenchmark(data: AddHiringBenchmarkDTO): Promise<HiringBenchmark> {
    return this.roleProfileRepo.addBenchmark(data);
  }

  async evaluateCandidateAgainstProfile(
    roleProfileId: string,
    candidateSkillScores: Record<string, number>,
    candidateCompetencyScores: Record<string, number>,
  ): Promise<{
    roleProfileId: string;
    overallMatchPercentage: number;
    passedMinimumThreshold: boolean;
    skillGaps: Array<{ skillId: string; required: number; actual: number }>;
    competencyGaps: Array<{ competencyId: string; required: number; actual: number }>;
  }> {
    const profile = await this.getRoleProfile(roleProfileId);
    const requiredSkills = await this.roleProfileRepo.getRequiredSkills(roleProfileId);
    const requiredCompetencies = await this.roleProfileRepo.getRequiredCompetencies(roleProfileId);

    const skillGaps: Array<{ skillId: string; required: number; actual: number }> = [];
    let totalSkillWeightedScore = 0;
    let totalSkillWeight = 0;

    for (const req of requiredSkills) {
      const actual = candidateSkillScores[req.skillId] ?? 0;
      totalSkillWeightedScore += actual * req.weight;
      totalSkillWeight += req.weight;
      if (actual < req.minimumScore) {
        skillGaps.push({ skillId: req.skillId, required: req.minimumScore, actual });
      }
    }

    const competencyGaps: Array<{ competencyId: string; required: number; actual: number }> = [];
    let totalCompWeightedScore = 0;
    let totalCompWeight = 0;

    for (const req of requiredCompetencies) {
      const actual = candidateCompetencyScores[req.competencyId] ?? 0;
      totalCompWeightedScore += actual * req.weight;
      totalCompWeight += req.weight;
      if (actual < req.minimumScore) {
        competencyGaps.push({ competencyId: req.competencyId, required: req.minimumScore, actual });
      }
    }

    const avgSkill = totalSkillWeight > 0 ? totalSkillWeightedScore / totalSkillWeight : 100;
    const avgComp = totalCompWeight > 0 ? totalCompWeightedScore / totalCompWeight : 100;
    const overallMatchPercentage = Math.round((avgSkill * 0.6 + avgComp * 0.4) * 10) / 10;
    const passedMinimumThreshold =
      overallMatchPercentage >= profile.minimumOverallScore && skillGaps.length === 0;

    return {
      roleProfileId,
      overallMatchPercentage,
      passedMinimumThreshold,
      skillGaps,
      competencyGaps,
    };
  }
}
