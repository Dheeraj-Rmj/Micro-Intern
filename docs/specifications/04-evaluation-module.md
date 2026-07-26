# Module 04: Evaluation Module

## 1. Overview
Handles candidate submissions and the AI-driven evaluation process.

## 2. Backend Requirements (Vyshavi)

### Domain Entities
- **Submission**: A candidate's response to a Trial. Contains answers to TrialTasks and links to uploaded files (StorageService).
- **Evaluation**: The AI-generated feedback and score for a Submission.

### Use Cases
1. `StartTrialUseCase`: Marks a candidate as started, begins the countdown timer.
2. `SubmitTrialUseCase`: Accepts the candidate's work. Uploads files to PRIVATE bucket. Emits `TRIAL_SUBMITTED` event.
3. `ProcessEvaluationUseCase`: (Triggered by queue worker listening to `TRIAL_SUBMITTED`). Fetches Trial criteria, Candidate answers, sends to `AIFallbackEngine`, parses structured JSON response, saves Evaluation record, emits `EVALUATION_COMPLETED`.

### API Endpoints
- `POST /api/v1/trials/:id/start`
- `POST /api/v1/trials/:id/submit`
- `GET /api/v1/submissions/me` - Candidate's submissions
- `GET /api/v1/submissions/:id/evaluation` - Fetch AI results

### Queue Integration
- This module relies heavily on BullMQ (`ai-evaluation` queue). The submission endpoint must be fast (just saves to DB and adds to queue).

## 3. Frontend Requirements (Mustab)

### Candidate Portal `(candidate)/dashboard/trials/[id]/take`
- **Trial Environment**: A focused UI. Needs a persistent countdown timer. Prevent accidental navigation away (browser beforeunload event).
- **Submission Form**: Text areas for written answers, file upload components for project files.
- **Results View**: After AI finishes, display scores, strengths, and areas for improvement in visually distinct sections using `Card` and `Badge` components.

### Company Portal
- **Review UI**: Recruiters view the candidate's raw submission side-by-side with the AI's evaluation.

## 4. Acceptance Criteria (Padmashree)
- [x] Candidate cannot submit after the time limit has expired (with a reasonable grace period of ~1 minute for network latency).
- [x] Submission correctly queues the AI evaluation job.
- [x] If Groq fails, the evaluation seamlessly falls back to OpenRouter/Gemini.
- [x] AI prompt injection attempts in candidate answers are caught by `AISafetyLayer`.
- [x] Candidate can view detailed feedback once evaluation status is `COMPLETED`.
