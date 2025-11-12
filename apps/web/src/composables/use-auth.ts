import { authClient } from '@/lib/auth-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

const userKey = ['auth-user'] as const

export function useAuthUser() {
  const userQuery = useQuery({
    queryKey: userKey,
    queryFn: async () => {
      const session = await authClient.getSession()
      return session.data
    },
    retry: false,
  })

  return userQuery
}

export function useLoginEmail(options?: {
  onSuccess?: (user: ReturnType<typeof authClient.signIn.email>) => void
  onMutate?: (variables: Parameters<typeof authClient.signIn.email>[0]) => void
  onError?: (
    error: Error,
    variables: Parameters<typeof authClient.signIn.email>[0],
    context: unknown,
  ) => void
}) {
  const loginEmailMutation = useMutation({
    mutationFn: (credentials: Parameters<typeof authClient.signIn.email>[0]) =>
      authClient.signIn.email(credentials),
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
}) {
  const registerEmailMutation = useMutation({
    mutationFn: (credentials: Parameters<typeof authClient.signUp.email>[0]) =>
      authClient.signUp.email(credentials),
    onSuccess: (data) => {
      options?.onSuccess?.(data)
    },
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
