## Stack

- **Framework**: Vue 3.5 (Composition API)
- **Build Tool**: Vite 7
- **Router**: Vue Router 4
- **UI Library**: Nuxt UI 4
- **Styling**: Tailwind CSS 4.1
- **Language**: TypeScript 5.9 (strict mode)
- **Auth Client**: better-auth/vue
- **Data Fetching**: TanStack Query (Vue Query) 5.92+ for server state management
- **API Client**: Hono RPC client with full type inference

## Commands

```bash
pnpm dev           # Start Vite dev server (HMR enabled)
pnpm build         # Type-check + build for production
pnpm build-only    # Build without type-check
pnpm type-check    # Run vue-tsc for type validation
pnpm preview       # Preview production build locally
pnpm lint          # Run all linters (oxlint + eslint)
```

## Structure

```
src/
├── main.ts                  # App entry point, plugins setup
├── App.vue                  # Root component
├── assets/
│   └── main.css             # Global styles, Tailwind directives
├── router/
│   └── routes.ts            # Route definitions
|   └── index.ts             # Router instance setup
├── pages/                   # Route components (lazy-loaded)
├── components/              # Reusable UI components
├── composables/             # Shared composition logic
│   └── queries/             # TanStack Query hooks
├── types/                   # TypeScript type definitions
├── layouts/                 # Layout wrappers
└── lib/                     # External library configurations
    ├── auth-client.ts       # better-auth client instance
    ├── api-client.ts        # Hono RPC client with credentials
    └── vue-query.ts         # TanStack Query client config
```
