import { useDeferredValue, useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AlertCircle, EllipsisVertical, Search, UserCheck, UserX } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '#/components/ui/alert'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '#/components/ui/dropdown-menu'
import { Input } from '#/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { ConfirmDialog } from '#/components/confirm-dialog'
import { useBanUser } from '#/hooks/queries/use-ban-user'
import { useUnbanUser } from '#/hooks/queries/use-unban-user'
import { useUsersList } from '#/hooks/queries/use-users-list'
import { useConfirmDialog } from '#/hooks/use-confirm-dialog'
import type { UserWithRole } from '#/lib/auth'

export const Route = createFileRoute('/_dashboard/users')({
  component: UsersPage,
})

const PAGE_SIZE = 50

function UsersPage() {
  const [searchEmail, setSearchEmail] = useState('')
  const deferredSearch = useDeferredValue(searchEmail)
  const [currentPage, setCurrentPage] = useState(1)

  const offset = (currentPage - 1) * PAGE_SIZE

  const { data, isLoading, error } = useUsersList({
    limit: PAGE_SIZE,
    offset,
    searchEmail: deferredSearch,
  })
  const { mutate: banUser } = useBanUser()
  const { mutate: unbanUser } = useUnbanUser()
  const { confirm, dialogProps } = useConfirmDialog()

  useEffect(() => {
    setCurrentPage(1)
  }, [deferredSearch])

  const users = data?.users ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_SIZE)
  const showPagination = total > PAGE_SIZE

  async function handleBan(user: UserWithRole) {
    const confirmed = await confirm({
      title: 'Ban User',
      message: `Are you sure you want to ban ${user.email}?`,
      confirmLabel: 'Ban',
      confirmVariant: 'destructive',
    })

    if (!confirmed) return

    banUser({ userId: user.id })
  }

  async function handleUnban(user: UserWithRole) {
    const confirmed = await confirm({
      title: 'Unban User',
      message: `Are you sure you want to unban ${user.email}?`,
      confirmLabel: 'Unban',
      confirmVariant: 'default',
    })

    if (!confirmed) return

    unbanUser({ userId: user.id })
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-2xl font-bold">Users</h1>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Error loading users</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      )}

      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="pl-9"
        />
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Verified</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="w-10">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                Loading...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && users.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          )}
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.name}</TableCell>
              <TableCell>{user.role}</TableCell>
              <TableCell>{user.emailVerified ? '\u2713' : '\u2717'}</TableCell>
              <TableCell>
                <Badge variant={user.banned ? 'error' : 'success'}>
                  {user.banned ? 'Banned' : 'Active'}
                </Badge>
              </TableCell>
              <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <UserActionsMenu
                  user={user}
                  onBan={() => handleBan(user)}
                  onUnban={() => handleUnban(user)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {showPagination && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}

      <ConfirmDialog {...dialogProps} />
    </div>
  )
}

function UserActionsMenu({
  user,
  onBan,
  onUnban,
}: {
  user: UserWithRole
  onBan: () => void
  onUnban: () => void
}) {
  const isBanned = user.banned === true

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
        <EllipsisVertical className="size-4" />
        <span className="sr-only">User actions</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {isBanned ? (
          <DropdownMenuItem onClick={onUnban}>
            <UserCheck className="size-4" />
            Unban
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem variant="destructive" onClick={onBan}>
            <UserX className="size-4" />
            Ban
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
