<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { computed, ref } from 'vue'
import UserMenu from '@/components/UserMenu.vue'
import { useAuthUser } from '@/composables/use-auth'

const open = ref(false)
const { data: authUser } = useAuthUser()

const isAdmin = computed(() => authUser.value?.user.role === 'admin')

const links = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    to: '/',
    icon: 'i-lucide-home',
    exact: true,
  },
  {
    label: 'Tasks',
    to: '/tasks',
    icon: 'i-lucide-list',
  },
  ...(isAdmin.value
    ? [
        {
          label: 'Users',
          to: '/users',
          icon: 'i-lucide-users',
        },
      ]
    : []),
])
</script>

<template>
  <UDashboardGroup unit="rem" storage="local">
    <UDashboardSidebar :open="open" collapsible resizable>
      <template #header="{ collapsed }">
        <div v-if="collapsed" class="font-semibold text-highlighted truncate text-center w-full">
          TST
        </div>
        <div v-else class="font-semibold text-highlighted truncate">TODOst</div>
      </template>

      <template #default="{ collapsed }">
        <UNavigationMenu :items="links" :collapsed="collapsed" orientation="vertical" tooltip />
      </template>

      <template #footer>
        <div class="flex justify-end">
          <UserMenu />
        </div>
      </template>
    </UDashboardSidebar>
    <RouterView />
  </UDashboardGroup>
</template>
