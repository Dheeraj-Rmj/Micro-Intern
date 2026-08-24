import { Role } from "@microintern/shared";

/**
 * Company Member Domain Entity.
 *
 * Represents the membership and role assignment of a user within a company.
 */
export class CompanyMember {
  constructor(
    public readonly id: string,
    public readonly companyId: string,
    public readonly userId: string,
    public readonly role: string, // COMPANY_OWNER or RECRUITER
    public readonly invitedBy: string | null,
    public readonly joinedAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly userDetails?: {
      email: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      status: string;
    },
  ) {}

  /**
   * Check if this member is an owner of the company.
   */
  isOwner(): boolean {
    return this.role === Role.COMPANY_OWNER || this.role === "OWNER";
  }

  /**
   * Check if this member has accepted their invite and joined.
   */
  hasJoined(): boolean {
    return this.joinedAt !== null;
  }

  /**
   * Factory — create from plain object (e.g., Prisma result).
   */
  static fromPrisma(data: {
    id: string;
    companyId: string;
    userId: string;
    role: string;
    invitedBy: string | null;
    joinedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    user?: {
      email: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
      status: string;
    } | null;
  }): CompanyMember {
    return new CompanyMember(
      data.id,
      data.companyId,
      data.userId,
      data.role,
      data.invitedBy,
      data.joinedAt,
      data.createdAt,
      data.updatedAt,
      data.user !== null && data.user !== undefined
        ? {
            email: data.user.email,
            firstName: data.user.firstName,
            lastName: data.user.lastName,
            avatarUrl: data.user.avatarUrl,
            status: data.user.status,
          }
        : undefined,
    );
  }
}
