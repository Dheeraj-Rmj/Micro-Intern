import type { Company } from "../entities/Company.entity.js";
import type { CompanyMember } from "../entities/CompanyMember.entity.js";
import type { CreateCompanyInput, UpdateCompanyInput } from "@microintern/shared";

/**
 * Company Repository Interface — domain layer contract.
 *
 * Defines all persistence operations needed by company application use cases.
 * Zero database infrastructure code exists in the domain or application layers.
 */
export interface ICompanyRepository {
  findById(id: string): Promise<Company | null>;
  findBySlug(slug: string): Promise<Company | null>;
  findByUserId(userId: string): Promise<Company | null>;

  create(data: CreateCompanyInput, slug: string, ownerUserId: string): Promise<Company>;
  update(companyId: string, data: UpdateCompanyInput): Promise<Company>;
  updateLogo(companyId: string, logoUrl: string): Promise<Company>;

  findMember(companyId: string, userId: string): Promise<CompanyMember | null>;
  findMemberByEmail(companyId: string, email: string): Promise<CompanyMember | null>;
  listMembers(
    companyId: string,
    pagination: { skip: number; take: number },
  ): Promise<{ members: CompanyMember[]; total: number }>;

  inviteMember(
    companyId: string,
    email: string,
    role: string,
    invitedByUserId: string,
  ): Promise<CompanyMember>;

  removeMember(companyId: string, userId: string): Promise<boolean>;
}
