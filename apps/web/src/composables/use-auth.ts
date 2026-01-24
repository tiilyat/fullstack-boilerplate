import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import { authClient } from '@/lib/auth-client'

const userKey = ['auth-user'] as const

export function useAuthUser() {
  const userQuery = useQuery({
    queryKey: userKey,
    queryFn: async () => {
      const session = await authClient.getSession()

      if (!session.data) {
        throw new Error('Unauthorized')
      }

      return session.data
    },
    retry: false,
  })

  return userQuery
}

export function useLoginEmail(options?: {
  onSuccess?: (user: ReturnType<typeof authClient.signIn.email>) => void
  onMutate?: (variables: Parameters<typeof authClient.signIn.email>[0]) => void
  onError?: (error: Error, variables: Parameters<typeof authClient.signIn.email>[0], context: unknown) => void
}) {
  const loginEmailMutation = useMutation({
    mutationFn: async (credentials: Parameters<typeof authClient.signIn.email>[0]) => {
      const response = await authClient.signIn.email(credentials)
      // Better auth returns error object in response for failed auth
      if (response.error) {
        throw new Error(response.error.message || 'Authentication failed')
      }
      return response
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onMutate: options?.onMutate,
    onError: options?.onError,
  })

  return loginEmailMutation
}

export function useRegisterEmail(options?: {
  onSuccess?: (user: ReturnType<typeof authClient.signUp.email>) => void
  onMutate?: (variables: Parameters<typeof authClient.signUp.email>[0]) => void
  onError?: (error: Error, variables: Parameters<typeof authClient.signUp.email>[0], context: unknown) => void
}) {
  const registerEmailMutation = useMutation({
    mutationFn: async (credentials: Parameters<typeof authClient.signUp.email>[0]) => {
      const response = await authClient.signUp.email(credentials)
      // Better auth returns error object in response for failed auth
      if (response.error) {
        throw new Error(response.error.message || 'Registration failed')
      }
      return response
    },
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
    onMutate: options?.onMutate,
    onError: options?.onError,
  })

  return registerEmailMutation
}

export function useLogout(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()
  const logoutMutation = useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(userKey, null)
      options?.onSuccess?.()
    },
  })

  return logoutMutation
}
