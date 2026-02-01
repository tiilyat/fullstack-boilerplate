<script setup lang="ts">
import { computed } from 'vue'
import type { UserWithRole } from '@/lib/auth-client'

const props = defineProps<{
  open: boolean
  user: UserWithRole | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
}>()

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => emit('update:open', value),
})
</script>

<template>
  <USlideover v-model:open="isOpen">
    <template #title>
      User Details
    </template>

    <template #body>
      <div v-if="user" class="space-y-6">
        <!-- Basic Info -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-neutral-400 dark:text-neutral-500">Basic Info</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-neutral-500 dark:text-neutral-400">ID:</span>
              <span class="font-mono text-xs">{{ user.id }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500 dark:text-neutral-400">Email:</span>
              <span>{{ user.email }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500 dark:text-neutral-400">Name:</span>
              <span>{{ user.name || '-' }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500 dark:text-neutral-400">Role:</span>
              <span>{{ user.role }}</span>
            </div>
          </div>
        </div>

        <!-- Verification -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-neutral-400 dark:text-neutral-500">Verification</h3>
          <div class="flex items-center gap-2">
            <UBadge
              :color="user.emailVerified ? 'success' : 'neutral'"
              variant="subtle"
            >
              {{ user.emailVerified ? 'Verified' : 'Not Verified' }}
            </UBadge>
          </div>
        </div>

        <!-- Timestamps -->
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-neutral-400 dark:text-neutral-500">Timestamps</h3>
          <div class="space-y-1 text-sm">
            <div class="flex justify-between">
              <span class="text-neutral-500 dark:text-neutral-400">Created:</span>
              <span>{{ new Date(user.createdAt).toLocaleDateString() }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-neutral-500 dark:text-neutral-400">Updated:</span>
              <span>{{ new Date(user.updatedAt).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <!-- Ban Info (conditional) -->
        <div v-if="user.banned" class="space-y-2">
          <h3 class="text-sm font-semibold text-neutral-400 dark:text-neutral-500">Ban Info</h3>
          <div class="space-y-1 text-sm">
            <div v-if="user.banReason" class="flex justify-between">
              <span class="text-neutral-500 dark:text-neutral-400">Reason:</span>
              <span>{{ user.banReason }}</span>
            </div>
            <div v-if="user.banExpires" class="flex justify-between">
              <span class="text-neutral-500 dark:text-neutral-400">Expires:</span>
              <span>{{ new Date(user.banExpires).toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </USlideover>
</template>
