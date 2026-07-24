# Module 06: Admin Module

## 1. Overview
Platform administration for `ADMIN` and `SUPER_ADMIN` roles. Used to monitor platform health, verify companies, and manage users.

## 2. Backend Requirements (Vyshavi)

### Use Cases
1. `GetPlatformStatsUseCase`: Aggregates total users, active trials, AI usage metrics.
2. `VerifyCompanyUseCase`: Approves a company to publish public trials (anti-spam measure).
3. `SuspendUserUseCase`: Blocks a bad actor.

### API Endpoints (All require `ADMIN` role)
- `GET /api/v1/admin/stats`
- `GET /api/v1/admin/companies/pending`
- `POST /api/v1/admin/companies/:id/verify`
- `POST /api/v1/admin/users/:id/suspend`

## 3. Frontend Requirements (Mustab)

### Route Group: `(admin)/admin`
### UI Components Needed
- **Admin Dashboard**: High-level charts/stats.
- **Verification Queue**: Table of companies awaiting verification with "Approve" and "Reject" buttons.
- **User Directory**: Searchable data table of all platform users with ability to suspend accounts.

## 4. Acceptance Criteria (Padmashree)
- [ ] Non-admin users attempting to access ANY `/api/v1/admin/*` endpoint receive a 403 Forbidden.
- [ ] Admin dashboard correctly aggregates platform metrics.
- [ ] Suspending a user immediately revokes their active sessions (by deleting their sessions from Redis).
