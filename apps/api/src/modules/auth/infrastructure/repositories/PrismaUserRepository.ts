import { AUTH } from '@microintern/shared';

import { User } from '../../domain/entities/User.entity.js';

import type { IUserRepository } from '../../domain/repositories/IUserRepository.js';
import type { PrismaClient, OAuthProvider } from '@microintern/database';

/**
 * Prisma User Repository — infrastructure implementation.
 *
 * Converts between Prisma models and domain entities.
 * All DB queries live here — zero DB code in domain/application layers.
 */
export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient) {}

  // ── Lookup ────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    const user = await this.db.user.findFirst({
      where: { id, deletedAt: null },
      include: { companyMembership: { where: { deletedAt: null }, take: 1 } },
    });
    return user !== null ? User.fromPrisma(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.db.user.findFirst({
      where: { email: email.toLowerCase(), deletedAt: null },
      include: { companyMembership: { where: { deletedAt: null }, take: 1 } },
    });
    return user !== null ? User.fromPrisma(user) : null;
  }

  async findByOAuthAccount(provider: string, providerAccountId: string): Promise<User | null> {
    const account = await this.db.oAuthAccount.findFirst({
      where: { provider: provider as OAuthProvider, providerAccountId },
      include: {
        user: {
          include: { companyMembership: { where: { deletedAt: null }, take: 1 } },
        },
      },
    });
    if (!account?.user || account.user.deletedAt) return null;
    return User.fromPrisma(account.user);
  }

  // ── Candidate Creation ────────────────────────────────────────────────────

  async createOAuthCandidate(data: {
    email: string;
    firstName: string;
    lastName: string;
    provider: string;
    providerAccountId: string;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<User> {
    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'CANDIDATE',
          status: 'ACTIVE',
          emailVerifiedAt: new Date(), // OAuth emails are considered verified
          candidateProfile: {
            create: {
              isPublic: false,
              isOpenToWork: true,
            },
          },
          oauthAccounts: {
            create: {
              provider: data.provider as OAuthProvider,
              providerAccountId: data.providerAccountId,
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
            },
          },
        },
        include: { companyMembership: false },
      });
      return created;
    });

    return User.fromPrisma({ ...user, companyMembership: [] });
  }

  async linkOAuthAccount(userId: string, data: {
    provider: string;
    providerAccountId: string;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<void> {
    await this.db.oAuthAccount.create({
      data: {
        userId,
        provider: data.provider as OAuthProvider,
        providerAccountId: data.providerAccountId,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      },
    });
  }

  async createCandidate(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'CANDIDATE',
          status: 'PENDING_VERIFICATION',
          candidateProfile: {
            create: {
              isPublic: false,
              isOpenToWork: true,
            },
          },
        },
        include: { companyMembership: false },
      });
      return created;
    });

    return User.fromPrisma({ ...user, companyMembership: [] });
  }

  // ── Management User Creation ──────────────────────────────────────────────

  async createCompanyOwner(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    companyName: string;
    companyWebsite?: string;
  }): Promise<User> {
    const user = await this.db.$transaction(async (tx) => {
      const slug = data.companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const company = await tx.company.create({
        data: {
          name: data.companyName,
          slug,
          websiteUrl: data.companyWebsite,
          status: 'PENDING_VERIFICATION',
        },
      });

      const created = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: 'COMPANY_OWNER',
          status: 'PENDING_VERIFICATION',
          companyMembership: {
            create: {
              companyId: company.id,
              role: 'COMPANY_OWNER',
              joinedAt: new Date(),
            },
          },
        },
        include: { companyMembership: { take: 1 } },
      });

      return created;
    });

    return User.fromPrisma(user);
  }

  async createUserFromInvitation(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId?: string;
    invitedById: string;
  }): Promise<User> {
    const user = await this.db.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role as any,
          status: 'ACTIVE',
          emailVerifiedAt: new Date(), // Invitation implies email is valid
          ...(data.companyId !== undefined && {
            companyMembership: {
              create: {
                companyId: data.companyId,
                role: data.role as any,
                invitedBy: data.invitedById,
                joinedAt: new Date(),
              },
            },
          }),
        },
        include: { companyMembership: { take: 1 } },
      });
      return created;
    });

    return User.fromPrisma(user);
  }

  // ── Login Security ────────────────────────────────────────────────────────

  async incrementLoginAttempts(userId: string): Promise<void> {
    const user = await this.db.user.findUnique({ where: { id: userId } });
    if (user === null) return;

    const newAttempts = user.loginAttempts + 1;
    const shouldLock = newAttempts >= AUTH.MAX_LOGIN_ATTEMPTS;

    await this.db.user.update({
      where: { id: userId },
      data: {
        loginAttempts: newAttempts,
        ...(shouldLock && {
          lockedUntil: new Date(Date.now() + AUTH.LOCKOUT_DURATION_MINUTES * 60 * 1000),
        }),
      },
    });
  }

  async resetLoginAttempts(userId: string): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: { loginAttempts: 0, lockedUntil: null },
    });
  }

  async lockAccount(userId: string, until: Date): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: { lockedUntil: until },
    });
  }

  async updateLastLogin(userId: string, ipAddress: string): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date(), lastLoginIp: ipAddress },
    });
  }

  async updateStatus(userId: string, status: string): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: { status: status as any },
    });
  }

  // ── Profile Updates ───────────────────────────────────────────────────────

  async setEmailVerified(userId: string): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: { emailVerifiedAt: new Date(), status: 'ACTIVE' },
    });
  }

  async setPasswordHash(userId: string, passwordHash: string): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  }

  async updateAvatar(userId: string, avatarUrl: string): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: { avatarUrl },
    });
  }

  async updateMfaSettings(userId: string, mfaEnabled: boolean, totpSecret?: string | null): Promise<void> {
    await this.db.user.update({
      where: { id: userId },
      data: {
        mfaEnabled,
        ...(totpSecret !== undefined && { totpSecret }),
      },
    });
  }

  // ── Verification Tokens ───────────────────────────────────────────────────

  async createVerificationToken(data: {
    userId: string;
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    // Invalidate any previous tokens of the same type before creating a new one
    await this.db.verificationToken.updateMany({
      where: { userId: data.userId, type: data.type, usedAt: null },
      data: { usedAt: new Date() },
    });

    await this.db.verificationToken.create({
      data: {
        userId: data.userId,
        type: data.type,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
    });
  }

  async findVerificationToken(data: {
    tokenHash: string;
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
  }): Promise<{ id: string; userId: string; expiresAt: Date; usedAt: Date | null } | null> {
    return await this.db.verificationToken.findFirst({
      where: {
        tokenHash: data.tokenHash,
        type: data.type,
        usedAt: null,
      },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });
  }

  async markVerificationTokenUsed(tokenId: string): Promise<void> {
    await this.db.verificationToken.update({
      where: { id: tokenId },
      data: { usedAt: new Date() },
    });
  }

  async invalidateVerificationTokens(data: {
    userId: string;
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
  }): Promise<void> {
    await this.db.verificationToken.updateMany({
      where: { userId: data.userId, type: data.type, usedAt: null },
      data: { usedAt: new Date() },
    });
  }

  // ── Invitations ───────────────────────────────────────────────────────────

  async createInvitation(data: {
    email: string;
    role: string;
    companyId?: string;
    invitedById: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<{ id: string }> {
    return await this.db.invitation.create({
      data: {
        email: data.email.toLowerCase(),
        role: data.role as any,
        companyId: data.companyId,
        invitedById: data.invitedById,
        tokenHash: data.tokenHash,
        expiresAt: data.expiresAt,
      },
      select: { id: true },
    });
  }

  async findInvitationByTokenHash(tokenHash: string): Promise<{
    id: string;
    email: string;
    role: string;
    companyId: string | null;
    invitedById: string;
    expiresAt: Date;
    acceptedAt: Date | null;
  } | null> {
    return await this.db.invitation.findFirst({
      where: { tokenHash, acceptedAt: null },
      select: {
        id: true,
        email: true,
        role: true,
        companyId: true,
        invitedById: true,
        expiresAt: true,
        acceptedAt: true,
      },
    });
  }

  async markInvitationAccepted(invitationId: string): Promise<void> {
    await this.db.invitation.update({
      where: { id: invitationId },
      data: { acceptedAt: new Date() },
    });
  }
}
