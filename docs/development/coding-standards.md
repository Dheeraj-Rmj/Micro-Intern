# Coding Standards

This document defines the coding standards for all MicroIntern engineers.
These are enforced via ESLint, Prettier, and TypeScript — not just guidelines.

---

## TypeScript

### Strict mode is mandatory

```typescript
// ✅ Correct
function getUser(id: string): Promise<User | null> {
  return userRepository.findById(id);
}

// ❌ Wrong — return type and parameter type omitted
async function getUser(id) {
  return userRepository.findById(id);
}
```

### Prefer `type` over `interface` for simple shapes

```typescript
// ✅ Preferred for DTOs and response shapes
type UserResponse = { id: string; email: string; role: string };

// ✅ Use interface only when you need declaration merging
interface Express.Request { user?: AuthenticatedUser }
```

### Never use `any` or `as any`

```typescript
// ❌ Wrong
const data = response.body as any;

// ✅ Use `unknown` and narrow it
const data: unknown = response.body;
if (typeof data === 'object' && data !== null) { ... }
```

### Use discriminated unions for state modeling

```typescript
// ✅ Discriminated union — exhaustive
type LoadState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

---

## Error Handling

### Always throw `AppError` subclasses in application code

```typescript
// ✅ Correct
throw new NotFoundError('Trial', trialId);
throw new ForbiddenError('Only company owners can publish trials');

// ❌ Wrong — raw Error loses HTTP status and error code
throw new Error('Not found');
```

### Never swallow errors silently

```typescript
// ❌ Wrong
try {
  await doSomething();
} catch (e) {
  // silently ignored
}

// ✅ Correct — log and rethrow or handle explicitly
try {
  await doSomething();
} catch (error) {
  log.error({ err: error }, 'Failed to do something');
  throw error; // or convert to AppError
}
```

---

## Module Structure

Every feature module follows Clean Architecture:

```
modules/{domain}/
  domain/           ← Business rules (no imports from outside domain)
    entities/       ← Domain entities (pure TypeScript classes)
    repositories/   ← Repository interfaces (IXxxRepository)
    services/       ← Domain services (pure logic)
  application/      ← Orchestration (no HTTP, no DB)
    use-cases/      ← One file per use case
    dtos/           ← Zod schemas + TypeScript types
    interfaces/     ← Service interfaces (IXxxService)
  infrastructure/   ← Concrete implementations
    repositories/   ← Prisma repositories
    services/       ← JWT, Email, Storage, etc.
  presentation/     ← HTTP adapters
    controller.ts   ← Thin adapter, no business logic
    routes.ts       ← Route definitions with middleware
```

### Import rules (enforced by ESLint)

```
domain/ → can only import from domain/
application/ → can import from domain/ only
infrastructure/ → can import from domain/, application/
presentation/ → can import from application/ only (not infrastructure/)
```

---

## Naming Conventions

| Pattern | Convention | Example |
|---------|-----------|---------|
| Files | kebab-case | `user-repository.ts` |
| Classes | PascalCase | `UserRepository` |
| Interfaces | I-prefixed PascalCase | `IUserRepository` |
| Enums | PascalCase | `TrialStatus` |
| Functions | camelCase | `getUserById` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_LOGIN_ATTEMPTS` |
| Types | PascalCase | `UserResponse` |
| React components | PascalCase | `UserCard` |
| Hooks | use-prefixed camelCase | `useCurrentUser` |

---

## Commit Messages

Follows [Conventional Commits](https://www.conventionalcommits.org/).

```
feat(auth): add Google OAuth login
fix(trials): prevent double-submission on slow networks
refactor(evaluation): extract AI evaluation into use case
chore(deps): upgrade Prisma to 6.1.0
docs(api): add rate limiting documentation
test(auth): add integration tests for login flow
```

Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `style`, `perf`, `ci`

---

## Testing

### Unit tests: co-located with source

```
modules/auth/application/use-cases/
  auth.usecase.ts
  auth.usecase.test.ts   ← co-located
```

### Integration tests: in `tests/integration/`

```
tests/integration/
  auth.integration.test.ts    ← tests real HTTP + DB
```

### Test naming

```typescript
describe('LoginUseCase', () => {
  describe('when credentials are valid', () => {
    it('returns access and refresh tokens', async () => { ... });
    it('creates a Redis session', async () => { ... });
  });

  describe('when password is wrong', () => {
    it('throws UnauthorizedError', async () => { ... });
    it('increments loginAttempts counter', async () => { ... });
  });
});
```
