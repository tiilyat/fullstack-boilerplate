# GitHub Actions Environment Variables

## Current Status: ✅ No Secrets Required

The CI workflow uses **hardcoded test values** for all environment variables. You **do not need** to add any GitHub Secrets.

## Test Environment Variables

These variables are already configured in `.github/workflows/ci.yml`:

### API Tests (test-api job)

| Variable | Value | Purpose |
|----------|-------|---------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/app_test` | PostgreSQL connection string |
| `BETTER_AUTH_SECRET` | `test_secret_minimum_32_characters_long_for_ci` | Auth encryption key (32+ chars required) |
| `BETTER_AUTH_URL` | `http://localhost:8000` | Auth callback URL |
| `BETTER_AUTH_TRUSTED_ORIGINS` | `http://localhost:5173` | CORS trusted origins |
| `CORS_ALLOW_ORIGINS` | `http://localhost:5173` | API CORS allowed origins |
| `PORT` | `8000` | API server port |
| `CI` | `true` | CI environment flag (auto-set by GitHub) |

### Web Tests (test-web job)

| Variable | Value | Purpose |
|----------|-------|---------|
| `CI` | `true` | Enables headless mode in Playwright |

## When You Need Secrets (Future)

You will need to add GitHub Secrets when:

1. **Deploying to production** - Add production API keys, database URLs
2. **Using Vercel Remote Cache** - Add `TURBO_TOKEN` and `TURBO_TEAM`
3. **Integrating third-party services** - Add service API keys

## How to Add Secrets (When Needed)

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the secret name and value
5. Update `.github/workflows/ci.yml` to use the secret:

```yaml
env:
  MY_SECRET: ${{ secrets.MY_SECRET }}
```

## Security Best Practices

✅ **Good:**
- Use secrets for production credentials
- Use hardcoded values for test data
- Rotate secrets regularly
- Use least-privilege access

❌ **Bad:**
- Don't commit secrets to the repository
- Don't use production credentials in CI
- Don't share secrets in pull requests
- Don't log secret values

## Notes

- PostgreSQL credentials (`postgres/postgres`) are only used in the ephemeral service container
- Auth secret is a test value, not used in production
- All test data is isolated to the CI environment and destroyed after tests complete
