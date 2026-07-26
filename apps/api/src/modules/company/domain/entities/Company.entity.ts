import { EntityStatus } from '@microintern/shared';

/**
 * Company Domain Entity.
 *
 * Encapsulates business rules and state transitions for a company account.
 * Pure TypeScript class without ORM decorators or HTTP context.
 */
export class Company {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly slug: string,
    public readonly status: string,
    public readonly logoUrl: string | null,
    public readonly websiteUrl: string | null,
    public readonly description: string | null,
    public readonly industry: string | null,
    public readonly size: string | null,
    public readonly location: string | null,
    public readonly linkedinUrl: string | null,
    public readonly planTier: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Check if company account is currently active or pending verification.
   */
  isActiveOrPending(): boolean {
    return (
      this.status === EntityStatus.ACTIVE ||
      this.status === EntityStatus.PENDING_VERIFICATION
    );
  }

  /**
   * Check if company is suspended.
   */
  isSuspended(): boolean {
    return this.status === EntityStatus.SUSPENDED;
  }

  /**
   * Factory — create from plain object (e.g. Prisma result).
   */
  static fromPrisma(data: {
    id: string;
    name: string;
    slug: string;
    status: string;
    logoUrl: string | null;
    websiteUrl: string | null;
    description: string | null;
    industry: string | null;
    size: string | null;
    location: string | null;
    linkedinUrl: string | null;
    planTier: string;
    createdAt: Date;
    updatedAt: Date;
  }): Company {
    return new Company(
      data.id,
      data.name,
      data.slug,
      data.status,
      data.logoUrl,
      data.websiteUrl,
      data.description,
      data.industry,
      data.size,
      data.location,
      data.linkedinUrl,
      data.planTier,
      data.createdAt,
      data.updatedAt,
    );
  }
}
