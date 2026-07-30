import { AUTH, Role } from "@microintern/shared";

import { createModuleLogger } from "@/core/logger.js";
import { TokenService } from "@/modules/auth/infrastructure/services/TokenService.js";
import { ConflictError, NotFoundError } from "@/shared/errors/index.js";
import { AuthDomainError } from "@/shared/errors/DomainError.js";

import type { IEmailAuthService } from "../interfaces/IEmailAuthService.js";
import type { IJwtService } from "../interfaces/IJwtService.js";
import type { IPasswordService, ISessionService } from "../interfaces/IPasswordService.js";
import type { IUserRepository } from "../../domain/repositories/IUserRepository.js";

const log = createModuleLogger("InvitationUseCases");

export class InviteRecruiterUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailAuthService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(data: {
    email: string;
    companyId: string;
    companyName: string;
    invitedById: string;
  }): Promise<{ invitationId: string }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser !== null) {
      throw new ConflictError("A user with this email address already exists");
    }

    const plainToken = this.tokenService.generateSecureToken();
    const tokenHash = this.tokenService.hashToken(plainToken);
    const expiresAt = new Date(Date.now() + AUTH.INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const invite = await this.userRepository.createInvitation({
      email: data.email,
      role: Role.RECRUITER,
      companyId: data.companyId,
      invitedById: data.invitedById,
      tokenHash,
      expiresAt,
    });

    await this.emailService.sendInvitationEmail({
      email: data.email,
      role: Role.RECRUITER,
      companyName: data.companyName,
      invitationToken: plainToken,
    });

    log.info(
      { email: data.email, companyId: data.companyId, invitedById: data.invitedById },
      "Recruiter invitation sent",
    );

    return { invitationId: invite.id };
  }
}

export class InviteAdminUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly emailService: IEmailAuthService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(data: { email: string; invitedById: string }): Promise<{ invitationId: string }> {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser !== null) {
      throw new ConflictError("A user with this email address already exists");
    }

    const plainToken = this.tokenService.generateSecureToken();
    const tokenHash = this.tokenService.hashToken(plainToken);
    const expiresAt = new Date(Date.now() + AUTH.INVITATION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    const invite = await this.userRepository.createInvitation({
      email: data.email,
      role: Role.ADMIN,
      invitedById: data.invitedById,
      tokenHash,
      expiresAt,
    });

    await this.emailService.sendInvitationEmail({
      email: data.email,
      role: Role.ADMIN,
      invitationToken: plainToken,
    });

    log.info({ email: data.email, invitedById: data.invitedById }, "Admin invitation sent");

    return { invitationId: invite.id };
  }
}

export class AcceptInvitationUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly jwtService: IJwtService,
    private readonly sessionService: ISessionService,
    private readonly tokenService: TokenService,
  ) {}

  async execute(data: { token: string; password: string; firstName: string; lastName: string }) {
    const tokenHash = this.tokenService.hashToken(data.token);

    const invitation = await this.userRepository.findInvitationByTokenHash(tokenHash);
    if (invitation === null) {
      throw new NotFoundError("Invitation");
    }

    if (invitation.acceptedAt !== null) {
      throw new AuthDomainError("AUTH_TOKEN_INVALID", "This invitation has already been accepted");
    }

    if (invitation.expiresAt < new Date()) {
      throw new AuthDomainError("AUTH_TOKEN_EXPIRED", "This invitation has expired");
    }

    const passwordHash = await this.passwordService.hash(data.password);

    const user = await this.userRepository.createUserFromInvitation({
      email: invitation.email,
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      role: invitation.role,
      ...(invitation.companyId !== null && { companyId: invitation.companyId }),
      invitedById: invitation.invitedById,
    });

    await this.userRepository.markInvitationAccepted(invitation.id);

    // Create session and return tokens for instant login upon acceptance
    const sessionId = await this.sessionService.createSession(user.id);
    const tokens = await this.jwtService.generateTokenPair(user, sessionId);

    log.info({ userId: user.id, role: user.role }, "Invitation accepted and account created");

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        companyId: user.companyId,
        emailVerifiedAt: user.emailVerifiedAt,
        avatarUrl: user.avatarUrl,
      },
      tokens,
    };
  }
}
