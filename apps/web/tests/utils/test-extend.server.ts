import { test as testBase } from 'vitest'
import { queryClient } from '@/lib/vue-query'
import { worker } from './mocks/browser'

export const test = testBase.extend<{
  worker: typeof worker
}>({
  worker: [
    // biome-ignore lint/correctness/noEmptyPattern: https://vitest.dev/guide/test-context.html#extend-test-context
    async ({}, use) => {
      // Start the worker before the test.
      await worker.start({
        onUnhandledRequest: 'bypass',
      })

      // Expose the worker object on the test's context.
      await use(worker)

      // Remove any request handlers added in individual test cases.
      // This prevents them from affecting unrelated tests.
      worker.resetHandlers()

      // Clear TanStack Query cache to prevent data leaking between tests
      queryClient.clear()

      // Stop the worker after the test.
      worker.stop()
    },
    {
      auto: true,
    },
  ],
})
