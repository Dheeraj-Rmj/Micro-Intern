import { describe, it, expect, vi, beforeEach } from "vitest";

import { Role } from "@microintern/shared";
import { ManagementLoginUseCase } from "@/modules/auth/application/use-cases/management-auth.usecase.js";

describe("ManagementLoginUseCase", () => {
  let useCase: ManagementLoginUseCase;
  let mockUserRepo: any;
  let mockPasswordService: any;
  let mockJwtService: any;
  let mockSessionService: any;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      incrementLoginAttempts: vi.fn(),
      resetLoginAttempts: vi.fn(),
      updateLastLogin: vi.fn(),
    };

    mockPasswordService = {
      verify: vi.fn(),
    };

    mockJwtService = {
      generateTokenPair: vi.fn(),
    };

    mockSessionService = {
      createSession: vi.fn(),
    };

    useCase = new ManagementLoginUseCase(
      mockUserRepo,
      mockPasswordService,
      mockJwtService,
      mockSessionService,
    );
  });

  it("should successfully log in a COMPANY_OWNER and return tokens", async () => {
    const mockUser = {
      id: "owner-1",
      email: "owner@company.com",
      passwordHash: "hashed-password",
      role: Role.COMPANY_OWNER,
      companyId: "comp-1",
      isLocked: () => false,
    };

    mockUserRepo.findByEmail.mockResolvedValue(mockUser);
    mockPasswordService.verify.mockResolvedValue(true);
    mockSessionService.createSession.mockResolvedValue("session-123");
    mockJwtService.generateTokenPair.mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      expiresIn: 900,
    });

    const result = await useCase.execute(
      { email: "owner@company.com", password: "SecretPassword123!" },
      "127.0.0.1",
    );

    expect(result.user.id).toBe("owner-1");
    expect(result.user.role).toBe(Role.COMPANY_OWNER);
    expect(result.tokens.accessToken).toBe("access-token");
    expect(mockUserRepo.resetLoginAttempts).toHaveBeenCalledWith("owner-1");
  });

  it("should throw ForbiddenError when a CANDIDATE attempts login on management portal", async () => {
    const mockUser = {
      id: "cand-1",
      email: "candidate@example.com",
      passwordHash: "hashed-password",
      role: Role.CANDIDATE,
      isLocked: () => false,
    };

    mockUserRepo.findByEmail.mockResolvedValue(mockUser);

    await expect(
      useCase.execute({ email: "candidate@example.com", password: "Password123!" }, "127.0.0.1"),
    ).rejects.toThrowError("Candidate login is not permitted on the Management Portal");
  });

  it("should throw AuthDomainError when account is locked", async () => {
    const mockUser = {
      id: "admin-1",
      email: "admin@company.com",
      passwordHash: "hashed-password",
      role: Role.ADMIN,
      isLocked: () => true,
    };

    mockUserRepo.findByEmail.mockResolvedValue(mockUser);

    await expect(
      useCase.execute({ email: "admin@company.com", password: "Password123!" }, "127.0.0.1"),
    ).rejects.toThrowError("Account is temporarily locked");
  });
});
