<script setup lang="ts">
import type { DropdownMenuItem, TableColumn } from '@nuxt/ui'
import { watchDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import UserDetailsSlideover from '@/components/UserDetailsSlideover.vue'
import UserEditSlideover from '@/components/UserEditSlideover.vue'
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
const isDetailsOpen = ref(false)
const selectedUserForEdit = ref<UserWithRole | null>(null)
const isEditOpen = ref(false)

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
            isDetailsOpen.value = true
          },
        },
        {
          label: 'Edit',
          icon: 'i-lucide-pencil',
          onSelect: () => {
            selectedUserForEdit.value = user
            isEditOpen.value = true
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
          isDetailsOpen.value = true
        },
      },
      {
        label: 'Edit',
        icon: 'i-lucide-pencil',
        onSelect: () => {
          selectedUserForEdit.value = user
          isEditOpen.value = true
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

  <UserDetailsSlideover
    v-model:open="isDetailsOpen"
    :user="selectedUser"
  />

  <UserEditSlideover
    v-if="selectedUserForEdit"
    v-model:open="isEditOpen"
    :user="selectedUserForEdit"
    @success="isEditOpen = false"
  />
</template>
