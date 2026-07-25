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
    // Transaction: create user + candidate profile atomically
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

  async createCompanyOwner(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    companyName: string;
    companyWebsite?: string;
  }): Promise<User> {
    const user = await this.db.$transaction(async (tx) => {
      // Create company
      const slug = data.companyName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      const company = await tx.company.create({
        data: {
          name: data.companyName,
          slug,
          websiteUrl: data.companyWebsite,
          status: 'PENDING_VERIFICATION',
        },
      });

      // Create user
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
}
