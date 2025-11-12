import { QueryClient, type QueryClientConfig } from '@tanstack/vue-query'

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: import.meta.env.PROD,
      retry: import.meta.env.PROD ? 3 : false,
      staleTime: 1000 * 5,
    },
  },
}

export const queryClient = new QueryClient(queryConfig)
