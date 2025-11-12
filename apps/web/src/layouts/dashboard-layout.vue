<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { ref } from 'vue'
import UserMenu from '@/components/UserMenu.vue'

const open = ref(false)

const links: NavigationMenuItem[] = [
  {
    label: 'Главная',
    to: '/',
    icon: 'i-lucide-home',
  },
]
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
