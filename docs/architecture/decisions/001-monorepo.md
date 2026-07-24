# ADR-001: Monorepo with pnpm Workspaces + Turborepo

**Status**: Accepted  
**Date**: 2026-07-24  
**Authors**: Platform Engineering

---

## Context

MicroIntern consists of multiple deployable applications (API, Web) and shared libraries (types, database client, UI components). We need a strategy for organizing these packages.

## Decision

We will use a **pnpm monorepo** with **Turborepo** for build orchestration.

## Consequences

### Benefits

- **Code sharing**: `@microintern/shared` provides typed contracts between frontend and backend — a Zod schema change is immediately reflected in both
- **Atomic commits**: A feature touching API + Web + shared types ships as one commit
- **Fast installs**: pnpm deduplicates node_modules across packages
- **Smart builds**: Turborepo only rebuilds packages whose inputs changed (content hashing)
- **Single CI run**: One GitHub Actions workflow handles all packages

### Trade-offs

- **Longer initial clone**: More files than separate repos
- **Complexity**: Developers must understand workspace dependencies
- **Merge conflicts**: `pnpm-lock.yaml` can conflict in parallel branches

### Alternatives Rejected

- **Polyrepo**: Maximum isolation but no code sharing — Zod schemas would be duplicated between API and Web, guaranteed to drift
- **Nx**: More powerful than Turborepo but significantly more complex and opinionated
- **Yarn workspaces**: Less performant than pnpm, no equivalent to pnpm's strict hoisting
