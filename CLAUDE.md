# CLAUDE.md — Fullstack Boilerplate

## Overview

A modern fullstack TypeScript Todo application built as a Turbo monorepo with:

- **Backend**: Hono API with SQLite/Drizzle ORM and better-auth
- **Frontend**: Vue 3 + Vite with Nuxt UI components
- **Monorepo**: Turbo + pnpm workspaces

```
├── apps/
│   ├── api/    # Backend (Hono + SQLite)
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

## Code Style & Conventions

### General

- **Language**: TypeScript 5.9+ in strict mode
- **Package Manager**: pnpm (not npm/yarn)
- **Validation**: Zod schemas for all API inputs and env vars
- **Commit Style**: Conventional Commits recommended

### Frontend (apps/web)

- **Linting**: Oxlint (primary) + ESLint
- **Formatting**: Prettier (no semicolons, single quotes, 100 char width)
- **Components**: Vue 3 Composition API, single-file components
- **UI Library**: Nuxt UI components (headless, customizable)
- **Naming**: PascalCase for components, camelCase for composables

### Backend (apps/api)

- **Framework**: Hono for routing and middleware
- **Architecture**: Layered (Controllers → Service → Storage)
- **Database**: Drizzle ORM with type-safe queries
- **Auth**: better-auth with session-based authentication

## Workflow

### Adding a New Feature

1. **Backend**: Create route → controller → service → storage layer
2. **Frontend**: Add page/component → wire up auth-client calls
3. **Validation**: Define Zod schemas in both API and frontend
4. **Types**: Export types from API, import in frontend for type safety

### Before Committing

```bash
pnpm turbo run format --ui=stream
pnpm turbo run lint --ui=stream
pnpm turbo run type-check --ui=stream
```

## References

- See `apps/api/CLAUDE.md` for backend-specific details
- See `apps/web/CLAUDE.md` for frontend-specific details
