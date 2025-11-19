# DSIM Monorepo

DSIM (동상일몽) is a travel companion matching service built with a pnpm-based monorepo. The repository houses a Next.js frontend, a Nest.js backend, and a shared workspace for cross-cutting types and utilities.

## Workspaces

- `apps/frontend`: Next.js 15 App Router application styled with TailwindCSS.
- `apps/backend`: Nest.js API server prepared for PostgreSQL integrations.
- `packages/shared`: Shared TypeScript types and helpers consumed by both frontend and backend.

## Getting Started

```bash
pnpm install
pnpm --filter frontend dev     # Start Next.js locally
pnpm --filter backend start:dev # Start Nest.js with hot reload
```

Create `.env` files inside the respective apps before running local development. Each service reads configuration from `.env.local` (frontend) or `.env` (backend).
