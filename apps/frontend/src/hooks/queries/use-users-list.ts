import { useQuery } from '@tanstack/react-query'
import { authClient } from '#/lib/auth'

interface UseUsersListParams {
  limit: number
  offset: number
  searchEmail?: string
}

export function useUsersList({ limit, offset, searchEmail }: UseUsersListParams) {
  return useQuery({
    queryKey: ['admin-users', { limit, offset, searchEmail }] as const,
    queryFn: async () => {
      const response = await authClient.admin.listUsers({
        query: {
          limit,
          offset,
          sortBy: 'createdAt',
          sortDirection: 'desc',
          ...(searchEmail && {
            searchValue: searchEmail,
            searchField: 'email',
            searchOperator: 'contains' as const,
          }),
        },
      })

      if (response.error) {
        throw new Error(response.error.message || 'Failed to fetch users')
      }

      return response.data
    },
    staleTime: 1000 * 60 * 5,
  })
}
