import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { authClient } from '@/lib/auth-client'

interface BanUserParams {
  userId: string
}

export default function useBanUser() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<void, Error, BanUserParams>({
    mutationFn: async ({ userId }) => {
      const response = await authClient.admin.banUser({
        userId,
      })

      if (response.error) {
        throw new Error(response.error.message || 'Failed to ban user')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })

      toast.add({
        title: 'User banned successfully',
        color: 'success',
        icon: 'i-lucide-circle-check',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Failed to ban user',
        description: error.message,
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    },
  })
}
