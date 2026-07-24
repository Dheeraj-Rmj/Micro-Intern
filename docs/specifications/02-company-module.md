# Module 02: Company Module

## 1. Overview
Manages company profiles, billing tiers, and team members. A user with `COMPANY_OWNER` role creates the company and can invite `RECRUITER`s.

## 2. Backend Requirements (Vyshavi)

### Domain Entities
- **Company**: `name`, `website`, `logoUrl`, `description`, `industry`.
- **CompanyMember**: Joins `User` to `Company` with a specific role (`OWNER`, `RECRUITER`).

### Use Cases
1. `CreateCompanyUseCase`: Creates company and assigns current user as OWNER.
2. `UpdateCompanyUseCase`: Updates details and logo.
3. `InviteTeamMemberUseCase`: Sends an email invite to a new user to join the company as a RECRUITER.
4. `ListTeamMembersUseCase`: Returns paginated list of members.
5. `RemoveTeamMemberUseCase`: Removes a user from the company.

### API Endpoints
- `POST /api/v1/companies` - Create company (Requires `COMPANY_OWNER` with no existing company)
- `GET /api/v1/companies/me` - Get context company
- `PUT /api/v1/companies/me` - Update company
- `POST /api/v1/companies/me/logo` - Upload logo (PUBLIC bucket)
- `GET /api/v1/companies/me/members` - List members
- `POST /api/v1/companies/me/members/invite` - Invite member
- `DELETE /api/v1/companies/me/members/:userId` - Remove member

## 3. Frontend Requirements (Mustab)

### Route Group: `(company)/company/settings`
### UI Components Needed
- **Company Onboarding Flow**: If `COMPANY_OWNER` logs in and has no company, force redirect to a creation wizard.
- **Company Profile Settings**: Form for name, website, industry, description. Logo uploader.
- **Team Management Table**: Uses `SkeletonTable` while loading. Shows members, roles, and a "Remove" button (requires confirmation dialog using `radix-ui/react-alert-dialog`).
- **Invite Modal**: Form with email input to invite recruiters.

## 4. Acceptance Criteria (Padmashree)
- [ ] Company Owner can create exactly one company.
- [ ] Owner can invite a user via email. The system sends an invitation email (via EventBus -> EmailService).
- [ ] Invited user clicks link, registers, and is automatically added to the company as a RECRUITER.
- [ ] Owner can remove a recruiter. Removed recruiter loses access to company data immediately.
- [ ] Recruiters cannot access the Team Management endpoints (RBAC: `requireRole('COMPANY_OWNER')`).
