import ui from '@nuxt/ui/vue-plugin'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { render } from 'vitest-browser-vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { queryClient } from '@/lib/vue-query'

export const renderComponent: typeof render = (component, options) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [],
  })

  return render(component, {
    ...(options ?? {}),
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
}
