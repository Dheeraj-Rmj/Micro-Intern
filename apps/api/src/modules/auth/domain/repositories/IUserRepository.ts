import type { User } from '../entities/User.entity.js';

/**
 * User Repository Interface — domain layer contract.
 *
 * The domain layer defines what data operations it needs.
 * Infrastructure provides the implementation (Prisma, in-memory, etc.).
 * This inversion makes domain logic testable without a database.
 */
export interface IUserRepository {
  // ── Lookup ────────────────────────────────────────────────────────────────
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByOAuthAccount(provider: string, providerAccountId: string): Promise<User | null>;

  // ── Candidate Creation ────────────────────────────────────────────────────
  createCandidate(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
  }): Promise<User>;

  createOAuthCandidate(data: {
    email: string;
    firstName: string;
    lastName: string;
    provider: string;
    providerAccountId: string;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<User>;

  linkOAuthAccount(userId: string, data: {
    provider: string;
    providerAccountId: string;
    accessToken?: string;
    refreshToken?: string;
  }): Promise<void>;

  // ── Management User Creation ──────────────────────────────────────────────
  createCompanyOwner(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    companyName: string;
    companyWebsite?: string;
  }): Promise<User>;

  createUserFromInvitation(data: {
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: string;
    companyId?: string;
    invitedById: string;
  }): Promise<User>;

  // ── Login Security ────────────────────────────────────────────────────────
  incrementLoginAttempts(userId: string): Promise<void>;
  resetLoginAttempts(userId: string): Promise<void>;
  lockAccount(userId: string, until: Date): Promise<void>;
  updateLastLogin(userId: string, ipAddress: string): Promise<void>;
  updateStatus(userId: string, status: string): Promise<void>;

  // ── Profile Updates ───────────────────────────────────────────────────────
  setEmailVerified(userId: string): Promise<void>;
  setPasswordHash(userId: string, passwordHash: string): Promise<void>;
  updateAvatar(userId: string, avatarUrl: string): Promise<void>;

  // ── Verification Tokens ───────────────────────────────────────────────────
  createVerificationToken(data: {
    userId: string;
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void>;

  findVerificationToken(data: {
    tokenHash: string;
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
  }): Promise<{ id: string; userId: string; expiresAt: Date; usedAt: Date | null } | null>;

  markVerificationTokenUsed(tokenId: string): Promise<void>;

  invalidateVerificationTokens(data: {
    userId: string;
    type: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET';
  }): Promise<void>;

  // ── Invitations ───────────────────────────────────────────────────────────
  createInvitation(data: {
    email: string;
    role: string;
    companyId?: string;
    invitedById: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<{ id: string }>;

  findInvitationByTokenHash(tokenHash: string): Promise<{
    id: string;
    email: string;
    role: string;
    companyId: string | null;
    invitedById: string;
    expiresAt: Date;
    acceptedAt: Date | null;
  } | null>;

  markInvitationAccepted(invitationId: string): Promise<void>;
}
