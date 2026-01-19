import { useQueryClient } from '@tanstack/vue-query'
import { createRouter, createWebHistory, type NavigationGuardWithThis } from 'vue-router'
import { authClient, type Session } from '@/lib/auth-client'
import { routes } from './routes'

const AUTH_USER_KEY = ['auth-user'] as const

export const authGuard: NavigationGuardWithThis<undefined> = async (to) => {
  const queryClient = useQueryClient()

  let user = queryClient.getQueryData<Session | null>(AUTH_USER_KEY)

  if (!user) {
    try {
      user = await queryClient.ensureQueryData({
        queryKey: AUTH_USER_KEY,
        queryFn: async () => {
          const session = await authClient.getSession()

          if (!session.data) {
            throw new Error('Unauthorized')
          }

          return session.data
        },
        staleTime: 1000 * 60 * 5,
      })
    } catch {
      user = null
    }
  }

  const isAuthenticated = !!user

  if (to.meta.requiresAuth && !isAuthenticated) {
    // Redirect to login page with return URL
    return {
      name: 'sign-in',
      query: { redirectTo: to.fullPath },
    }
  }

  if (isAuthenticated && to.path.startsWith('/auth')) {
    const redirectTo = to.query.redirectTo
    if (typeof redirectTo === 'string' && redirectTo !== to.path) {
      return { path: redirectTo }
    }
    return {
      name: 'home',
    }
  }

  return true
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach(authGuard)

export default router
