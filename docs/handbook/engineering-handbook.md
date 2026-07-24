# MicroIntern Engineering Handbook

Welcome to the MicroIntern engineering team! This handbook outlines how we build software, manage our workflows, and ensure high quality across the platform.

---

## 1. Development Workflow

We use a lightweight trunk-based development approach with short-lived feature branches.

### Branching Strategy
- **`main`**: Production-ready code. Commits here automatically trigger staging deployments.
- **Feature Branches**: `feat/<module>/<feature-name>` (e.g., `feat/auth/oauth-login`)
- **Bugfix Branches**: `fix/<module>/<bug-name>` (e.g., `fix/trials/double-submission`)
- **Chore Branches**: `chore/<description>` (e.g., `chore/deps/update-prisma`)

### The Daily Flow
1. Sync your local `main` branch.
2. Create a new branch: `git checkout -b feat/company/create-profile`.
3. Write code, following the **Architecture Compliance Guide**.
4. Write tests for your feature.
5. Run `pnpm dev` and verify locally.
6. Commit often using **Conventional Commits**.
7. Push and open a Pull Request against `main`.

---

## 2. Commit Standards

We enforce [Conventional Commits](https://www.conventionalcommits.org/) via Husky and Commitlint. This ensures our commit history is readable and changelogs can be auto-generated.

**Format:**
```
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc.)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

**Example:**
```
feat(evaluation): add AI safety layer to groq provider

Ensures all prompts pass through the PII filter before hitting the LPU.
Resolves #142
```

---

## 3. Pull Request & Code Review Process

### Creating a PR
- Keep PRs small and focused (under 400 lines of code changed is ideal).
- Fill out the PR template completely.
- Ensure all CI checks pass (Lint, Type Check, Unit Tests, Integration Tests).
- If your PR involves UI changes, attach screenshots or a short screen recording.

### Code Review Expectations
- **Reviewers**: Aim to review PRs within 24 hours. Be constructive and kind.
- **Authors**: Be responsive to feedback. Do not take feedback personally.
- **Approval**: At least 1 approval from a core team member is required before merging.

### Review Checklist
- Does this follow the Clean Architecture boundaries?
- Are there appropriate tests?
- Are error cases handled gracefully (using `AppError`)?
- Are there any hardcoded values or secrets?
- Does it pass the automated architecture compliance checks?

---

## 4. Testing Strategy (Padmashree's Domain)

Quality is everyone's responsibility, but Padmashree leads our testing strategy.

- **Unit Tests**: Co-located with the source files (e.g., `auth.usecase.test.ts`). Focus on business logic and edge cases. (Jest/Vitest).
- **Integration Tests**: Located in `tests/integration/`. Tests the interaction between the API, Database, and Cache. (Supertest + real DB/Redis via Testcontainers or local Docker).
- **E2E Tests**: Located in `tests/e2e/`. Tests the entire flow from the browser to the database. (Playwright).

**Rule of Thumb:**
- Write a unit test for every Use Case and Domain Entity.
- Write an integration test for every major API endpoint.

---

## 5. Deployment

- **Staging**: Pushing to `main` auto-deploys to the Staging environment (`staging.microintern.io`). This is where QA validates features.
- **Production**: Releases are tagged and deployed manually by the Tech Lead after successful QA sign-off on Staging.

---

## 6. Communication

- **Technical Discussions**: Happen on GitHub Issues or PRs to preserve context.
- **Quick Questions**: Slack/Discord `#engineering` channel.
- **Architecture Changes**: Require a brief ADR (Architecture Decision Record) submitted as a PR to the `docs/architecture/decisions/` folder.
