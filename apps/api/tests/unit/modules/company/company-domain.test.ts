import { EntityStatus, Role } from '@microintern/shared';
import { describe, it, expect } from 'vitest';

import { Company } from '@/modules/company/domain/entities/Company.entity.js';
import { CompanyMember } from '@/modules/company/domain/entities/CompanyMember.entity.js';

describe('Company Module Domain Entities', () => {
  describe('Company Entity', () => {
    it('should correctly evaluate isActiveOrPending() for ACTIVE and PENDING_VERIFICATION statuses', () => {
      const activeCompany = new Company(
        'comp-1', 'Test Corp', 'test-corp', EntityStatus.ACTIVE, null, null, null, null, null, null, null, 'PRO', new Date(), new Date()
      );
      expect(activeCompany.isActiveOrPending()).toBe(true);
      expect(activeCompany.isSuspended()).toBe(false);

      const pendingCompany = new Company(
        'comp-2', 'Pending Corp', 'pending-corp', EntityStatus.PENDING_VERIFICATION, null, null, null, null, null, null, null, 'FREE', new Date(), new Date()
      );
      expect(pendingCompany.isActiveOrPending()).toBe(true);
    });

    it('should correctly detect suspended accounts with isSuspended()', () => {
      const suspendedCompany = new Company(
        'comp-3', 'Banned Corp', 'banned-corp', EntityStatus.SUSPENDED, null, null, null, null, null, null, null, 'FREE', new Date(), new Date()
      );
      expect(suspendedCompany.isSuspended()).toBe(true);
      expect(suspendedCompany.isActiveOrPending()).toBe(false);
    });

    it('should instantiate cleanly via fromPrisma factory method', () => {
      const now = new Date();
      const company = Company.fromPrisma({
        id: 'comp-4',
        name: 'Factory Corp',
        slug: 'factory-corp',
        status: EntityStatus.ACTIVE,
        logoUrl: 'https://logo.webp',
        websiteUrl: 'https://example.com',
        description: 'Testing factory',
        industry: 'Tech',
        size: '10-50',
        location: 'Remote',
        linkedinUrl: 'https://linkedin.com',
        planTier: 'PRO',
        createdAt: now,
        updatedAt: now,
      });
      expect(company.name).toBe('Factory Corp');
      expect(company.industry).toBe('Tech');
      expect(company.isActiveOrPending()).toBe(true);
    });
  });

  describe('CompanyMember Entity', () => {
    it('should evaluate isOwner() correctly for COMPANY_OWNER and OWNER roles', () => {
      const ownerMember = new CompanyMember(
        'mem-1', 'comp-1', 'user-1', Role.COMPANY_OWNER, null, new Date(), new Date(), new Date()
      );
      expect(ownerMember.isOwner()).toBe(true);
      expect(ownerMember.hasJoined()).toBe(true);

      const recruiterMember = new CompanyMember(
        'mem-2', 'comp-1', 'user-2', Role.RECRUITER, 'user-1', null, new Date(), new Date()
      );
      expect(recruiterMember.isOwner()).toBe(false);
      expect(recruiterMember.hasJoined()).toBe(false);
    });

    it('should transform database record cleanly via fromPrisma factory with nested user details', () => {
      const record = {
        id: 'mem-3',
        companyId: 'comp-1',
        userId: 'user-3',
        role: Role.RECRUITER,
        invitedBy: 'user-1',
        joinedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
        user: {
          email: 'recruiter@company.com',
          firstName: 'John',
          lastName: 'Doe',
          avatarUrl: null,
          status: 'ACTIVE',
        },
      };
      const member = CompanyMember.fromPrisma(record);
      expect(member.id).toBe('mem-3');
      expect(member.userDetails?.email).toBe('recruiter@company.com');
      expect(member.hasJoined()).toBe(true);
    });
  });
});
