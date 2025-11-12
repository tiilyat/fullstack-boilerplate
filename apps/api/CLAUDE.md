# API — Backend Rules

## Stack

- **Framework**: Hono 4.11+ (lightweight, edge-first web framework)
- **Runtime**: Node.js with @hono/node-server
- **Database**: PostgreSQL with Drizzle ORM 0.45+
- **Auth**: better-auth 1.4+ with session-based authentication
- **Validation**: Zod 4.3+ schemas via @hono/zod-validator
- **Language**: TypeScript 5.9+ (strict mode)

## Key Directories

```
src/
├── index.ts              # Entry point, env validation, server startup
├── server.ts             # Hono app, middleware, route registration
├── db/
│   ├── db.ts             # Drizzle client setup
│   └── schema.ts         # Database schema definitions
├── lib/
│   ├── auth.ts           # better-auth configuration
│   └── env.ts            # Environment variable validation
├── middleware/
│   └── auth.middleware.ts # Auth middleware for protected routes
└── tasks/
    ├── tasks.routes.ts       # Task route definitions
    ├── tasks.controllers.ts  # Request/response handlers
    ├── tasks.service.ts      # Business logic
    ├── tasks.storage.ts      # Database queries
    ├── tasks.schemas.ts      # Zod schemas
    └── tasks.types.ts        # TypeScript types
```

## Conventions

### Architecture Pattern: Layered

**Flow**: Route → Controller → Service → Storage → Database

1. **Routes** (`*.routes.ts`): Define HTTP endpoints and wire up controllers
2. **Controllers** (`*.controllers.ts`): Handle HTTP request/response, validation
3. **Service** (`*.service.ts`): Business logic, orchestration
4. **Storage** (`*.storage.ts`): Data access layer with Drizzle queries
5. **Schemas** (`*.schemas.ts`): Zod validation schemas
6. **Types** (`*.types.ts`): TypeScript type definitions

### Dependency Injection

```typescript
// Example: tasks.routes.ts
const taskStorage = createTaskStorage(db)
const taskService = createTaskService(taskStorage)
const taskController = createTaskController(taskService)
```

### Request Validation

Use Zod schemas with @hono/zod-validator:

```typescript
import { zValidator } from '@hono/zod-validator'
import { createTaskSchema } from './tasks.schemas'

router.post('/', zValidator('json', createTaskSchema), controller.create)
```

### Error Handling

Return appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad request (validation errors)
- `401` - Unauthorized
- `404` - Not found
- `500` - Internal server error

### Authentication

Protected routes require auth middleware:

```typescript
import { authMiddleware } from '../middleware/auth.middleware'

router.use('/*', authMiddleware) // Protect all routes
router.post('/', controller.create) // Requires auth
```

Access user from context:

```typescript
const user = c.get('user') // Set by authMiddleware
```

## Configuration Files

### tsconfig.json

- **Target**: ESNext
- **Module**: NodeNext (ES modules with .js extensions)
- **Strict**: true

### drizzle.config.ts

- **Driver**: pg (PostgreSQL)
- **Connection**: From `DATABASE_URL` env var
- **Schema**: `./src/db/schema.ts`
- **Migrations**: `./drizzle` directory

### Environment Variables (.env)

Required variables (see .env.example):

```bash
PORT=8000                           # API server port
BETTER_AUTH_SECRET=<32+ chars>      # Auth encryption key
BETTER_AUTH_URL=http://localhost:8000 # Auth callback URL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app       # SQLite database file
CORS_ALLOW_ORIGINS=http://localhost:5173
```

## Development

### Scripts

```bash
pnpm dev          # Watch mode with hot reload (tsx + tsc)
pnpm build        # Compile TypeScript to dist/
pnpm start        # Run production build
pnpm type-check   # Type check without build
pnpm lint       # Lint code
pnpm format     # Format code
```

### Database Migrations

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate

# Apply pending migrations
pnpm drizzle-kit migrate
```

### Adding a New Feature

1. **Create directory**: `src/[feature]/`
2. **Define schema**: `[feature].schemas.ts` (Zod validation)
3. **Define types**: `[feature].types.ts` (TypeScript types)
4. **Add DB tables**: Update `src/db/schema.ts`, run `drizzle-kit generate`
5. **Create storage**: `[feature].storage.ts` (Drizzle queries)
6. **Create service**: `[feature].service.ts` (business logic)
7. **Create controllers**: `[feature].controllers.ts` (HTTP handlers)
8. **Create routes**: `[feature].routes.ts` (wire everything together)
9. **Register routes**: Import and mount in `src/server.ts`

## Security Best Practices

### Middleware Stack (Applied in Order)

1. Rate limiting (100 requests per 15 minutes)
2. CORS (whitelist from CORS_ALLOW_ORIGINS)
3. Security headers (CSP, HSTS, X-Frame-Options, etc.)
4. Body limit (50KB max)
5. Auth middleware (on protected routes)

### Input Validation

- **Always use Zod schemas** for request bodies, params, query strings
- **Never trust user input** - validate everything
- **Sanitize outputs** when returning user-generated content

### Authentication

- Sessions stored in database (not JWTs)
- CSRF protection via better-auth
- Secure cookie settings (httpOnly, sameSite, secure in prod)

### Database

- Use parameterized queries (Drizzle handles this)
- Never concatenate user input into SQL
- Apply proper indexes for performance

## Common Patterns

### Controller Pattern

```typescript
export const createTaskController = (service: TaskService) => ({
  async create(c: Context) {
    const user = c.get('user')
    const body = c.req.valid('json')
    const task = await service.createTask(user.id, body)
    return c.json(task, 201)
  },
})
```

### Service Pattern

```typescript
export const createTaskService = (storage: TaskStorage) => ({
  async createTask(userId: string, data: CreateTaskInput) {
    // Business logic here
    return storage.createTask({ ...data, userId })
  },
})
```

### Storage Pattern

```typescript
export const createTaskStorage = (db: Database) => ({
  async createTask(data: InsertTask) {
    const [task] = await db.insert(taskTable).values(data).returning()
    return task
  },
})
```

## Testing

- Tests not yet implemented
- Recommended: Vitest with supertest for API testing
- Test structure: `src/[feature]/__tests__/[feature].test.ts`

## Troubleshooting

**Type errors with Drizzle**: Run `pnpm drizzle-kit generate` after schema changes
**Auth not working**: Check BETTER_AUTH_SECRET is set and 32+ characters
**CORS errors**: Verify frontend URL is in CORS_ALLOW_ORIGINS
**Database locked**: Close other connections, SQLite allows only one writer
**Port in use**: Change PORT in .env file

## References

- [Hono Documentation](https://hono.dev/llms.txt)
- [Drizzle ORM](https://orm.drizzle.team/llms.txt)
- [better-auth](https://www.better-auth.com/llms.txt)
- [Zod](https://zod.dev/llms.txt)
