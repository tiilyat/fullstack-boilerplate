import { useMemo, useState } from 'react'
import { Link, Outlet, useMatches } from '@tanstack/react-router'
import type { LucideIcon } from 'lucide-react'
import { Home, ListTodo, PanelLeft, Users } from 'lucide-react'

import { useAuthUser } from '#/hooks/use-auth'
import { UserMenu } from '#/components/user-menu'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

type NavItem = { to: string; label: string; icon: LucideIcon; adminOnly?: boolean }

const navItems: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/tasks', label: 'Tasks', icon: ListTodo },
  { to: '/users', label: 'Users', icon: Users, adminOnly: true },
]

export function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { data: authUser } = useAuthUser()
  const matches = useMatches()
  const isAdmin = authUser?.user.role === 'admin'

  const visibleNavItems = useMemo(
    () => navItems.filter((item) => !item.adminOnly || isAdmin),
    [isAdmin],
  )

  function isActive(to: string) {
    return matches.some((match) => {
      if (to === '/') return match.fullPath === '/'
      return match.fullPath.startsWith(to)
    })
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <aside
        className={cn(
          'flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-200',
          collapsed ? 'w-14' : 'w-56',
        )}
      >
        <div className="flex h-12 items-center border-b border-sidebar-border px-3">
          {collapsed ? (
            <span className="w-full text-center text-sm font-semibold text-sidebar-foreground">
              TST
            </span>
          ) : (
            <span className="text-sm font-semibold text-sidebar-foreground">TODOst</span>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn('ml-auto text-sidebar-foreground', collapsed && 'mx-auto ml-0')}
            onClick={() => setCollapsed(!collapsed)}
          >
            <PanelLeft className="size-4" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 p-2">
          {visibleNavItems.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent',
                isActive(to) && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
                collapsed && 'justify-center',
              )}
            >
              <Icon className="size-4 shrink-0" />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <div className="border-t border-sidebar-border p-2">
          <UserMenu />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
