import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { AUTH_USER_KEY } from '#/hooks/use-auth'
import { authClient } from '#/lib/auth'
import { queryClient } from '#/lib/query-client'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async ({ search }) => {
    try {
      await queryClient.ensureQueryData({
        queryKey: AUTH_USER_KEY,
        queryFn: async () => {
          const res = await authClient.getSession()
          if (!res.data) throw new Error('Unauthorized')
          return res.data
        },
        staleTime: 5 * 60 * 1000,
      })
      const redirectTo = (search as { redirectTo?: string }).redirectTo
      throw redirect({ to: redirectTo || '/' })
    } catch (e) {
      if (e instanceof Error && e.message === 'Unauthorized') return
      throw e
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <Outlet />
      </div>
    </div>
  )
}
