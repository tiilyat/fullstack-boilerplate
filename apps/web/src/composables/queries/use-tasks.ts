import { useQuery } from '@tanstack/vue-query'
import apiClient from '@/lib/api-client'

export default function useTasks() {
  return useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const res = await apiClient.api.v1.tasks.$get()
      const json = await res.json()
      return json.data
    },
  })
}
