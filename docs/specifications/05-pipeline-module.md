# Module 05: Pipeline Module

## 1. Overview
The ATS (Applicant Tracking System) component for companies. Tracks candidates as they move from Applied -> Evaluated -> Interview -> Offer.

## 2. Backend Requirements (Vyshavi)

### Domain Entities
- **Pipeline**: Belongs to a Trial.
- **PipelineStage**: Configurable stages (e.g., "AI Review", "Technical Interview", "Offer").
- **PipelineEntry**: Links a Candidate's Submission to a Pipeline Stage.

### Use Cases
1. `GetTrialPipelineUseCase`: Returns the full board structure and all candidates currently in it.
2. `MoveCandidateUseCase`: Moves a candidate from one stage to another. Emits `PIPELINE_CANDIDATE_MOVED`.
3. `RejectCandidateUseCase`: Marks a candidate as rejected.

### API Endpoints
- `GET /api/v1/companies/me/trials/:trialId/pipeline`
- `PATCH /api/v1/companies/me/pipeline/entries/:entryId` - Update stage

## 3. Frontend Requirements (Mustab)

### Route Group: `(recruiter)/recruiter/pipeline/[trialId]`
### UI Components Needed
- **Kanban Board**: Implement a drag-and-drop board.
  - Columns represent `PipelineStage`.
  - Cards represent Candidates (showing their AI Score, Name, Avatar).
- **Candidate Detail Slide-over**: Clicking a card opens a Radix UI `Sheet` component sliding in from the right. It displays their full Submission and AI Evaluation.

## 4. Acceptance Criteria (Padmashree)
- [ ] Recruiters can see all candidates who applied to their trial in the pipeline board.
- [ ] Candidates automatically enter the first stage upon `TRIAL_SUBMITTED`.
- [ ] Recruiters can move candidates between stages.
- [ ] Moving a candidate triggers necessary notifications (e.g., if moved to "Offer", candidate gets an email).
- [ ] Performance: The board should load efficiently even with 500+ candidates (pagination or virtualization may be required).
