import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { authClient } from '#/lib/auth'

export const AUTH_USER_KEY = ['auth-user'] as const

export function useAuthUser() {
  return useQuery({
    queryKey: AUTH_USER_KEY,
    queryFn: async () => {
      const session = await authClient.getSession()

      if (!session.data) {
        throw new Error('Unauthorized')
      }

      return session.data
    },
    retry: false,
  })
}

export function useLoginEmail(options?: {
  onSuccess?: (data: Awaited<ReturnType<typeof authClient.signIn.email>>) => void
  onMutate?: (variables: Parameters<typeof authClient.signIn.email>[0]) => void
  onError?: (
    error: Error,
    variables: Parameters<typeof authClient.signIn.email>[0],
    context: unknown,
  ) => void
}) {
  return useMutation({
    mutationFn: async (credentials: Parameters<typeof authClient.signIn.email>[0]) => {
      const response = await authClient.signIn.email(credentials)
      if (response.error) {
        throw new Error(response.error.message || 'Authentication failed')
      }
      return response
    },
    onSuccess: options?.onSuccess,
    onMutate: options?.onMutate,
    onError: options?.onError,
  })
}

export function useRegisterEmail(options?: {
  onSuccess?: (data: Awaited<ReturnType<typeof authClient.signUp.email>>) => void
  onMutate?: (variables: Parameters<typeof authClient.signUp.email>[0]) => void
  onError?: (
    error: Error,
    variables: Parameters<typeof authClient.signUp.email>[0],
    context: unknown,
  ) => void
}) {
  return useMutation({
    mutationFn: async (credentials: Parameters<typeof authClient.signUp.email>[0]) => {
      const response = await authClient.signUp.email(credentials)
      if (response.error) {
        throw new Error(response.error.message || 'Registration failed')
      }
      return response
    },
    onSuccess: options?.onSuccess,
    onMutate: options?.onMutate,
    onError: options?.onError,
  })
}

export function useLogout(options?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => authClient.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(AUTH_USER_KEY, null)
      options?.onSuccess?.()
    },
  })
}
