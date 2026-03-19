import apiClient from '#/lib/api-client'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export default function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: async (id) => {
      await apiClient.api.v1.tasks[':id'].$delete({
        param: {
          id,
        },
      })
    },
    onSuccess: (_data, variables) => {
      queryClient.setQueryData(['tasks'], (oldData: unknown) => {
        if (!Array.isArray(oldData)) return oldData
        return oldData.filter((task) => task.id !== variables)
      })
    },
  })
}
