# Getting Started

Complete setup guide for MicroIntern development.

---

## 1. System Requirements

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 20.18.x | `nvm install` (uses `.nvmrc`) |
| pnpm | 9.12.x | `corepack enable && corepack prepare` |
| Docker | 24+ | [docker.com](https://www.docker.com/) |
| Docker Compose | 2.x | Included with Docker Desktop |
| Git | 2.40+ | Included on macOS |

---

## 2. First-time Setup

```bash
# Clone
git clone git@github.com:your-org/microintern.git
cd microintern

# Activate correct Node.js version (uses .nvmrc)
nvm install && nvm use

# Install pnpm (if not already)
corepack enable

# Install all dependencies
pnpm install
```

## 3. Environment Configuration

```bash
# Copy the template
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
```

**Minimum required values** for local development:

```bash
# apps/api/.env

# Generate these secrets (run once):
# openssl rand -base64 64
JWT_ACCESS_SECRET="<generate>"
JWT_REFRESH_SECRET="<generate>"
# openssl rand -hex 32
ENCRYPTION_KEY="<generate>"

# These work out-of-the-box with docker-compose
DATABASE_URL="postgresql://microintern:microintern_pass@localhost:5432/microintern_dev"
REDIS_URL="redis://localhost:6379"
MINIO_ENDPOINT="localhost"
SMTP_HOST="localhost"
SMTP_PORT=1025

# Optional — AI providers (configure at least one)
GROQ_API_KEY="gsk_..."     # groq.com — free
GEMINI_API_KEY="AIza..."   # aistudio.google.com — free
```

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3001/api/v1"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 4. Infrastructure

```bash
# Start all services
docker compose up -d

# Verify they're healthy (~30 seconds)
docker compose ps
```

Expected output:
```
NAME                    STATUS              PORTS
microintern_postgres    healthy             0.0.0.0:5432->5432/tcp
microintern_redis       healthy             0.0.0.0:6379->6379/tcp
microintern_minio       healthy             0.0.0.0:9000-9001->9000-9001/tcp
microintern_mailhog     running             0.0.0.0:1025,8025->1025,8025/tcp
microintern_ollama      running             0.0.0.0:11434->11434/tcp
```

## 5. Database Setup

```bash
# Generate Prisma client (required before first run)
pnpm db:generate

# Run all migrations
pnpm db:migrate

# Seed development data (users, companies, trials)
pnpm db:seed
```

## 6. Start Development

```bash
# Start everything in watch mode (Turborepo parallel)
pnpm dev
```

Services available at:

| Service | URL |
|---------|-----|
| Web app | http://localhost:3000 |
| API | http://localhost:3001 |
| API Health | http://localhost:3001/health |
| MinIO Console | http://localhost:9001 (admin/admin) |
| MailHog | http://localhost:8025 |
| Prisma Studio | `pnpm db:studio` → http://localhost:5555 |

## 7. Seed Credentials

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@microintern.io | Password@123 |
| Admin | admin@microintern.io | Password@123 |
| Company Owner | owner@acme.com | Password@123 |
| Recruiter | recruiter@acme.com | Password@123 |
| Candidate | candidate@example.com | Password@123 |

## 8. Development Workflow

```bash
# Feature branch
git checkout -b feat/trial-submission-ui

# Run tests
pnpm test:unit
pnpm test:integration

# Before committing
pnpm lint
pnpm type-check

# Commit (husky + commitlint enforces format)
git commit -m "feat(trials): add submission form with file upload"

# Push
git push origin feat/trial-submission-ui
```

## 9. Troubleshooting

**"Config validation failed"** at API startup
→ Check `apps/api/.env` has all required fields. Compare with `.env.example`.

**Database connection refused**
→ `docker compose up -d postgres` and wait for health check.

**`pnpm install` fails with workspace errors**
→ Run `pnpm store prune` then retry.

**Prisma client out of date**
→ `pnpm db:generate` after any schema changes.

**TypeScript errors in VS Code**
→ Run `TypeScript: Select TypeScript Version` → `Use Workspace Version` in VS Code.
