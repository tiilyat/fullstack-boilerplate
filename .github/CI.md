# CI/CD Documentation

## Overview

This project uses GitHub Actions for continuous integration. The workflow runs on every pull request and push to the `main` branch.

## Workflow Structure

The CI workflow consists of 4 parallel jobs:

1. **Lint** - Code quality checks with Biome
2. **Type Check** - TypeScript type validation
3. **Test API** - Backend tests with PostgreSQL
4. **Test Web** - Frontend browser tests with Playwright

## Jobs Details

### 1. Lint (~ 10 seconds)

Runs Biome linter across all workspaces.

```bash
pnpm turbo run lint --ui=stream
```

**Local testing:**
```bash
pnpm turbo run lint
```

### 2. Type Check (~ 15 seconds)

Validates TypeScript types in all applications.

```bash
pnpm turbo run type-check --ui=stream
```

**Local testing:**
```bash
pnpm turbo run type-check
```

### 3. Test API (~ 30 seconds)

Runs API tests against a real PostgreSQL database.

**Steps:**
1. Start PostgreSQL service container
2. Run Drizzle migrations
3. Execute Vitest tests (e2e + unit)

**Environment variables:**
- `DATABASE_URL`: `postgresql://postgres:postgres@localhost:5432/app_test`
- `BETTER_AUTH_SECRET`: Test auth key (32+ characters)
- `BETTER_AUTH_URL`: `http://localhost:8000`
- `CORS_ALLOW_ORIGINS`: `http://localhost:5173`

**Local testing with Docker:**
```bash
# Start PostgreSQL
docker run -d --name postgres-test \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=app_test \
  -p 5432:5432 \
  postgres:17-alpine

# Run migrations and tests
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_test
cd apps/api
pnpm migration:migrate
pnpm test

# Cleanup
docker stop postgres-test && docker rm postgres-test
```

### 4. Test Web (~ 45 seconds)

Runs browser tests using Playwright in headless mode.

**Steps:**
1. Install Playwright Chromium browser
2. Run Vitest browser tests
3. Upload test results on failure

**Environment variables:**
- `CI`: `true` (enables headless mode)

**Local testing:**
```bash
cd apps/web
pnpm test
```

## Caching Strategy

The workflow uses multi-layer caching for optimal performance:

1. **pnpm store cache** - Package manager cache (built into `actions/setup-node`)
2. **Turbo cache** - Build outputs and test results per job

**Expected times:**
- First run: ~2 minutes
- Cached runs: ~1 minute

## Environment Variables

### Required in CI

**None!** The workflow uses hardcoded test values. No GitHub Secrets needed.

### Optional (for future enhancements)

- `TURBO_TOKEN` - Vercel Remote Cache token
- `TURBO_TEAM` - Vercel team slug

## Troubleshooting

### Tests failing locally but passing in CI

Check that you're using the same Node.js version:
```bash
node --version  # Should be 22.x
```

### PostgreSQL connection errors

Ensure PostgreSQL is running:
```bash
docker ps | grep postgres
```

### Playwright installation issues

Reinstall Playwright browsers:
```bash
cd apps/web
pnpm exec playwright install --with-deps chromium
```

### Cache issues

Clear local cache:
```bash
rm -rf .turbo apps/*/.turbo node_modules/.cache
```

## Performance Optimization

### Current execution times (cached)

- Lint: ~10s
- Type Check: ~15s
- Test API: ~30s (migrations: 5s, tests: 25s)
- Test Web: ~45s (Playwright install: 20s, tests: 25s)
- **Total (parallel): ~1 minute**

### Future optimizations

1. **Playwright caching** - Cache browser binaries (~500MB)
2. **Turborepo remote cache** - Share cache across developers
3. **Test sharding** - Split large test suites into parallel jobs

## Scaling Recommendations

### When you have 5-10 apps

- Keep current structure (simple, clear)
- Add job-level filters: `--filter=@scope/{api,web,mobile}`

### When you have 10-20 apps

- Split into multiple workflows: `ci-quality.yml`, `ci-tests.yml`
- Enable Turborepo remote cache (Vercel)
- Add matrix strategy for test jobs

### When you have 20+ apps

- Use Turborepo Remote Cache or Nx Cloud
- Implement affected-only testing: `turbo run test --filter=[origin/main]`
- Add test sharding: `vitest run --shard 1/4`

## Local Development Tips

### Run all CI checks locally

```bash
pnpm turbo run lint type-check test --ui=stream
```

### Run individual checks

```bash
pnpm turbo run lint
pnpm turbo run type-check
pnpm turbo run test --filter=@fullstack-boilerplate/api
cd apps/web && pnpm test
```

### Pre-commit hooks

The project uses Husky to run lint and type-check before commits:

```bash
# .husky/pre-commit
pnpm turbo run lint --ui=stream
pnpm turbo run type-check --ui=stream
```

## CI Status Badge

Add to your README.md:

```markdown
![CI](https://github.com/<your-username>/<repo-name>/workflows/CI/badge.svg)
```

## Contact

For CI/CD issues, please open an issue on GitHub or contact the DevOps team.
