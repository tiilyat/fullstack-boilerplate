# Web — Frontend Rules

## Stack

- **Framework**: Vue 3.5+ (Composition API)
- **Build Tool**: Vite 7.3+
- **Router**: Vue Router 4.6+
- **UI Library**: Nuxt UI 4.3+ (headless components based on Radix Vue)
- **Styling**: Tailwind CSS 4.1+ via @tailwindcss/vite
- **Language**: TypeScript 5.9+ (strict mode)
- **Auth Client**: better-auth/vue
- **Data Fetching**: TanStack Query (Vue Query) 5.92+ for server state management
- **API Client**: Hono RPC client with full type inference

## Key Directories

```
src/
├── main.ts                  # App entry point, plugins setup
├── App.vue                  # Root component
├── assets/
│   └── main.css             # Global styles, Tailwind directives
├── router/
│   └── index.ts             # Route definitions, auth guards
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

## Conventions

### Components

- **Naming**: PascalCase for component files (e.g., `UserProfile.vue`)
- **Style**: Single-file components (SFC) with `<script setup>` syntax
- **Composition API**: Use `ref`, `computed`, `watch` from Vue 3
- **Props**: Define with TypeScript interfaces + `defineProps<T>()`
- **Emits**: Define with `defineEmits<{ eventName: [payload] }>()`

### Composables

- **Naming**: camelCase, prefix with `use` (e.g., `useTasks`, `useAuth`)
- **Location**: Create in `src/composables/` directory
- **Export**: Named or default exports
- **Query Composables**: Group TanStack Query hooks in `composables/queries/`
  - One file per entity/operation (e.g., `use-tasks.ts`, `use-create-task.ts`)
  - Use `useQuery` for data fetching, `useMutation` for mutations
  - Define query keys as constants for cache management
  - Use `InferRequestType` and `InferResponseType` from Hono client for type safety. Import them from workpsace 'api'

### Routing

- **Lazy Loading**: Use `() => import()` for route components
- **Layouts**: Nest routes under layout components
- **Auth Guards**: `beforeEach` hook fetches session, redirects if unauthorized
- **Meta**: Add custom meta fields for auth requirements

### Styling

- **Primary**: Tailwind utility classes in templates
- **Global**: Only app-wide styles in `assets/main.css`
- **Scoped**: Use `<style scoped>` for component-specific CSS
- **No inline styles**: Prefer Tailwind classes over `style=""` attributes

### State Management

- **Server State**: TanStack Query for all server data (queries & mutations)
- **Auth State**: TanStack Query + better-auth composables (see `use-auth.ts`)
- **Local State**: `ref()` and `reactive()` in components
- **No Vuex/Pinia**: Composables + TanStack Query provide sufficient state management

## Configuration Files

### vite.config.ts

- Vue plugin with JSX support
- Tailwind CSS plugin
- Alias: `@/` → `src/`
- Server port: 5173 (default)

## TanStack Query Setup

### Query Pattern

```typescript
import apiClient from '@/lib/api-client'
import type { Task } from '@/types/task'
import { useQuery } from '@tanstack/vue-query'

export default function useTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await apiClient.api.v1.tasks.$get()
      return res.json()
    },
  })
}
```

### Mutation Pattern with Optimistic Updates

```typescript
import apiClient from '@/lib/api-client'
import type { InferRequestType, InferResponseType } from '@fullstack-boilerplate/api/client'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

const $post = apiClient.api.v1.tasks.$post

export default function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation<
    InferResponseType<typeof $post>,
    Error,
    InferRequestType<typeof $post>['json']
  >({
    mutationFn: async (task) => {
      const res = await $post({ json: task })
      return res.json()
    },
    onSuccess: (task) => {
      queryClient.setQueryData(['tasks'], (oldData: unknown) => {
        return Array.isArray(oldData) ? [...oldData, task.data] : [task.data]
      })
    },
  })
}
```

### Key Principles

- **Query Keys**: Use array format for hierarchical cache keys (e.g., `['tasks']`, `['auth-user']`)
- **Type Safety**: Use `InferRequestType` and `InferResponseType` from Hono client
- **Optimistic Updates**: Update cache immediately in `onSuccess` callback
- **Mutation Patterns**: Separate composables for each CRUD operation

## Hono RPC Client

### Type-Safe API Calls

The Hono RPC client provides full end-to-end type safety:

```typescript
// Infer request/response types from API routes
import type { InferRequestType, InferResponseType } from '@fullstack-boilerplate/api/client'

const $post = apiClient.api.v1.tasks.$post
type RequestType = InferRequestType<typeof $post>['json']
type ResponseType = InferResponseType<typeof $post>

// Type-safe calls
const res = await apiClient.api.v1.tasks.$get() // GET
const res = await apiClient.api.v1.tasks.$post({ json: task }) // POST
const res = await apiClient.api.v1.tasks[':id'].$put({ param: { id }, json }) // PUT
await apiClient.api.v1.tasks[':id'].$delete({ param: { id } }) // DELETE
```

## Development

### Scripts

```bash
pnpm dev           # Start Vite dev server (HMR enabled)
pnpm build         # Type-check + build for production
pnpm build-only    # Build without type-check
pnpm type-check    # Run vue-tsc for type validation
pnpm preview       # Preview production build locally
pnpm lint          # Run all linters (oxlint + eslint)
pnpm lint:oxlint   # Oxlint with --fix
pnpm lint:eslint   # ESLint with --fix and cache
pnpm format        # Prettier format src/
```

## Authentication Flow

- Auth client setup (lib/auth-client.ts)
- Route guards (router/index.ts)
- Composables for authentication (useAuth.ts)

### Component Usage

```vue
<script setup lang="ts">
import { authClient } from '@/lib/auth-client'

const { data: session } = authClient.useSession()
const signOut = () => authClient.signOut()
</script>
```

## Nuxt UI Components

### Usage Pattern

Nuxt UI components are **auto-imported globally** via the Vite plugin. No explicit imports needed:

**Note**: The `#ui/components` import pattern is Nuxt-specific and does not work with this Vite-based setup. All Nuxt UI components (`UButton`, `UCard`, `UInput`, etc.) are automatically available in templates without imports.

### Customization

- Components use Tailwind classes for styling
- Override via props or global Tailwind config
- Headless architecture allows full control

## Common Patterns

### API Calls

```typescript
// Use Hono RPC client for type-safe API calls
import apiClient from '@/lib/api-client'

const res = await apiClient.api.v1.tasks.$get()
const data = await res.json()

// For mutations, wrap in TanStack Query hooks (see composables/queries/)
```

## Adding a New Page

1. **Create component**: `src/pages/my-page.vue`
2. **Add route**: Edit `src/router/index.ts`
   ```typescript
   {
     path: '/my-page',
     component: () => import('@/pages/my-page.vue'),
     meta: { requiresAuth: true } // Optional
   }
   ```
3. **Add navigation**: Link with `<RouterLink to="/my-page">`

## Adding a New Layout

1. **Create layout**: `src/layouts/my-layout.vue`
   ```vue
   <template>
     <div class="my-layout">
       <nav><!-- navigation --></nav>
       <router-view />
       <!-- Nested route renders here -->
     </div>
   </template>
   ```
2. **Nest routes**: Use `children` in router config
   ```typescript
   {
     path: '/',
     component: () => import('@/layouts/my-layout.vue'),
     children: [
       { path: '', component: () => import('@/pages/home.vue') }
     ]
   }
   ```

## Component Patterns

### Props and Emits with TypeScript

All components use TypeScript generics for type-safe props and emits:

```vue
<script setup lang="ts">
import type { Task } from '@/types/task'

// Type-safe props
const props = defineProps<{
  task: Task
}>()

// Type-safe emits with payload types
const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
}>()

const handleToggle = () => {
  emit('toggle', props.task.id)
}
</script>
```

### Slot-based Composition

Use slots for flexible component composition:

```vue
<!-- TodoList.vue -->
<template>
  <div v-if="isLoading">Loading...</div>
  <div v-else-if="!tasks.length">No tasks</div>
  <div v-else class="space-y-2">
    <slot />
    <!-- Parent provides item rendering -->
  </div>
</template>

<!-- Usage -->
<TodoList :tasks="tasks" :is-loading="isLoading">
  <TodoItem
    v-for="task in tasks"
    :key="task.id"
    :task="task"
    @toggle="handleToggle"
  />
</TodoList>
```

### Component Organization

- **Presentational**: Components that only display data (TodoItem, TodoList)
- **Smart**: Components that fetch data and manage state (home.vue)
- **Input**: Components that handle user input (TodoInput)

## Creating TanStack Query Composables

### Query Composable (GET)

```typescript
// composables/queries/use-entity.ts
import apiClient from '@/lib/api-client'
import type { Entity } from '@/types/entity'
import { useQuery } from '@tanstack/vue-query'

export default function useEntity() {
  return useQuery<Entity[]>({
    queryKey: ['entity'],
    queryFn: async () => {
      const res = await apiClient.api.v1.entity.$get()
      return res.json()
    },
  })
}
```

### Mutation Composable (POST/PUT/DELETE)

```typescript
// composables/queries/use-create-entity.ts
import apiClient from '@/lib/api-client'
import type { InferRequestType, InferResponseType } from '@fullstack-boilerplate/api/client'
import { useMutation, useQueryClient } from '@tanstack/vue-query'

const $post = apiClient.api.v1.entity.$post

export default function useCreateEntity() {
  const queryClient = useQueryClient()
  return useMutation<
    InferResponseType<typeof $post>,
    Error,
    InferRequestType<typeof $post>['json']
  >({
    mutationFn: async (data) => {
      const res = await $post({ json: data })
      return res.json()
    },
    onSuccess: (response) => {
      // Optimistic cache update
      queryClient.setQueryData(['entity'], (oldData: unknown) => {
        return Array.isArray(oldData) ? [...oldData, response.data] : [response.data]
      })
    },
  })
}
```

### Mutation with Options (for callbacks)

```typescript
// composables/use-auth.ts pattern
export function useLoginEmail(options?: {
  onSuccess?: (user: UserType) => void
  onError?: (error: Error) => void
}) {
  return useMutation({
    mutationFn: (credentials) => authClient.signIn.email(credentials),
    onSuccess: options?.onSuccess,
    onError: options?.onError,
  })
}

// Usage in component
const login = useLoginEmail({
  onSuccess: (user) => router.push('/home'),
})
```

## Security Best Practices

- **CORS**: Ensure API allows frontend origin
- **Credentials**: Use `credentials: 'include'` for authenticated requests
- **XSS**: Vue auto-escapes template content, avoid `v-html` with user input
- **CSRF**: better-auth handles CSRF tokens automatically
- **Secrets**: Never commit API keys, use env vars if needed (prefix with `VITE_`)

## Environment Variables

- All client-side env vars must be prefixed with `VITE_`
- Use `import.meta.env.PROD` for production-specific behavior (e.g., error retry)

## Troubleshooting

**Type errors**: Run `pnpm type-check` to see all issues
**HMR not working**: Check Vite config, restart dev server
**Auth not persisting**: Verify `credentials: 'include'` in fetch calls
**Tailwind classes not applied**: Check `assets/main.css` imports directives
**Lint errors**: Run `pnpm lint:eslint --fix` and `pnpm lint:oxlint --fix`
**Import errors**: Check path aliases in vite.config.ts and tsconfig.json

## Performance Tips

- **Lazy load routes**: Use `() => import()` for code splitting
- **Debounce inputs**: Use composables or libraries like `@vueuse/core`
- **Memoize computed**: Use `computed()` for derived state
- **Virtual scrolling**: For long lists, consider `vue-virtual-scroller`
- **Image optimization**: Use responsive images, lazy loading

## References

- [Vue 3 Documentation](https://vuejs.org)
- [Vite Documentation](https://vite.dev)
- [Vue Router](https://router.vuejs.org)
- [Nuxt UI](https://ui.nuxt.com)
- [Tailwind CSS](https://tailwindcss.com)
- [better-auth](https://better-auth.com)
- [TanStack Query (Vue Query)](https://tanstack.com/query/latest/docs/framework/vue/overview)
- [Hono RPC Client](https://hono.dev/docs/guides/rpc)
