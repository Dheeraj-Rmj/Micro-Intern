# Module 01: Candidate Profile

## 1. Overview
The Candidate Profile module allows users with the `CANDIDATE` role to manage their professional identity. This replaces the traditional resume. It tracks their skills, links (GitHub, LinkedIn), and general bio.

## 2. Backend Requirements (Vyshavi)

### Domain Entities
- **CandidateProfile**: Linked 1:1 with `User`.
  - Properties: `headline`, `bio`, `skills` (string[]), `githubUrl`, `portfolioUrl`, `linkedinUrl`, `resumeUrl` (optional fallback).

### Use Cases
1. `CreateProfileUseCase`: Initializes the profile (called automatically after registration or on first login if missing).
2. `UpdateProfileUseCase`: Updates bio, links, and skills.
3. `UploadAvatarUseCase`: Uses `StorageService` to upload an avatar to the PUBLIC bucket and updates the User record.
4. `UploadResumeUseCase`: Uses `StorageService` to upload a PDF to the PRIVATE bucket.

### API Endpoints
- `GET /api/v1/candidates/me` - Get current candidate profile
- `PUT /api/v1/candidates/me` - Update profile data
- `POST /api/v1/candidates/me/avatar` - Upload avatar image (multipart/form-data)
- `POST /api/v1/candidates/me/resume` - Upload resume (multipart/form-data)

## 3. Frontend Requirements (Mustab)

### Route Group: `(candidate)/dashboard/profile`
### UI Components Needed
- **Profile Header**: Shows Avatar, Name, Headline.
- **Edit Profile Form**: React Hook Form using `Input` and `Textarea` for bio, skills (tag input), and social links.
- **File Uploaders**: Drag-and-drop zones for Avatar (Image) and Resume (PDF). Use the signed URL flow or direct multipart upload depending on the API design.

### State Management
- Re-fetch `authKeys.me()` upon successful profile update to reflect new avatar globally.

## 4. Acceptance Criteria (Padmashree)
- [ ] Candidate can view their profile.
- [ ] Candidate can update their headline, bio, and add up to 20 skills.
- [ ] Validation prevents invalid URLs for social links.
- [ ] Avatar upload restricts files to images under 5MB.
- [ ] Resume upload restricts files to PDF under 10MB.
- [ ] Users with `COMPANY_OWNER` or `RECRUITER` roles receive 403 Forbidden if they try to access candidate profile endpoints.
