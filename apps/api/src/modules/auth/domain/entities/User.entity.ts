import { AUTH } from "@microintern/shared";

/**
 * User Domain Entity.
 *
 * Design: The entity encapsulates business rules about a user.
 * It is a pure TypeScript class — no ORM decorators, no HTTP context.
 * Infrastructure (Prisma) maps DB rows to this entity via the repository.
 *
 * Domain entities contain:
 * - Business invariants (validation of state changes)
 * - Domain behavior (methods that change state while maintaining invariants)
 * - Domain events (signals that something meaningful happened)
 *
 * Domain entities do NOT contain:
 * - Database queries
 * - HTTP logic
 * - External service calls
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: string,
    public readonly status: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly passwordHash: string | null,
    public readonly emailVerifiedAt: Date | null,
    public readonly avatarUrl: string | null,
    public readonly lastLoginAt: Date | null,
    public readonly loginAttempts: number,
    public readonly lockedUntil: Date | null,
    public readonly companyId: string | null,
    public readonly forcePasswordChange: boolean,
    public readonly mfaEnabled: boolean,
    public readonly totpSecret: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Full name computed property.
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Check if account is currently locked due to failed login attempts.
   */
  isLocked(): boolean {
    if (this.lockedUntil === null) return false;
    return this.lockedUntil > new Date();
  }

  /**
   * Check if account should be locked after another failed attempt.
   */
  shouldLockAfterFailure(): boolean {
    return this.loginAttempts + 1 >= AUTH.MAX_LOGIN_ATTEMPTS;
  }

  /**
   * Check if email is verified.
   */
  isEmailVerified(): boolean {
    return this.emailVerifiedAt !== null;
  }

  /**
   * Check if user is active and can authenticate.
   */
  canAuthenticate(): boolean {
    return this.status === "ACTIVE" && !this.isLocked();
  }

  /**
   * Factory — create from a plain object (e.g., Prisma result).
   */
  static fromPrisma(data: {
    id: string;
    email: string;
    role: string;
    status: string;
    firstName: string;
    lastName: string;
    passwordHash: string | null;
    emailVerifiedAt: Date | null;
    avatarUrl: string | null;
    lastLoginAt: Date | null;
    loginAttempts: number;
    lockedUntil: Date | null;
    companyMembership?: Array<{ companyId: string }>;
    forcePasswordChange: boolean;
    mfaEnabled: boolean;
    totpSecret: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      data.id,
      data.email,
      data.role,
      data.status,
      data.firstName,
      data.lastName,
      data.passwordHash,
      data.emailVerifiedAt,
      data.avatarUrl,
      data.lastLoginAt,
      data.loginAttempts,
      data.lockedUntil,
      data.companyMembership?.[0]?.companyId ?? null,
      data.forcePasswordChange,
      data.mfaEnabled,
      data.totpSecret,
      data.createdAt,
      data.updatedAt,
    );
  }
}
