import type { UserWithRole as BaUserWithRole } from 'better-auth/client/plugins'
import { adminClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
  plugins: [adminClient()],
})

export type Session = typeof authClient.$Infer.Session
export type UserWithRole = BaUserWithRole
