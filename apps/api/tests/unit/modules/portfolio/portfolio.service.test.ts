import { describe, it, expect, vi, beforeEach } from "vitest";
import { PortfolioService } from "@/modules/portfolio/application/PortfolioService.js";

describe("PortfolioService", () => {
  let service: PortfolioService;
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByCandidateId: vi.fn(),
      findByPublicSlug: vi.fn(),
      upsert: vi.fn(),
      update: vi.fn(),
      addProject: vi.fn(),
      addAchievement: vi.fn(),
      addTimelineEntry: vi.fn(),
      getTimeline: vi.fn(),
    };
    service = new PortfolioService(mockRepo);
  });

  it("should auto-create a portfolio if none exists on getPortfolioByCandidateId", async () => {
    mockRepo.findByCandidateId.mockResolvedValue(null);
    const createdPortfolio = {
      id: "port-1",
      candidateId: "cand-123456789",
      publicSlug: "candidate-cand-123",
    };
    mockRepo.upsert.mockResolvedValue(createdPortfolio);

    const result = await service.getPortfolioByCandidateId("cand-123456789");
    expect(result).toEqual(createdPortfolio);
    expect(mockRepo.upsert).toHaveBeenCalledWith({
      candidateId: "cand-123456789",
      publicSlug: "candidate-cand-123",
      isPublic: true,
    });
  });

  it("should add a project and record a timeline entry", async () => {
    const portfolio = { id: "port-1", candidateId: "cand-1" };
    mockRepo.findByCandidateId.mockResolvedValue(portfolio);
    const projectDTO = {
      title: "MicroIntern Core Engine",
      description: "AI-native competency platform",
    };
    mockRepo.addProject.mockResolvedValue({ id: "proj-1", ...projectDTO });

    const proj = await service.addProject("cand-1", projectDTO);
    expect(proj.id).toBe("proj-1");
    expect(mockRepo.addTimelineEntry).toHaveBeenCalledWith({
      portfolioId: "port-1",
      eventType: "PROJECT_ADDED",
      title: "Added project: MicroIntern Core Engine",
      description: "AI-native competency platform",
    });
  });
});
