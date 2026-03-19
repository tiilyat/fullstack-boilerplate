import { createFileRoute, redirect } from '@tanstack/react-router'

import { AUTH_USER_KEY } from '#/hooks/use-auth'
import { authClient } from '#/lib/auth'
import { queryClient } from '#/lib/query-client'
import { DashboardLayout } from '#/components/dashboard-layout'

export const Route = createFileRoute('/_dashboard')({
  beforeLoad: async ({ location }) => {
    try {
      const session = await queryClient.ensureQueryData({
        queryKey: AUTH_USER_KEY,
        queryFn: async () => {
          const res = await authClient.getSession()
          if (!res.data) throw new Error('Unauthorized')
          return res.data
        },
        staleTime: 5 * 60 * 1000,
      })
      return { session }
    } catch {
      throw redirect({ to: '/sign-in', search: { redirectTo: location.href } })
    }
  },
  component: DashboardLayoutRoute,
})

function DashboardLayoutRoute() {
  return <DashboardLayout />
}
