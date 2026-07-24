# Module 03: Trial Module

## 1. Overview
The core entity of the platform. A Trial is a skill assessment created by a Company. It contains instructions, time limits, and evaluation criteria.

## 2. Backend Requirements (Vyshavi)

### Domain Entities
- **Trial**: `title`, `description`, `difficulty`, `timeLimitMinutes`, `status` (DRAFT, PUBLISHED, CLOSED).
- **TrialTask**: Individual tasks/questions within a trial.
- **TrialInvitation**: Links a candidate to a private trial.

### Use Cases
1. `CreateTrialUseCase`: Creates a DRAFT trial.
2. `UpdateTrialUseCase`: Edits trial details and tasks.
3. `PublishTrialUseCase`: Validates trial has at least 1 task, changes status to PUBLISHED.
4. `ListCompanyTrialsUseCase`: For recruiters/owners to see their trials.
5. `ListPublicTrialsUseCase`: For candidates to browse open trials.

### API Endpoints
- `POST /api/v1/trials` - Create draft
- `GET /api/v1/trials` - List public trials (with filtering/pagination)
- `GET /api/v1/companies/me/trials` - List company trials
- `GET /api/v1/trials/:id` - Get details (public info if published, full info if owner)
- `PUT /api/v1/trials/:id` - Update
- `POST /api/v1/trials/:id/publish` - Publish

## 3. Frontend Requirements (Mustab)

### Candidate Portal `(candidate)/dashboard/trials`
- **Trial Marketplace**: Grid of `Card` components showing open trials, difficulty badges, and estimated time.
- **Trial Details Page**: Shows instructions, company info, and an "Apply / Start Trial" button.

### Company Portal `(company)/company/trials`
- **Trial Dashboard**: List of company's trials with status badges.
- **Trial Builder**: Complex form. Needs a dynamic field array (React Hook Form `useFieldArray`) to add/remove/reorder Trial Tasks.
- **Publish Action**: Button that triggers a confirmation modal.

## 4. Acceptance Criteria (Padmashree)
- [ ] Company can create, edit, and save drafts of trials.
- [ ] Publishing a trial requires all validation rules to pass (e.g., minimum word counts, at least one task).
- [ ] Candidates can browse published trials and view details.
- [ ] Candidates cannot view draft or closed trials.
- [ ] Companies cannot view or edit trials belonging to other companies.
