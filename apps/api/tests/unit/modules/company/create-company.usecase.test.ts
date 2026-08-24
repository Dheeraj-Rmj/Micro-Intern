import { describe, it, expect, vi, beforeEach } from "vitest";

import { CreateCompanyUseCase } from "@/modules/company/application/use-cases/create-company.usecase.js";
import { CompanyAlreadyExistsError } from "@/modules/company/domain/errors/company.errors.js";
import { eventBus, DOMAIN_EVENTS } from "@/shared/events/EventBus.js";

describe("CreateCompanyUseCase", () => {
  let useCase: CreateCompanyUseCase;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByUserId: vi.fn(),
      findBySlug: vi.fn(),
      create: vi.fn(),
    };
    useCase = new CreateCompanyUseCase(mockRepo);
    vi.spyOn(eventBus, "emit").mockImplementation(async () => true as any);
  });

  it("should throw CompanyAlreadyExistsError if requesting user already belongs to a company", async () => {
    mockRepo.findByUserId.mockResolvedValue({ id: "comp-existing" });
    await expect(useCase.execute("user-1", { name: "New Company" } as any)).rejects.toThrow(
      CompanyAlreadyExistsError,
    );
    expect(mockRepo.create).not.toHaveBeenCalled();
  });

  it("should generate URL slug, create company, assign user as OWNER, and emit COMPANY_CREATED event", async () => {
    mockRepo.findByUserId.mockResolvedValue(null);
    mockRepo.findBySlug.mockResolvedValue(null); // Slug is available
    mockRepo.create.mockResolvedValue({
      id: "comp-100",
      name: "MicroIntern AI",
      slug: "microintern-ai",
    });

    const result = await useCase.execute("user-1", { name: "  MicroIntern AI  " });
    expect(result.id).toBe("comp-100");
    expect(mockRepo.findBySlug).toHaveBeenCalledWith("microintern-ai");
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "  MicroIntern AI  " }),
      "microintern-ai",
      "user-1",
    );
    expect(eventBus.emit).toHaveBeenCalledWith(DOMAIN_EVENTS.COMPANY_CREATED, {
      companyId: "comp-100",
      ownerUserId: "user-1",
      name: "MicroIntern AI",
      slug: "microintern-ai",
    });
  });

  it("should append four-digit random disambiguator suffix if calculated slug already exists in repository", async () => {
    mockRepo.findByUserId.mockResolvedValue(null);
    mockRepo.findBySlug.mockResolvedValue({ id: "comp-collision" }); // Slug collision!
    mockRepo.create.mockResolvedValue({
      id: "comp-101",
      name: "Acme Corp",
      slug: "acme-corp-4829",
    });

    await useCase.execute("user-2", { name: "Acme Corp" });
    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.any(Object),
      expect.stringMatching(/^acme-corp-\d{4}$/),
      "user-2",
    );
  });
});
