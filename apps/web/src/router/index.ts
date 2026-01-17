import { useQueryClient } from '@tanstack/vue-query'
import { createRouter, createWebHistory } from 'vue-router'
import DashboardLayout from '@/layouts/dashboard-layout.vue'
import DefaultLayout from '@/layouts/default-layout.vue'
import { authClient, type Session } from '@/lib/auth-client'

const AUTH_USER_KEY = ['auth-user'] as const

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: DefaultLayout,
      children: [
        {
          path: '/auth',
          name: 'auth',
          children: [
            {
              path: '',
              name: 'sign-in',
              component: () => import('@/pages/auth/sign-in.vue'),
            },
            {
              path: 'sign-up',
              name: 'sign-up',
              component: () => import('@/pages/auth/sign-up.vue'),
            },
          ],
        },
        {
          path: '',
          component: DashboardLayout,
          meta: { requiresAuth: true },
          children: [
            {
              path: '',
              name: 'home',
              component: () => import('@/pages/home.vue'),
            },
          ],
        },
      ],
    },
  ],
})

router.beforeEach(async (to) => {
  const queryClient = useQueryClient()

  let user = queryClient.getQueryData<Session | null>(AUTH_USER_KEY)

  if (user === undefined) {
    try {
      user = await queryClient.ensureQueryData({
        queryKey: AUTH_USER_KEY,
        queryFn: async () => {
          const session = await authClient.getSession()
          return session.data
        },
        staleTime: 1000 * 60 * 5,
      })
    } catch {
      user = null
    }
  }

  const isAuthenticated = !!user

  if (to.meta.requiresRole && isAuthenticated && user) {
    return {
      name: 'home',
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
})

export default router
