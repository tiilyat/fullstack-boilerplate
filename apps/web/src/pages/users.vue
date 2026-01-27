<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import { watchDebounced } from '@vueuse/core'
import { computed, ref } from 'vue'
import useUsersList from '@/composables/queries/use-users-list'
import type { UserWithRole } from '@/lib/auth-client'

const PAGE_SIZE = 50
const currentPage = ref(1)
const searchEmail = ref('')
const searchQuery = ref('')

const offset = computed(() => (currentPage.value - 1) * PAGE_SIZE)

const { data, isLoading, error } = useUsersList(PAGE_SIZE, offset, searchQuery)

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
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }: { row: { getValue: (key: string) => unknown } }) =>
      new Date(row.getValue('createdAt') as Date).toLocaleDateString(),
  },
]

const users = computed(() => data?.value?.users ?? [])
const total = computed(() => data?.value?.total ?? 0)
const showPagination = computed(() => data?.value && data.value.total > PAGE_SIZE)
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
        <UTable :data="users" :columns="columns" :loading="isLoading" />

        <!-- Pagination -->
        <div v-if="showPagination" class="flex justify-center">
          <UPagination v-model:page="currentPage" :total="total" :items-per-page="PAGE_SIZE" />
        </div>
      </div>
    </template>
  </UDashboardPanel>
</template>
