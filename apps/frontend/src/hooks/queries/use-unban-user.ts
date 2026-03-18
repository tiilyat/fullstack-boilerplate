import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth'

interface UnbanUserParams {
  userId: string
}

export function useUnbanUser() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, UnbanUserParams>({
    mutationFn: async ({ userId }) => {
      const response = await authClient.admin.unbanUser({ userId })

      if (response.error) {
        throw new Error(response.error.message || 'Failed to unban user')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User unbanned successfully')
    },
    onError: (error) => {
      toast.error('Failed to unban user', { description: error.message })
    },
  })
}
