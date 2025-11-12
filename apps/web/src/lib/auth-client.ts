import { createAuthClient } from 'better-auth/vue'
export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL,
})

export type Session = typeof authClient.$Infer.Session
