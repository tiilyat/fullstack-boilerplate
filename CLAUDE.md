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
pnpm lint:fix --ui=stream
pnpm type-check --ui=stream
```

## Issue Tracking

This project uses bd (beads) for issue tracking.
Run bd prime for workflow context.

Quick reference:

- bd ready - Find unblocked work
- bd create "Title" --type task --priority 2 - Create issue
- bd close <id> - Complete work
- bd sync - Sync with git (run at session end)

For full workflow details: bd prime

## Landing the Plane (Session Completion)

**When ending a work session**, you MUST complete ALL steps below. Work is NOT complete until `git push` succeeds.

**MANDATORY WORKFLOW:**

1. **File issues for remaining work** - Create issues for anything that needs follow-up
2. **Run quality gates** (if code changed) - Tests, linters, builds
3. **Update issue status** - Close finished work, update in-progress items
4. **PUSH TO REMOTE** - This is MANDATORY:
   ```bash
   git pull --rebase
   bd sync
   git push
   git status  # MUST show "up to date with origin"
   ```
5. **Clean up** - Clear stashes, prune remote branches
6. **Verify** - All changes committed AND pushed
7. **Hand off** - Provide context for next session

**CRITICAL RULES:**

- Work is NOT complete until `git push` succeeds
- NEVER stop before pushing - that leaves work stranded locally
- NEVER say "ready to push when you are" - YOU must push
- If push fails, resolve and retry until it succeeds

## References

- See `apps/api/CLAUDE.md` for backend-specific details
- See `apps/web/CLAUDE.md` for frontend-specific details
