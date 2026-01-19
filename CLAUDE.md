# CLAUDE.md — Fullstack Boilerplate

## Overview

A modern fullstack TypeScript application built as a Turbo monorepo with:

- **Backend**: Hono API with PostgreSQL/Drizzle ORM and better-auth
- **Frontend**: Vue 3 + Vite with Nuxt UI components
- **Monorepo**: Turbo + pnpm workspaces

```
├── apps/
│   ├── api/    # Backend (Hono + PostgreSQL)
│   └── web/    # Frontend (Vue 3 + Vite)
```

## Setup & Run

**Prerequisites**: Node.js 20.19+ or 22.12+, pnpm 10.11.0

```bash
# Install dependencies
pnpm install

# Set up environment files
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your values (BETTER_AUTH_SECRET, etc.)

# Run dev servers (both API and web)
pnpm dev

# Build all apps
pnpm build

# Run API only
cd apps/api && pnpm dev

# Run web only
cd apps/web && pnpm dev
```

### Before Committing

```bash
pnpm turbo run lint --ui=stream
pnpm turbo run type-check --ui=stream
```

## References

- See `apps/api/CLAUDE.md` for backend-specific details
- See `apps/web/CLAUDE.md` for frontend-specific details
