# MicroIntern

> **Enterprise AI-Powered Skill Evaluation Platform**
>
> MicroIntern replaces traditional resume-based hiring with real-world, AI-evaluated skill trials. Built for enterprise scale, this platform empowers companies to identify top engineering talent through objective, automated assessments.

![License: Proprietary](https://img.shields.io/badge/License-Proprietary-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)
![pnpm](https://img.shields.io/badge/pnpm-9.x-orange.svg)
![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)

---

## Architecture Overview

**MicroIntern** follows a modular monolith approach transitioning towards Clean Architecture and Domain-Driven Design (DDD). The repository is managed as a `pnpm` workspace powered by Turborepo.

### Core Structure

- `apps/api`: High-performance REST API built with Express and TypeScript.
- `apps/web`: Multi-portal frontend powered by Next.js 15 and React 19.
- `packages/shared`: Shared domain types, DTOs, schemas, and constants.
- `packages/database`: Prisma ORM schemas, migrations, and seed logic.
- `packages/config`: Centralized configurations for ESLint, Prettier, and TypeScript.
- `infrastructure`: Docker Compose configurations and NGINX reverse proxies.

---

## Technology Stack

The platform is built on a modern, scalable technology stack:

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS v4, shadcn/ui
- **Backend**: Node.js, Express.js, TypeScript
- **Database & Cache**: PostgreSQL, Prisma ORM, Redis (ioredis)
- **Message Broker**: BullMQ
- **Object Storage**: MinIO (S3-Compatible)
- **AI Integration**: Groq, OpenRouter, Gemini, Ollama, HuggingFace
- **Authentication**: JWT, OAuth (Google, GitHub), RBAC
- **Infrastructure**: Docker, Nginx, GitHub Actions

---

## Getting Started

To set up the development environment, ensure you have the following prerequisites installed:

- **Node.js**: v20.18.x (refer to `.nvmrc`)
- **pnpm**: v9.12.x
- **Docker & Docker Compose**: v24+

### Local Setup

1. **Clone the repository and install dependencies:**

   ```bash
   nvm use
   pnpm install
   ```

2. **Configure Environment Variables:**

   ```bash
   cp .env.example apps/api/.env
   # Ensure you populate the required API keys (e.g., GROQ_API_KEY, JWT_ACCESS_SECRET)
   ```

3. **Start Infrastructure & Development Servers:**
   ```bash
   docker compose up -d
   pnpm db:generate && pnpm db:migrate && pnpm db:seed
   pnpm dev
   ```

For detailed setup instructions, please refer to the [Getting Started Guide](docs/development/getting-started.md).

---

## Portals

The application serves multiple distinct user roles through dedicated portals:

- **Candidate Portal** (`/`): Job seekers completing and reviewing skill trials.
- **Company Portal** (`/company`): Companies creating trials and evaluating candidates.
- **Recruiter Portal** (`/recruiter`): Recruiters managing candidate pipelines.
- **Admin Portal** (`/admin`): System administrators operating the platform.

---

## Development Commands

We use Turborepo to orchestrate tasks across the workspace. Common commands include:

- `pnpm dev`: Start all development servers
- `pnpm build`: Build all packages and applications for production
- `pnpm test`: Execute all test suites
- `pnpm lint`: Run ESLint across all packages
- `pnpm format`: Format codebase using Prettier
- `pnpm db:migrate`: Apply pending database migrations
- `pnpm clean`: Clean up build artifacts

---

## Documentation References

Comprehensive documentation can be found in the `/docs` directory:

- [Architecture Vision & Foundation](docs/architecture/vision-and-foundation.md)
- [Architecture Overview](docs/architecture/overview.md)
- [API Standards](docs/api/standards.md)
- [Getting Started](docs/development/getting-started.md)
- [Contributing Guide](docs/development/contributing.md)
- [Coding Standards](docs/development/coding-standards.md)

---

## Copyright & License

&copy; 2026 Sai Dheeraj and the Micro-Intern Team. All rights reserved.

This is a **proprietary codebase**. Unauthorized copying, distribution, or modification of this project, via any medium, is strictly prohibited. For more information, please see the [LICENSE](LICENSE) file.
