import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { authClient } from '#/lib/auth'

interface BanUserParams {
  userId: string
}

export function useBanUser() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, BanUserParams>({
    mutationFn: async ({ userId }) => {
      const response = await authClient.admin.banUser({ userId })

      if (response.error) {
        throw new Error(response.error.message || 'Failed to ban user')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })
      toast.success('User banned successfully')
    },
    onError: (error) => {
      toast.error('Failed to ban user', { description: error.message })
    },
  })
}
