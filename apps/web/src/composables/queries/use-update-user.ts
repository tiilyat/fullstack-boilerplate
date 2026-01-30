import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { authClient } from '@/lib/auth-client'

interface UpdateUserParams {
  userId: string
  data: {
    name?: string
  }
}

export default function useUpdateUser() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation<void, Error, UpdateUserParams>({
    mutationFn: async ({ userId, data }) => {
      const response = await authClient.admin.updateUser({
        userId,
        data,
      })

      if (response.error) {
        throw new Error(response.error.message || 'Failed to update user')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] })

      toast.add({
        title: 'User updated successfully',
        color: 'success',
        icon: 'i-lucide-circle-check',
      })
    },
    onError: (error) => {
      toast.add({
        title: 'Failed to update user',
        description: error.message,
        color: 'error',
        icon: 'i-lucide-alert-circle',
      })
    },
  })
}
