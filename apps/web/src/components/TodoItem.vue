<script setup lang="ts">
import type { Task } from '@/types/task'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  toggle: [id: string]
  delete: [id: string]
}>()

const handleToggle = () => {
  emit('toggle', props.task.id)
}
</script>

<template>
  <div
    class="flex items-center gap-3 p-3 rounded-lg bg-elevated/50 hover:bg-elevated transition-colors"
  >
    <UCheckbox :model-value="task.completed" @update:model-value="handleToggle" />
    <span class="flex-1 text-sm" :class="{ 'line-through text-dimmed': task.completed }">
      {{ task.title }}
    </span>
    <UButton
      icon="i-lucide-trash-2"
      color="error"
      variant="ghost"
      size="sm"
      square
      @click="emit('delete', task.id)"
    />
  </div>
</template>
