import type {
  ISkillRepository,
  CreateSkillDTO,
  CreateSkillRelationshipDTO,
} from '../domain/ISkillRepository.js';
import type { Skill, SkillCategory, SubSkill, SkillRelationship } from '@microintern/database';

export class SkillFrameworkService {
  constructor(private readonly skillRepo: ISkillRepository) {}

  async createSkill(data: CreateSkillDTO): Promise<Skill> {
    const existing = await this.skillRepo.findByName(data.name);
    if (existing) {
      return existing;
    }
    return this.skillRepo.create(data);
  }

  async getSkill(id: string): Promise<Skill> {
    const skill = await this.skillRepo.findById(id);
    if (!skill) {
      throw new Error(`Skill not found: ${id}`);
    }
    return skill;
  }

  async listSkills(options?: { categoryId?: string; minDifficulty?: number }): Promise<Skill[]> {
    return this.skillRepo.findAll(options);
  }

  async createCategory(name: string, description?: string): Promise<SkillCategory> {
    return this.skillRepo.createCategory(name, description);
  }

  async listCategories(): Promise<SkillCategory[]> {
    return this.skillRepo.listCategories();
  }

  async addSubSkill(skillId: string, name: string, difficulty?: number, description?: string): Promise<SubSkill> {
    return this.skillRepo.createSubSkill(skillId, name, difficulty, description);
  }

  async linkSkills(data: CreateSkillRelationshipDTO): Promise<SkillRelationship> {
    return this.skillRepo.createRelationship(data);
  }

  async getSkillGraph(skillId: string) {
    return this.skillRepo.getSkillGraph(skillId);
  }
}
