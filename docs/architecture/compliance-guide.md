# Architecture Compliance Guide

This guide ensures that the MicroIntern Modular Monolith remains clean, scalable, and secure as the team grows. Before submitting a PR, ensure your code complies with these rules.

---

## 1. Clean Architecture Boundaries

Our most critical invariant is the strict separation of concerns across architectural layers.

### The Rules:
1. **Domain Layer**: Independent of everything. No imports from `application`, `infrastructure`, `presentation`, or any external libraries (except standard utilities like `zod` for schemas, if deemed part of the domain).
2. **Application Layer**: Orchestrates business logic. Can only import from the `domain` layer and internal `application` files. No HTTP request/response objects, no Prisma client.
3. **Infrastructure Layer**: Implements interfaces defined in the application/domain layers. Can import from `domain` and `application`. This is the *only* place where database calls (Prisma), external APIs (Groq, Resend), or Cache (Redis) can happen.
4. **Presentation Layer**: Thin HTTP adapters (Express controllers). Can only import from `application` (to call Use Cases) and `shared` (for response formatters). No business logic lives here.

### Automated Enforcement:
We use ESLint `import/no-restricted-paths` to enforce this. If you violate a boundary, your build will fail.

---

## 2. Error Handling

- **Never throw raw `Error` objects.** Always throw a subclass of `AppError` (e.g., `NotFoundError`, `ValidationError`, `DomainError`).
- **Do not catch and swallow errors.** Let them bubble up to the global error middleware, or catch, wrap in an `AppError`, and rethrow.
- **Use `DomainError` for business rule violations.** (e.g., "Trial cannot be published without tasks").

---

## 3. Database Access

- **No DB calls in Use Cases.** Use Cases must call Repository Interfaces.
- **No raw SQL unless absolutely necessary.** Use Prisma Client.
- **Transactions:** If a Use Case needs a transaction spanning multiple repositories, use the Unit of Work pattern or pass a transaction context. (Currently, keep operations idempotent or single-repository focused where possible).

---

## 4. Configuration and Environment

- **Never use `process.env` directly in feature code.**
- All environment variables must be registered and validated in `apps/api/src/core/config.ts`.
- Use the exported `config` object. This guarantees the app crashes at startup if a required variable is missing, rather than failing randomly in production.

---

## 5. Security Checklist

- [ ] Are all new endpoints protected by the `requireAuth` middleware (unless explicitly public)?
- [ ] Are role checks implemented using `requireRole` or `requireAnyRole` where appropriate?
- [ ] Does this endpoint need a specific rate limit context? (Update `ratelimit.middleware.ts` if so).
- [ ] Are sensitive fields (passwords, tokens) excluded from API responses? (Ensure they are omitted in the Presentation layer or Prisma `select`).
- [ ] Are user inputs validated via Zod schemas in the `validate` middleware?

---

## 6. API Response Consistency

- **Never use `res.json()` directly.**
- Always use the `ResponseFormatter`:
  ```typescript
  return ResponseFormatter.success(res, data);
  // or
  return ResponseFormatter.created(res, data);
  ```

---

## 7. Cross-Module Communication

- Modules must **not** directly import internal services from other modules.
- **Synchronous inter-module calls:** Use exposed Application Interfaces (if explicitly shared).
- **Asynchronous/Decoupled communication:** Use the `EventBus` (`apps/api/src/shared/events/EventBus.ts`).
  - Example: `TrialModule` publishes a trial. It emits `TRIAL_PUBLISHED`. `NotificationModule` listens to this event and sends emails.

## 8. Code Review Checklist for Approvers

When reviewing code, explicitly check for:
1. **Layer Leakage:** Is there SQL in a controller? HTTP in a Use Case? Reject.
2. **Missing Validation:** Is a new endpoint missing Zod validation? Reject.
3. **Hardcoded Secrets:** Are there API keys in the code? Reject and revoke immediately.
4. **Test Coverage:** Does the new Use Case have a corresponding unit test?
