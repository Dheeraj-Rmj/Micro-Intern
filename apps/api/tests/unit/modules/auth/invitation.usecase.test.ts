import { describe, it, expect, vi, beforeEach } from "vitest";

import { Role } from "@microintern/shared";
import {
  InviteRecruiterUseCase,
  AcceptInvitationUseCase,
} from "@/modules/auth/application/use-cases/invitation.usecase.js";
import { TokenService } from "@/modules/auth/infrastructure/services/TokenService.js";

describe("InvitationUseCases", () => {
  let inviteUseCase: InviteRecruiterUseCase;
  let acceptUseCase: AcceptInvitationUseCase;
  let mockUserRepo: any;
  let mockEmailService: any;
  let mockPasswordService: any;
  let mockJwtService: any;
  let mockSessionService: any;
  let tokenService: TokenService;

  beforeEach(() => {
    mockUserRepo = {
      findByEmail: vi.fn(),
      createInvitation: vi.fn(),
      findInvitationByTokenHash: vi.fn(),
      createUserFromInvitation: vi.fn(),
      markInvitationAccepted: vi.fn(),
    };

    mockEmailService = {
      sendInvitationEmail: vi.fn(),
    };

    mockPasswordService = {
      hash: vi.fn(),
    };

    mockJwtService = {
      generateTokenPair: vi.fn(),
    };

    mockSessionService = {
      createSession: vi.fn(),
    };

    tokenService = new TokenService();

    inviteUseCase = new InviteRecruiterUseCase(mockUserRepo, mockEmailService, tokenService);

    acceptUseCase = new AcceptInvitationUseCase(
      mockUserRepo,
      mockPasswordService,
      mockJwtService,
      mockSessionService,
      tokenService,
    );
  });

  describe("InviteRecruiterUseCase", () => {
    it("should create an invitation record and enqueue invitation email", async () => {
      mockUserRepo.findByEmail.mockResolvedValue(null);
      mockUserRepo.createInvitation.mockResolvedValue({ id: "inv-123" });

      const result = await inviteUseCase.execute({
        email: "recruiter@company.com",
        companyId: "comp-1",
        companyName: "Acme Corp",
        invitedById: "owner-1",
      });

      expect(result.invitationId).toBe("inv-123");
      expect(mockUserRepo.createInvitation).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "recruiter@company.com",
          role: Role.RECRUITER,
          companyId: "comp-1",
        }),
      );
      expect(mockEmailService.sendInvitationEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "recruiter@company.com",
          role: Role.RECRUITER,
          companyName: "Acme Corp",
        }),
      );
    });

    it("should throw ConflictError if user already exists", async () => {
      mockUserRepo.findByEmail.mockResolvedValue({ id: "existing-user" });

      await expect(
        inviteUseCase.execute({
          email: "recruiter@company.com",
          companyId: "comp-1",
          companyName: "Acme Corp",
          invitedById: "owner-1",
        }),
      ).rejects.toThrowError("A user with this email address already exists");
    });
  });

  describe("AcceptInvitationUseCase", () => {
    it("should accept invitation, create user, and return auth tokens", async () => {
      mockUserRepo.findInvitationByTokenHash.mockResolvedValue({
        id: "inv-123",
        email: "recruiter@company.com",
        role: Role.RECRUITER,
        companyId: "comp-1",
        invitedById: "owner-1",
        expiresAt: new Date(Date.now() + 10000),
        acceptedAt: null,
      });

      mockPasswordService.hash.mockResolvedValue("hashed-pass");
      mockUserRepo.createUserFromInvitation.mockResolvedValue({
        id: "new-recruiter-1",
        email: "recruiter@company.com",
        role: Role.RECRUITER,
        companyId: "comp-1",
      });
      mockSessionService.createSession.mockResolvedValue("sess-1");
      mockJwtService.generateTokenPair.mockResolvedValue({
        accessToken: "access-token",
        refreshToken: "refresh-token",
        expiresIn: 900,
      });

      const result = await acceptUseCase.execute({
        token: "plain-token",
        password: "NewSecurePassword123!",
        firstName: "Alex",
        lastName: "Recruiter",
      });

      expect(result.user.id).toBe("new-recruiter-1");
      expect(result.user.role).toBe(Role.RECRUITER);
      expect(mockUserRepo.markInvitationAccepted).toHaveBeenCalledWith("inv-123");
    });

    it("should throw error if invitation has already been accepted", async () => {
      mockUserRepo.findInvitationByTokenHash.mockResolvedValue({
        id: "inv-123",
        email: "recruiter@company.com",
        role: Role.RECRUITER,
        companyId: "comp-1",
        expiresAt: new Date(Date.now() + 10000),
        acceptedAt: new Date(),
      });

      await expect(
        acceptUseCase.execute({
          token: "plain-token",
          password: "NewSecurePassword123!",
          firstName: "Alex",
          lastName: "Recruiter",
        }),
      ).rejects.toThrowError("This invitation has already been accepted");
    });
  });
});
