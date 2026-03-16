<script setup lang="ts">
import { useAuthUser } from '@/composables/use-auth'
import { authClient } from '@/lib/auth-client'
import type { DropdownMenuItem } from '@nuxt/ui'
import { computed } from 'vue'

const { data: authUser } = useAuthUser()

const user = computed(() => ({
  name: authUser.value?.user.name || 'User',
  email: authUser.value?.user.email || '',
  avatar: authUser.value?.user.name?.[0]?.toUpperCase() || 'U',
}))

const items = computed<DropdownMenuItem[][]>(() => [
  [
    {
      type: 'label',
      label: user.value.name,
      avatar: {
        text: user.value.avatar,
      },
    },
  ],
  [
    {
      label: 'Log out',
      icon: 'i-lucide-log-out',
      onSelect: async () => {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = '/auth'
            },
          },
        })
      },
    },
  ],
])
</script>

<template>
  <UDropdownMenu :items="items">
    <UButton color="neutral" variant="ghost" class="justify-start gap-2">
      <template #leading>
        <UAvatar :text="user.avatar" :alt="user.name" size="xs" />
      </template>
      <template #default>
        <span class="truncate">{{ user.name }}</span>
      </template>
    </UButton>
  </UDropdownMenu>
</template>
