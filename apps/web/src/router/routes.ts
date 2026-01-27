import type { RouteRecordRaw } from 'vue-router'
import DashboardLayout from '@/layouts/dashboard-layout.vue'
import DefaultLayout from '@/layouts/default-layout.vue'

export const routes: RouteRecordRaw[] = [
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
        meta: {
          requiresAuth: true,
        },
        children: [
          {
            path: '',
            name: 'home',
            component: () => import('@/pages/home.vue'),
          },
          {
            path: 'tasks',
            name: 'tasks',
            component: () => import('@/pages/home.vue'),
          },
          {
            path: 'users',
            name: 'users',
            component: () => import('@/pages/users.vue'),
            meta: {
              requiredRoles: ['admin'],
            },
          },
        ],
      },
      // 404 catch-all route (must be last)
      {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: () => import('@/pages/not-found.vue'),
      },
    ],
  },
] as const
