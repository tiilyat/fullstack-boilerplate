<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { watchDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import useBanUser from '@/composables/queries/use-ban-user'
import useUnbanUser from '@/composables/queries/use-unban-user'
import useUsersList from '@/composables/queries/use-users-list'
import { useConfirmDialog } from '@/composables/use-confirm-dialog'
import type { UserWithRole } from '@/lib/auth-client'

const PAGE_SIZE = 50
const currentPage = ref(1)
const searchEmail = ref('')
const searchQuery = ref('')
const selectedUser = ref<UserWithRole | null>(null)
const isDetailsOpen = computed({
  get: () => selectedUser.value !== null,
  set: (v) => {
    if (!v) selectedUser.value = null
  },
})

const offset = computed(() => (currentPage.value - 1) * PAGE_SIZE)

const { data, isLoading, error } = useUsersList(PAGE_SIZE, offset, searchQuery)
const { mutate: banUser, isPending: isBanning } = useBanUser()
const { mutate: unbanUser, isPending: isUnbanning } = useUnbanUser()
const confirmDialog = useConfirmDialog()

// Debounced search with page reset
watchDebounced(
  searchEmail,
  (newValue: string) => {
    searchQuery.value = newValue
    currentPage.value = 1
  },
  { debounce: 300 }
)

const columns: TableColumn<UserWithRole>[] = [
  { accessorKey: 'email', header: 'Email' },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
  {
    accessorKey: 'emailVerified',
    header: 'Verified',
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) =>
      (row.getValue('emailVerified') as boolean) ? '✓' : '✗',
  },
  {
    accessorKey: 'banned',
    header: 'Status',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) =>
      new Date(row.getValue('createdAt') as Date).toLocaleDateString(),
  },
  {
    id: 'actions',
  },
]

const users = computed(() => data?.value?.users ?? [])
const total = computed(() => data?.value?.total ?? 0)
const showPagination = computed(() => data?.value && data.value.total > PAGE_SIZE)

function getUserActions(user: UserWithRole): DropdownMenuItem[][] {
  const isBanned = user.banned === true

  if (isBanned) {
    return [
      [
        {
          label: 'Details',
          icon: 'i-lucide-info',
          onSelect: () => {
            selectedUser.value = user
          },
        },
      ],
      [
        {
          label: 'Unban',
          icon: 'i-lucide-user-check',
          onSelect: () => handleUnban(user),
        },
      ],
    ]
  }

  return [
    [
      {
        label: 'Details',
        icon: 'i-lucide-info',
        onSelect: () => {
          selectedUser.value = user
        },
      },
    ],
    [
      {
        label: 'Ban',
        icon: 'i-lucide-user-x',
        color: 'error',
        onSelect: () => handleBan(user),
      },
    ],
  ]
}

async function handleBan(user: UserWithRole) {
  const confirmed = await confirmDialog({
    title: 'Ban User',
    message: `Are you sure you want to ban ${user.email}?`,
    confirmLabel: 'Ban',
    confirmColor: 'error',
  })

  if (!confirmed) return

  banUser({
    userId: user.id,
  })
}

async function handleUnban(user: UserWithRole) {
  const confirmed = await confirmDialog({
    title: 'Unban User',
    message: `Are you sure you want to unban ${user.email}?`,
    confirmLabel: 'Unban',
    confirmColor: 'success',
  })

  if (!confirmed) return

  unbanUser({
    userId: user.id,
  })
}
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Users">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="space-y-4 p-4">
        <!-- Error Alert -->
        <UAlert
          v-if="error"
          color="error"
          icon="i-lucide-alert-circle"
          title="Error loading users"
          :description="error.message"
        />

        <!-- Search -->
        <UInput
          v-model="searchEmail"
          icon="i-lucide-search"
          placeholder="Search by email..."
        />

        <!-- Table with built-in loading and empty states -->
        <UTable
          :data="users"
          :columns="columns"
          :loading="isLoading || isBanning || isUnbanning"
        >
          <!-- Status badge slot -->
          <template #banned-cell="{ row }">
            <UBadge
              :color="row.original.banned ? 'error' : 'success'"
              variant="subtle"
            >
              {{ row.original.banned ? "Banned" : "Active" }}
            </UBadge>
          </template>

          <!-- Actions dropdown slot -->
          <template #actions-cell="{ row }">
            <UDropdownMenu :items="getUserActions(row.original)">
              <UButton
                icon="i-lucide-ellipsis-vertical"
                color="neutral"
                variant="ghost"
                aria-label="User actions"
              />
            </UDropdownMenu>
          </template>
        </UTable>

        <!-- Pagination -->
        <div v-if="showPagination" class="flex justify-center">
          <UPagination
            v-model:page="currentPage"
            :total="total"
            :items-per-page="PAGE_SIZE"
          />
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <USlideover v-model:open="isDetailsOpen">
    <template #title>
      User Details
    </template>

    <div v-if="selectedUser" class="space-y-6">
      <!-- Basic Info -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-neutral-400 dark:text-neutral-500">Basic Info</h3>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">ID:</span>
            <span class="font-mono text-xs">{{ selectedUser.id }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Email:</span>
            <span>{{ selectedUser.email }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Name:</span>
            <span>{{ selectedUser.name || '-' }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Role:</span>
            <span>{{ selectedUser.role }}</span>
          </div>
        </div>
      </div>

      <!-- Verification -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-neutral-400 dark:text-neutral-500">Verification</h3>
        <div class="flex items-center gap-2">
          <UBadge
            :color="selectedUser.emailVerified ? 'success' : 'neutral'"
            variant="subtle"
          >
            {{ selectedUser.emailVerified ? 'Verified' : 'Not Verified' }}
          </UBadge>
        </div>
      </div>

      <!-- Timestamps -->
      <div class="space-y-2">
        <h3 class="text-sm font-semibold text-neutral-400 dark:text-neutral-500">Timestamps</h3>
        <div class="space-y-1 text-sm">
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Created:</span>
            <span>{{ new Date(selectedUser.createdAt).toLocaleDateString() }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Updated:</span>
            <span>{{ new Date(selectedUser.updatedAt).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>

      <!-- Ban Info (conditional) -->
      <div v-if="selectedUser.banned" class="space-y-2">
        <h3 class="text-sm font-semibold text-neutral-400 dark:text-neutral-500">Ban Info</h3>
        <div class="space-y-1 text-sm">
          <div v-if="selectedUser.banReason" class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Reason:</span>
            <span>{{ selectedUser.banReason }}</span>
          </div>
          <div v-if="selectedUser.banExpires" class="flex justify-between">
            <span class="text-neutral-500 dark:text-neutral-400">Expires:</span>
            <span>{{ new Date(selectedUser.banExpires).toLocaleDateString() }}</span>
          </div>
        </div>
      </div>
    </div>
  </USlideover>
</template>
