import { useQueryClient } from '@tanstack/vue-query'
import { createRouter, createWebHistory, type NavigationGuardWithThis } from 'vue-router'
import { authClient, type Session } from '@/lib/auth-client'
import { routes } from './routes'

const AUTH_USER_KEY = ['auth-user'] as const

async function getAuthUser() {
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

  return user
}

function hasRequiredRole(user: Session | null, requiredRoles?: string[]) {
  if (!requiredRoles || requiredRoles.length === 0) return true
  return user?.user?.role ? requiredRoles.includes(user.user.role) : false
}

export const authGuard: NavigationGuardWithThis<undefined> = async (to) => {
  const user = await getAuthUser()
  const isAuthenticated = !!user

  // Redirect authenticated users away from auth pages
  if (isAuthenticated && to.path.startsWith('/auth')) {
    const redirectTo = to.query.redirectTo
    if (typeof redirectTo === 'string' && redirectTo !== to.path) {
      return { path: redirectTo }
    }
    return { name: 'home' }
  }

  // Check auth and role requirements
  if (to.meta.requiresAuth || to.meta.requiredRoles) {
    if (!isAuthenticated) {
      return {
        name: 'sign-in',
        query: { redirectTo: to.fullPath },
      }
    }

    if (!hasRequiredRole(user, to.meta.requiredRoles as string[] | undefined)) {
      return { name: 'NotFound' }
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
