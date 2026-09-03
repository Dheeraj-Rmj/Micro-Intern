# syntax=docker/dockerfile:1.7

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MicroIntern API — Multi-stage Dockerfile
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Stages:
#   base      → shared Node.js + pnpm setup
#   deps      → install all dependencies (including dev)
#   build     → TypeScript compilation
#   prod-deps → install production-only dependencies
#   production → final lean image (~100MB vs ~400MB)
#
# Security:
#   - Non-root user (node) runs the process
#   - No dev dependencies in final image
#   - Health check built in for orchestrators
#   - Read-only filesystem compatible (logs to stdout)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARG NODE_VERSION=20.18.0

# ── Stage 1: Base ────────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS base
LABEL maintainer="MicroIntern Platform Engineering"

# Disable husky in Docker builds
ENV HUSKY=0

# Enable pnpm via corepack
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate

WORKDIR /app

# ── Stage 2: Dependencies ────────────────────────────────
FROM base AS deps

# Copy workspace manifests first (layer cache optimization)
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/

# Remove husky prepare script to prevent Alpine errors
RUN npm pkg delete scripts.prepare && \
    pnpm install --frozen-lockfile

# ── Stage 3: Build ──────────────────────────────────────
FROM deps AS build

# Copy source files
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Generate Prisma client and build database package
RUN corepack enable && corepack prepare pnpm@9.12.3 --activate && pnpm --filter @microintern/database db:generate && pnpm --filter @microintern/database build

# Build shared package first (API depends on it)
RUN pnpm --filter @microintern/shared build

# Build API
RUN pnpm --filter @microintern/api build

# ── Stage 4: Production Dependencies ────────────────────
FROM base AS prod-deps

COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/database/package.json ./packages/database/
COPY packages/config/package.json ./packages/config/
COPY apps/api/package.json ./apps/api/

# Install production dependencies only (remove husky first)
RUN npm pkg delete scripts.prepare && \
    pnpm install --frozen-lockfile --prod

# ── Stage 5: Production Image ────────────────────────────
FROM node:${NODE_VERSION}-alpine AS production

WORKDIR /app

# Security: run as non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 microintern && \
    chown -R microintern:nodejs /app

# Copy production deps
COPY --from=prod-deps --chown=microintern:nodejs /app/node_modules ./node_modules
COPY --from=prod-deps --chown=microintern:nodejs /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=prod-deps --chown=microintern:nodejs /app/packages/database/node_modules ./packages/database/node_modules

# Copy compiled output
COPY --from=build --chown=microintern:nodejs /app/packages/shared/dist ./packages/shared/dist
COPY --from=build --chown=microintern:nodejs /app/packages/database/src/generated ./packages/database/src/generated
COPY --from=build --chown=microintern:nodejs /app/apps/api/dist ./apps/api/dist

# Copy package.json files so Node.js can read "type": "module"
COPY --from=prod-deps --chown=microintern:nodejs /app/package.json ./package.json
COPY --from=prod-deps --chown=microintern:nodejs /app/apps/api/package.json ./apps/api/package.json

# Copy email templates (runtime assets)
COPY --from=build --chown=microintern:nodejs /app/apps/api/src/infrastructure/email/templates ./apps/api/dist/infrastructure/email/templates

USER microintern

EXPOSE 3001

ENV NODE_ENV=production

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3001/health/ready || exit 1

CMD ["node", "apps/api/dist/core/server.js"]
