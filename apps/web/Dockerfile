# syntax=docker/dockerfile:1.7

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# MicroIntern Web — Multi-stage Dockerfile (Next.js 15)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ARG NODE_VERSION=20.18.0

FROM node:${NODE_VERSION}-alpine AS base
# Disable husky in Docker builds
ENV HUSKY=0

RUN corepack enable && corepack prepare pnpm@9.12.3 --activate
WORKDIR /app

# ── Dependencies ─────────────────────────────────────────
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml ./
COPY package.json ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
COPY apps/web/package.json ./apps/web/
RUN npm pkg delete scripts.prepare && \
    pnpm install --frozen-lockfile

# ── Build ────────────────────────────────────────────────
FROM deps AS builder
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Next.js standalone output
ARG NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN pnpm --filter @microintern/shared build
RUN pnpm --filter @microintern/web build

# ── Production Image ─────────────────────────────────────
FROM node:${NODE_VERSION}-alpine AS production
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Next.js standalone bundle (only what's needed to run)
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "apps/web/server.js"]
