import { useQuery } from '@tanstack/vue-query'
import { type MaybeRefOrGetter, toValue } from 'vue'
import { authClient } from '@/lib/auth-client'

export default function useUsersList(
  limit: MaybeRefOrGetter<number>,
  offset: MaybeRefOrGetter<number>,
  searchEmail: MaybeRefOrGetter<string> = ''
) {
  return useQuery({
    queryKey: ['admin-users', limit, offset, searchEmail] as const,
    queryFn: async () => {
      const email = toValue(searchEmail)
      const response = await authClient.admin.listUsers({
        query: {
          limit: toValue(limit),
          offset: toValue(offset),
          ...(email && {
            searchValue: email,
            searchField: 'email',
            searchOperator: 'contains',
          }),
        },
      })

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch users')
      }

      return response.data ?? { users: [], total: 0 }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
