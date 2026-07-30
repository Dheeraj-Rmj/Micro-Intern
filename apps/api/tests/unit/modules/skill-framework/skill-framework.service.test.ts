import { describe, it, expect, vi, beforeEach } from "vitest";
import { SkillFrameworkService } from "@/modules/skill-framework/application/SkillFrameworkService.js";

describe("SkillFrameworkService", () => {
  let service: SkillFrameworkService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findById: vi.fn(),
      findByName: vi.fn(),
      findAll: vi.fn(),
      create: vi.fn(),
      listCategories: vi.fn(),
    };
    service = new SkillFrameworkService(mockRepo);
  });

  it("should list all skills in the framework taxonomy", async () => {
    const mockSkills = [
      { id: "sk-1", name: "TypeScript", difficulty: 3 },
      { id: "sk-2", name: "Prisma", difficulty: 4 },
    ];
    mockRepo.findAll.mockResolvedValue(mockSkills);

    const result = await service.listSkills();
    expect(result).toEqual(mockSkills);
    expect(mockRepo.findAll).toHaveBeenCalledWith(undefined);
  });

  it("should create a new skill when slug is unique", async () => {
    const newSkillDTO = {
      name: "System Design",
      slug: "system-design",
      difficulty: 4,
    };
    mockRepo.findByName.mockResolvedValue(null);
    mockRepo.create.mockResolvedValue({ id: "sk-3", ...newSkillDTO });

    const created = await service.createSkill(newSkillDTO);
    expect(created.id).toBe("sk-3");
    expect(mockRepo.create).toHaveBeenCalledWith(newSkillDTO);
  });

  it("should return existing skill if it already exists instead of throwing", async () => {
    const existingSkill = { id: "sk-existing", slug: "typescript", name: "TypeScript" };
    mockRepo.findByName.mockResolvedValue(existingSkill);
    const result = await service.createSkill({
      name: "TypeScript",
      categoryId: "cat-1",
      difficulty: 3,
    });
    expect(result).toEqual(existingSkill);
  });
});
