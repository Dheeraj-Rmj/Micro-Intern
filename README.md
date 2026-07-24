# MicroIntern — Engineering Foundation

> **AI-Powered Skill Trial Platform**  
> Companies evaluate candidates using real-world skill trials instead of resumes.

---

## Architecture

**Pattern**: Modular Monolith → Clean Architecture → Domain-Driven Design  
**Repository**: pnpm Monorepo + Turborepo

```
microintern/
├── apps/
│   ├── api/          # Express + TypeScript REST API
│   └── web/          # Next.js 15 frontend (multi-portal)
├── packages/
│   ├── shared/       # Shared types, schemas, enums, constants
│   ├── database/     # Prisma schema + migrations + seed
│   └── config/       # Shared ESLint, Prettier, TypeScript configs
├── infrastructure/
│   ├── docker/       # Service configs
│   └── nginx/        # Reverse proxy config
├── .github/
│   └── workflows/    # CI/CD pipelines
└── docs/             # Architecture, API, development guides
```

## Quick Start

### Prerequisites

| Tool           | Version                |
| -------------- | ---------------------- |
| Node.js        | 20.18.x (see `.nvmrc`) |
| pnpm           | 9.12.x                 |
| Docker         | 24+                    |
| Docker Compose | 2.x                    |

### 1. Clone and Install

```bash
git clone https://github.com/your-org/microintern.git
cd microintern

# Install Node.js (if using nvm)
nvm install && nvm use

# Install all dependencies
pnpm install
```

### 2. Configure Environment

```bash
# Copy environment template
cp .env.example apps/api/.env

# Edit with your values (minimum required for local dev):
# - DATABASE_URL (default works with docker-compose)
# - REDIS_URL (default works with docker-compose)
# - JWT_ACCESS_SECRET (generate: openssl rand -base64 64)
# - JWT_REFRESH_SECRET (generate: openssl rand -base64 64)
# - ENCRYPTION_KEY (generate: openssl rand -hex 32)
```

### 3. Start Infrastructure

```bash
# Start PostgreSQL, Redis, MinIO, MailHog, Ollama
docker compose up -d

# Wait for health checks (30s)
docker compose ps
```

### 4. Set Up Database

```bash
# Generate Prisma client
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed development data
pnpm db:seed
```

### 5. Start Development Servers

```bash
# Start all packages in watch mode
pnpm dev

# Or individually:
pnpm dev --filter @microintern/api   # API on http://localhost:3001
pnpm dev --filter @microintern/web   # Web on http://localhost:3000
```

### 6. Verify Setup

```bash
# API health check
curl http://localhost:3001/health

# API readiness
curl http://localhost:3001/health/ready

# MinIO Console: http://localhost:9001 (admin/admin)
# MailHog UI: http://localhost:8025
```

---

## Portals

| Portal    | Route        | Role                                   |
| --------- | ------------ | -------------------------------------- |
| Candidate | `/`          | Job seekers completing skill trials    |
| Company   | `/company`   | Companies creating and managing trials |
| Recruiter | `/recruiter` | Recruiters managing hiring pipelines   |
| Admin     | `/admin`     | Platform operators                     |

## Seed Accounts

| Role          | Email                     | Password     |
| ------------- | ------------------------- | ------------ |
| SUPER_ADMIN   | superadmin@microintern.io | Password@123 |
| ADMIN         | admin@microintern.io      | Password@123 |
| COMPANY_OWNER | owner@acme.com            | Password@123 |
| RECRUITER     | recruiter@acme.com        | Password@123 |
| CANDIDATE     | candidate@example.com     | Password@123 |

## Common Commands

```bash
pnpm dev              # Start all dev servers
pnpm build            # Build all packages
pnpm test             # Run all tests
pnpm test:unit        # Unit tests only
pnpm test:integration # Integration tests only
pnpm lint             # Lint all packages
pnpm type-check       # TypeScript check
pnpm format           # Format all files
pnpm db:generate      # Regenerate Prisma client
pnpm db:migrate       # Run pending migrations
pnpm db:seed          # Seed development data
pnpm db:studio        # Open Prisma Studio
pnpm clean            # Remove all build artifacts
```

## AI Providers

Configure at least one in `apps/api/.env`:

| Provider           | Key                  | Free Tier      |
| ------------------ | -------------------- | -------------- |
| **Groq** (primary) | `GROQ_API_KEY`       | ✅ Generous    |
| OpenRouter         | `OPENROUTER_API_KEY` | ✅ Pay-per-use |
| Gemini             | `GEMINI_API_KEY`     | ✅ AI Studio   |
| Ollama             | No key needed        | ✅ Local       |

## Documentation

- [Architecture Vision & Foundation](docs/architecture/vision-and-foundation.md)
- [Architecture Overview](docs/architecture/overview.md)
- [API Standards](docs/api/standards.md)
- [Getting Started](docs/development/getting-started.md)
- [Contributing Guide](docs/development/contributing.md)
- [Coding Standards](docs/development/coding-standards.md)

## Tech Stack

| Layer    | Technology                                                   |
| -------- | ------------------------------------------------------------ |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui |
| Backend  | Node.js, Express.js, TypeScript                              |
| Database | PostgreSQL, Prisma ORM                                       |
| Cache    | Redis (ioredis)                                              |
| Queue    | BullMQ                                                       |
| Storage  | MinIO (S3-compatible)                                        |
| AI       | Groq, OpenRouter, Gemini, Ollama, HuggingFace                |
| Auth     | JWT, OAuth (Google + GitHub), RBAC                           |
| Email    | Nodemailer + Handlebars                                      |
| Infra    | Docker, Nginx, GitHub Actions                                |

---

_MicroIntern Engineering Foundation — built to scale from 0 to enterprise._

## Copyright & License

&copy; 2026 Sai Dheeraj and the Micro-Intern Team. All rights reserved.

This is a proprietary codebase. Unauthorized copying, distribution, or modification of this project, via any medium, is strictly prohibited. Please see the [LICENSE](LICENSE) file for more details.
