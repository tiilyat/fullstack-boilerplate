import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient from '@/lib/api-client'

export default function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.api.v1.tasks[':id'].$delete({ param: { id } })
    },
    onSuccess: async (_, variables) => {
      queryClient.setQueryData(['tasks'], (oldData) => {
        if (!Array.isArray(oldData)) return oldData
        return oldData.filter((task) => task.id !== variables)
      })
    },
  })
}
