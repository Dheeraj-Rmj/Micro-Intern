import { describe, it, expect, vi, beforeEach } from "vitest";

import { CalculateCompletionUseCase } from "@/modules/candidate/application/use-cases/calculate-completion.usecase.js";

describe("CalculateCompletionUseCase", () => {
  let useCase: CalculateCompletionUseCase;
  let mockDb: any;

  beforeEach(() => {
    mockDb = {
      candidateProfile: {
        findUnique: vi.fn(),
        update: vi.fn(),
      },
      user: {
        findUnique: vi.fn(),
      },
    };
    useCase = new CalculateCompletionUseCase(mockDb);
  });

  it("should return 0 if candidate profile is not found", async () => {
    mockDb.candidateProfile.findUnique.mockResolvedValue(null);
    const score = await useCase.execute("user-1");
    expect(score).toBe(0);
    expect(mockDb.candidateProfile.update).not.toHaveBeenCalled();
  });

  it("should compute full 100% completion when all criteria are satisfied", async () => {
    mockDb.candidateProfile.findUnique.mockResolvedValue({
      id: "profile-1",
      userId: "user-1",
      headline: "Software Engineer",
      bio: "Passionate developer",
      location: "San Francisco, CA",
      resumeUrl: "resumes/profile-1/resume_v1.pdf",
      completionPercentage: 0,
      skills: [
        { skill: "TypeScript", level: "EXPERT" },
        { skill: "Node.js", level: "EXPERT" },
        { skill: "React", level: "ADVANCED" },
      ],
      educations: [{ institution: "Stanford" }],
      experiences: [{ company: "Google" }],
      socials: [{ platform: "LINKEDIN", url: "https://linkedin.com/in/user" }],
      preferences: { employmentType: ["FULL_TIME"] },
    });
    mockDb.user.findUnique.mockResolvedValue({
      id: "user-1",
      avatarUrl: "https://cdn.example.com/avatar.webp",
    });
    mockDb.candidateProfile.update.mockResolvedValue({});

    const score = await useCase.execute("user-1");
    expect(score).toBe(100);
    expect(mockDb.candidateProfile.update).toHaveBeenCalledWith({
      where: { id: "profile-1" },
      data: { completionPercentage: 100 },
    });
  });

  it("should give partial credit for incomplete basic info and fewer than 3 skills", async () => {
    mockDb.candidateProfile.findUnique.mockResolvedValue({
      id: "profile-1",
      userId: "user-1",
      headline: "Software Engineer",
      bio: "", // Incomplete basic info -> +7.5 (half of 15)
      location: "",
      resumeUrl: "",
      completionPercentage: 10,
      skills: [{ skill: "TypeScript", level: "EXPERT" }], // < 3 skills -> +10 (half of 20)
      educations: [],
      experiences: [],
      socials: [],
      preferences: null,
    });
    mockDb.user.findUnique.mockResolvedValue({ id: "user-1", avatarUrl: null });
    mockDb.candidateProfile.update.mockResolvedValue({});

    const score = await useCase.execute("user-1");
    // Basic info half: 7.5 + Skills half: 10 = 17.5 -> round to 18
    expect(score).toBe(18);
    expect(mockDb.candidateProfile.update).toHaveBeenCalledWith({
      where: { id: "profile-1" },
      data: { completionPercentage: 18 },
    });
  });
});
