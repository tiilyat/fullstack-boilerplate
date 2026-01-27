import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { authClient } from '@/lib/auth-client'

interface UnbanUserParams {
  userId: string
}

export default function useUnbanUser() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<void, Error, UnbanUserParams>({
    mutationFn: async ({ userId }) => {
      const response = await authClient.admin.unbanUser({
        userId,
      })

      if (response.error) {
        throw new Error(response.error.message || 'Failed to unban user')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })

      toast.add({
        title: 'User unbanned successfully',
        color: 'success',
        icon: 'i-lucide-circle-check',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Failed to unban user',
        description: error.message,
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    },
  })
}
