<script setup lang="ts">
import type { Task } from '@/types/task'

defineProps<{
  tasks: Task[]
  isLoading: boolean
}>()

defineEmits<{
  toggle: [id: string]
  delete: [id: string]
}>()
</script>

<template>
  <div v-if="isLoading" class="text-center text-dimmed py-8">Loading tasks...</div>
  <div v-else-if="!tasks.length" class="text-center text-dimmed py-8">
    No tasks yet. Add one above!
  </div>
  <div v-else class="space-y-2">
    <slot />
  </div>
</template>
