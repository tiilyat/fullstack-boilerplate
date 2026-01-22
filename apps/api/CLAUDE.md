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
└── module/
    ├── module.routes.ts       # Module route definitions
    ├── module.controllers.ts  # Request/response handlers
    ├── module.service.ts      # Business logic
    ├── module.storage.ts      # Database queries
    ├── module.schemas.ts      # Zod schemas
    └── module.types.ts        # TypeScript types
```

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

## Further read

- `.agent_docs/testing.md` - writing new tests, testing strategies

## References

- [Hono Documentation](https://hono.dev/llms.txt)
- [Drizzle ORM](https://orm.drizzle.team/llms.txt)
- [better-auth](https://www.better-auth.com/llms.txt)
- [Zod](https://zod.dev/llms.txt)
