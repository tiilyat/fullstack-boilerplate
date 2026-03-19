import { QueryClient  } from '@tanstack/react-query'
import type {QueryClientConfig} from '@tanstack/react-query';

const queryConfig: QueryClientConfig = {
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: import.meta.env.PROD,
      retry: import.meta.env.PROD ? 3 : false,
      staleTime: 1000 * 5,
      throwOnError: false,
    },
  },
}

export const queryClient = new QueryClient(queryConfig)

export function getQueryClient() {
  return queryClient
}
