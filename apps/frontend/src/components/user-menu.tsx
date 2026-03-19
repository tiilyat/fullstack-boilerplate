import { LogOut } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { useAuthUser, useLogout } from '#/hooks/use-auth'
import { ThemeModeToggle } from '#/components/theme-mode-toggle'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'

export function UserMenu() {
  const { data: authUser } = useAuthUser()
  const navigate = useNavigate()
  const logout = useLogout({
    onSuccess: () => {
      navigate({ to: '/sign-in', search: { redirectTo: '' } })
    },
  })

  const userName = authUser?.user.name || 'User'
  const userEmail = authUser?.user.email || ''
  const userInitial = userName[0].toUpperCase()

  return (
    <div className="flex items-center gap-2">
      <ThemeModeToggle />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
          <div className="flex size-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {userInitial}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" sideOffset={8}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>{userName}</DropdownMenuLabel>
            <DropdownMenuLabel>{userEmail}</DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout.mutate()}>
            <LogOut className="mr-2 size-3.5" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
