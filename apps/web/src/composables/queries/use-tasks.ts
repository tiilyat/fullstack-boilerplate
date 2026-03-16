import apiClient from '@/lib/api-client'
import { useQuery } from '@tanstack/vue-query'

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
