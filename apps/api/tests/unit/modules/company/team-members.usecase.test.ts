import { Role } from '@microintern/shared';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { InviteTeamMemberUseCase } from '@/modules/company/application/use-cases/invite-team-member.usecase.js';
import { ListTeamMembersUseCase } from '@/modules/company/application/use-cases/list-team-members.usecase.js';
import { RemoveTeamMemberUseCase } from '@/modules/company/application/use-cases/remove-team-member.usecase.js';
import {
  NotCompanyOwnerError,
  MemberAlreadyExistsError,
  MemberNotFoundError,
  CannotRemoveOwnerError,
} from '@/modules/company/domain/errors/company.errors.js';
import { eventBus, DOMAIN_EVENTS } from '@/shared/events/EventBus.js';

describe('Company Team Member Management Use Cases', () => {
  let mockRepo: any;

  beforeEach(() => {
    mockRepo = {
      findByUserId: vi.fn(),
      findMember: vi.fn(),
      findMemberByEmail: vi.fn(),
      inviteMember: vi.fn(),
      listMembers: vi.fn(),
      removeMember: vi.fn(),
    };
    vi.spyOn(eventBus, 'emit').mockImplementation(async () => true as any);
  });

  describe('InviteTeamMemberUseCase', () => {
    it('should reject invitation attempt if requesting user is not COMPANY_OWNER', async () => {
      const useCase = new InviteTeamMemberUseCase(mockRepo);
      mockRepo.findByUserId.mockResolvedValue({ id: 'comp-1' });
      mockRepo.findMember.mockResolvedValue({ isOwner: () => false }); // Non-owner

      await expect(useCase.execute('user-recruiter', 'new@recruiter.com')).rejects.toThrow(NotCompanyOwnerError);
    });

    it('should throw MemberAlreadyExistsError if target email is already invited or a registered team member', async () => {
      const useCase = new InviteTeamMemberUseCase(mockRepo);
      mockRepo.findByUserId.mockResolvedValue({ id: 'comp-1' });
      mockRepo.findMember.mockResolvedValue({ isOwner: () => true });
      mockRepo.findMemberByEmail.mockResolvedValue({ id: 'mem-existing' });

      await expect(useCase.execute('user-owner', 'existing@recruiter.com')).rejects.toThrow(MemberAlreadyExistsError);
    });

    it('should invite new RECRUITER, normalize email address, and emit COMPANY_MEMBER_INVITED event', async () => {
      const useCase = new InviteTeamMemberUseCase(mockRepo);
      mockRepo.findByUserId.mockResolvedValue({ id: 'comp-1', name: 'Acme AI' });
      mockRepo.findMember.mockResolvedValue({ isOwner: () => true });
      mockRepo.findMemberByEmail.mockResolvedValue(null);
      mockRepo.inviteMember.mockResolvedValue({ id: 'mem-new', role: Role.RECRUITER });

      const res = await useCase.execute('user-owner', '   Recruiter@Company.COM   ');
      expect(res.id).toBe('mem-new');
      expect(mockRepo.inviteMember).toHaveBeenCalledWith('comp-1', 'recruiter@company.com', Role.RECRUITER, 'user-owner');
      expect(eventBus.emit).toHaveBeenCalledWith(DOMAIN_EVENTS.COMPANY_MEMBER_INVITED, {
        companyId: 'comp-1',
        companyName: 'Acme AI',
        invitedByUserId: 'user-owner',
        email: 'recruiter@company.com',
        role: Role.RECRUITER,
        memberId: 'mem-new',
      });
    });
  });

  describe('ListTeamMembersUseCase', () => {
    it('should return paginated members list and accurately construct pagination metadata', async () => {
      const useCase = new ListTeamMembersUseCase(mockRepo);
      mockRepo.findByUserId.mockResolvedValue({ id: 'comp-1' });
      mockRepo.listMembers.mockResolvedValue({
        members: [{ id: 'mem-1' }, { id: 'mem-2' }],
        total: 25,
      });

      const res = await useCase.execute('user-1', { page: 2, limit: 10 });
      expect(res.members).toHaveLength(2);
      expect(res.pagination).toEqual({
        page: 2,
        limit: 10,
        total: 25,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      });
      expect(mockRepo.listMembers).toHaveBeenCalledWith('comp-1', { skip: 10, take: 10 });
    });
  });

  describe('RemoveTeamMemberUseCase', () => {
    it('should throw CannotRemoveOwnerError if owner attempts to remove themselves or another owner', async () => {
      const useCase = new RemoveTeamMemberUseCase(mockRepo);
      mockRepo.findByUserId.mockResolvedValue({ id: 'comp-1' });
      mockRepo.findMember.mockImplementation((comp: any, userId: any) => {
        if (userId === 'user-owner') return { isOwner: () => true };
        if (userId === 'other-owner') return { isOwner: () => true };
        return null;
      });

      await expect(useCase.execute('user-owner', 'user-owner')).rejects.toThrow(CannotRemoveOwnerError);
      await expect(useCase.execute('user-owner', 'other-owner')).rejects.toThrow(CannotRemoveOwnerError);
      expect(mockRepo.removeMember).not.toHaveBeenCalled();
    });

    it('should throw MemberNotFoundError if target user to remove is not in the company', async () => {
      const useCase = new RemoveTeamMemberUseCase(mockRepo);
      mockRepo.findByUserId.mockResolvedValue({ id: 'comp-1' });
      mockRepo.findMember.mockImplementation((comp: any, userId: any) => {
        if (userId === 'user-owner') return { isOwner: () => true };
        return null; // Target not found
      });

      await expect(useCase.execute('user-owner', 'user-stranger')).rejects.toThrow(MemberNotFoundError);
    });

    it('should execute removal cleanly for regular team recruiters', async () => {
      const useCase = new RemoveTeamMemberUseCase(mockRepo);
      mockRepo.findByUserId.mockResolvedValue({ id: 'comp-1' });
      mockRepo.findMember.mockImplementation((comp: any, userId: any) => {
        if (userId === 'user-owner') return { isOwner: () => true };
        if (userId === 'user-recruiter') return { isOwner: () => false };
        return null;
      });
      mockRepo.removeMember.mockResolvedValue(true);

      await expect(useCase.execute('user-owner', 'user-recruiter')).resolves.toBeUndefined();
      expect(mockRepo.removeMember).toHaveBeenCalledWith('comp-1', 'user-recruiter');
    });
  });
});
