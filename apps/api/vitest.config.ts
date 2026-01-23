import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    projects: [
      {
        test: {
          name: 'e2e',
          include: ['tests/e2e/**/*.test.ts'],
          setupFiles: ['./tests/e2e/setup.ts'],
          fileParallelism: false, // Sequential for DB isolation
        },
      },
      {
        test: {
          name: 'unit',
          include: ['tests/unit/**/*.test.ts'],
          // No setup files needed for unit tests
        },
      },
    ],
  },
})
