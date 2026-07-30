import type { Skill, SkillCategory, SubSkill, SkillRelationship, SkillRelationshipType } from '@microintern/database';

export interface CreateSkillDTO {
  name: string;
  categoryId?: string;
  description?: string;
  difficulty?: number;
  weight?: number;
}

export interface CreateSkillRelationshipDTO {
  sourceSkillId: string;
  targetSkillId: string;
  relationshipType: SkillRelationshipType;
  strength?: number;
}

export interface ISkillRepository {
  findById(id: string): Promise<Skill | null>;
  findByName(name: string): Promise<Skill | null>;
  findAll(options?: { categoryId?: string; minDifficulty?: number }): Promise<Skill[]>;
  create(data: CreateSkillDTO): Promise<Skill>;
  update(id: string, data: Partial<CreateSkillDTO>): Promise<Skill>;
  delete(id: string): Promise<void>;
  
  // Categories & SubSkills
  createCategory(name: string, description?: string): Promise<SkillCategory>;
  listCategories(): Promise<SkillCategory[]>;
  createSubSkill(skillId: string, name: string, difficulty?: number, description?: string): Promise<SubSkill>;
  listSubSkills(skillId: string): Promise<SubSkill[]>;
  
  // Graph relationships
  createRelationship(data: CreateSkillRelationshipDTO): Promise<SkillRelationship>;
  getSkillGraph(skillId: string): Promise<{
    skill: Skill;
    prerequisites: Skill[];
    relatedSkills: Skill[];
    coOccurringSkills: Skill[];
  }>;
}
