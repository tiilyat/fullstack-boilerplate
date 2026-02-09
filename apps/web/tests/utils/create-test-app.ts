import ui from '@nuxt/ui/vue-plugin'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { flushPromises } from '@vue/test-utils'
import { page } from 'vitest/browser'
import { render } from 'vitest-browser-vue'
import { createMemoryHistory, createRouter, type RouteLocationRaw, type Router } from 'vue-router'
import App from '@/App.vue'
import { queryClient } from '@/lib/vue-query'
import { routes } from '@/router/routes'

type TestApp = {
  router: Router
  container: Element
  // Raw query methods (use page.getBy* for new code)
  getByRole: typeof page.getByRole
  getByText: typeof page.getByText
  getByTestId: typeof page.getByTestId
  queryByRole: typeof page.getByRole
  queryByText: typeof page.getByText
  findByRole: typeof page.getByRole
  findByText: typeof page.getByText
  // Helpers
  navigateTo: (to: RouteLocationRaw) => Promise<void>
  cleanup: () => void
}

type CreateTestAppOptions = {
  initialRoute?: string
}

export async function createTestApp(options: CreateTestAppOptions = {}): Promise<TestApp> {
  const { initialRoute = '/' } = options

  const router = createRouter({
    history: createMemoryHistory(),
    routes,
  })

  const screen = render(App, {
    global: {
      plugins: [
        router,
        [
          VueQueryPlugin,
          {
            queryClient,
          },
        ],
        ui,
      ],
    },
  })

  if (initialRoute !== '/') {
    router.push(initialRoute)
  }

  await router.isReady()

  // Flush Vue's async operations to ensure onMounted fires
  await flushPromises()

  async function navigateTo(to: RouteLocationRaw) {
    await router.push(to)
  }

  function cleanup() {
    screen.unmount()
  }

  return {
    router,
    container: screen.container,
    // Raw query methods - use page locators (return Locators, not HTMLElements)
    getByRole: page.getByRole.bind(page),
    getByText: page.getByText.bind(page),
    getByTestId: page.getByTestId.bind(page),
    queryByRole: page.getByRole.bind(page),
    queryByText: page.getByText.bind(page),
    findByRole: page.getByRole.bind(page),
    findByText: page.getByText.bind(page),
    // Helpers
    navigateTo,
    cleanup,
  }
}
