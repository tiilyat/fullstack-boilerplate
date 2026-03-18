import { TanStackDevtools } from '@tanstack/react-devtools'
import { Outlet, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

import Footer from '#/components/footer'
import Header from '#/components/header'
import { ThemeProvider } from '#/components/theme-provider'
import '../styles.css'

export const Route = createRootRoute({
  component: RootComponent,
})

function RootComponent() {
  return (
    <>
      <ThemeProvider>
        <Header />
        <Outlet />
        <Footer />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'TanStack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
      </ThemeProvider>
    </>
  )
}
