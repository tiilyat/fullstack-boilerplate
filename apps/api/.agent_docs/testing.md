# Testing Patterns

## Running Tests

```bash
pnpm test          # Run all tests (e2e + unit)
pnpm test:e2e      # Run only e2e tests
pnpm test:unit     # Run only unit tests
```

**Important:** Always run tests after making changes to the codebase to ensure nothing is broken.

## Testing Philosophy

**No Mocks:** Tests should validate the entire user journey without mocks. Test against real database, authentication, and API endpoints to ensure everything works together.

**Unit Tests:** Unit tests for utilities and helpers are allowed and should be placed in `tests/unit/` directory.

## Test Directory Structure

```
tests/
├── e2e/                    # End-to-end integration tests (no mocks)
│   ├── setup.ts            # Database cleanup, global hooks
│   └── {module}/           # Tests grouped by module
│       ├── {module}-create.test.ts
│       ├── {module}-read.test.ts
│       ├── {module}-update.test.ts
│       └── {module}-delete.test.ts
├── unit/                   # Unit tests for utilities and helpers
├── utils/                  # Test helpers
│   ├── test-client.ts      # Hono RPC test client
│   ├── create-authenticated-user.ts
│   └── extract-session-token.ts
└── fixtures/               # Test data
```

## Test Client Setup

Use Hono's built-in test client with type inference.

See implementation: `tests/utils/test-client.ts`

## Authentication Helper

Pattern for creating authenticated test users with better-auth.

See implementation: `tests/utils/create-authenticated-user.ts`

Usage in tests:

```typescript
import { createAuthenticatedUser } from "../../utils/create-authenticated-user.js";

let authHeaders: Record<string, string>;

beforeAll(async () => {
  const auth = await createAuthenticatedUser();
  authHeaders = auth.authHeaders;
});
```

## Database Cleanup

The database is automatically cleaned before all tests run via the setup file (`tests/e2e/setup.ts`), ensuring test isolation across all test suites.

## Error Status Code Testing

**Critical Pattern:** The Hono test client returns Response objects with error status codes (400, 401, 404, etc.) - it does **NOT** throw exceptions. Always check `response.status` directly.

```typescript
const res = await testClient.api.v1.tasks[":id"].$delete({
  param: { id: nonExistentId },
});
expect(res.status).toBe(404);
```

**Common error codes:**

- `400` - Validation error (Zod validation fails)
- `401` - Authentication missing or invalid (better-auth)
- `404` - Resource not found (Drizzle ORM query returns null)
- `422` - Semantic/business logic error (e.g., empty update body)

**Note:** Only the promise itself rejects (network error, etc.). API errors always return Response objects with appropriate status codes.

## Snapshot Testing

Use snapshot testing to validate API response structure and catch breaking changes.

### Pattern: Snapshot Testing with Dynamic Data

API responses often contain dynamic values (timestamps, UUIDs, user IDs). Use property matchers to ignore these fields while validating the structure:

```typescript
test("should return task with correct structure", async () => {
  const res = await testClient.api.v1.tasks[":id"].$get(
    { param: { id: taskId } },
    { headers: authHeaders },
  );

  expect(res.status).toBe(200);
  const json = await res.json();
  expect(json.data).toMatchSnapshot({
    id: expect.any(String),
    userId: expect.any(String),
    createdAt: expect.any(String),
    updatedAt: expect.any(String),
  });
});
```

This captures the structure while ignoring dynamic values:

- Static fields (`title`, `description`, `completed`) are compared exactly
- Dynamic fields use `Any<String>` matcher in the snapshot

### Updating Snapshots

When intentionally changing response structure, update snapshots with:

```bash
pnpm test -u  # Update all snapshots
pnpm test tasks-read.test.ts -u  # Update specific test file
```

### When to Use Snapshots

**Use for:**

- Structure validation tests
- Catching missing/extra fields in API responses
- Documenting expected response format

**Don't use for:**

- Tests that validate exact values (use regular assertions instead)
- Responses that are entirely dynamic
