import type { RoleProfile, RequiredSkill, RequiredCompetency, HiringBenchmark } from '@microintern/database';

export interface CreateRoleProfileDTO {
  companyId: string;
  title: string;
  level?: string;
  description?: string;
  minimumOverallScore?: number;
}

export interface AddRequiredSkillDTO {
  roleProfileId: string;
  skillId: string;
  minimumScore?: number;
  weight?: number;
  isCritical?: boolean;
}

export interface AddRequiredCompetencyDTO {
  roleProfileId: string;
  competencyId: string;
  minimumScore?: number;
  weight?: number;
}

export interface AddHiringBenchmarkDTO {
  roleProfileId: string;
  metricName: string;
  targetValue: number;
  description?: string;
}

export interface IRoleProfileRepository {
  findById(id: string): Promise<RoleProfile | null>;
  listByCompany(companyId: string): Promise<RoleProfile[]>;
  create(data: CreateRoleProfileDTO): Promise<RoleProfile>;
  update(id: string, data: Partial<CreateRoleProfileDTO>): Promise<RoleProfile>;
  delete(id: string): Promise<void>;

  // Required Skills & Competencies
  addRequiredSkill(data: AddRequiredSkillDTO): Promise<RequiredSkill>;
  getRequiredSkills(roleProfileId: string): Promise<RequiredSkill[]>;
  addRequiredCompetency(data: AddRequiredCompetencyDTO): Promise<RequiredCompetency>;
  getRequiredCompetencies(roleProfileId: string): Promise<RequiredCompetency[]>;

  // Benchmarks
  addBenchmark(data: AddHiringBenchmarkDTO): Promise<HiringBenchmark>;
  getBenchmarks(roleProfileId: string): Promise<HiringBenchmark[]>;
}
