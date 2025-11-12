import apiClient from '@/lib/api-client'
import type { Task } from '@/types/task'
import { useQuery } from '@tanstack/vue-query'

export default function useTasks() {
  return useQuery<Task[]>({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await apiClient.api.v1.tasks.$get()
      return res.json()
    },
  })
}
