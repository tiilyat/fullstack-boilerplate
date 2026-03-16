# Testing Patterns

## Unit vs Integration Tests for UI Components

When testing components that use Nuxt UI wrappers (USlideover, UModal, etc.):

- **Integration tests** (`tests/integrations/`): Test interaction flows — opening/closing via user actions, dropdown menu → component transitions. These require `createTestApp()` with full app context.
- **Unit tests** (`tests/unit/components/`): Test content rendering — sections, conditional logic, data display, edge cases. Use `renderComponent()` for fast, isolated testing.

**Why:** Nuxt UI components (e.g. USlideover) rely on app-level context for behaviors like Escape-to-close. `renderComponent()` doesn't provide this, so interaction tests must stay in integration tests.

## MSW Setup for API Interactions

**Critical:** If your test involves API calls (components using TanStack Query, fetch, or any HTTP requests), you **MUST** use the extended test function from `test-extend.server.ts`:

```ts
import { test } from '../../utils/test-extend.server'

test('my test with API calls', async ({ worker }) => {
  // worker is MSW worker instance, pre-configured and ready to use
  worker.use(
    http.get('/api/users', () => {
      return HttpResponse.json({ users: [...] })
    })
  )

  // Your test code...
})
```

**Why:** The extended test automatically sets up and tears down Mock Service Worker (MSW), which intercepts HTTP requests in tests. Without it, real API calls will be attempted and tests will fail.

**Don't use** the standard `test` from vitest for tests with API interactions — always import from `test-extend.server.ts`.

## Playwright Strict Mode Gotchas

`page.getByText('-')` will match elements containing dashes anywhere (e.g. UUIDs like `b611c7fa-48b1-42d2-...`). For short single-character or ambiguous strings, always use `{ exact: true }`:

```ts
// BAD - matches UUID text nodes containing dashes
await expect.element(page.getByText('-')).toBeInTheDocument()

// GOOD - matches only exact "-" text content
await expect.element(page.getByText('-', { exact: true })).toBeInTheDocument()
```

Similarly, use `.nth(N)` when a string appears in both the page table and a slideover/modal.
