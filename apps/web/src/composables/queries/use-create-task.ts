import type { InferRequestType, InferResponseType } from '@fullstack-boilerplate/api/client'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import apiClient from '@/lib/api-client'

const $post = apiClient.api.v1.tasks.$post

export default function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation<InferResponseType<typeof $post>, Error, InferRequestType<typeof $post>['json']>({
    mutationFn: async (task) => {
      const res = await $post({
        json: task,
      })
      return res.json()
    },
    onSuccess: (task) => {
      queryClient.setQueryData(['tasks'], (oldData: unknown) => {
        return Array.isArray(oldData) ? [...oldData, task.data] : [task.data]
      })
    },
  })
}
