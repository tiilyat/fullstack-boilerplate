import type { InferRequestType, InferResponseType } from '@fullstack-boilerplate/api/client'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient from '@/lib/api-client'
import type { Task } from '@/types/task'

const $put = apiClient.api.v1.tasks[':id'].$put

export default function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation<
    InferResponseType<typeof $put>,
    Error,
    { id: string; json: InferRequestType<typeof $put>['json'] }
  >({
    mutationFn: async ({ id, json }) => {
      const res = await $put({ param: { id }, json })
      return res.json()
    },
    onSuccess: (task) => {
      if (!('data' in task)) {
        return
      }

      queryClient.setQueryData(['tasks'], (oldData: Task[]) => {
        return oldData.map((t) => (t.id === task.data.id ? task.data : t))
      })
    },
  })
}
