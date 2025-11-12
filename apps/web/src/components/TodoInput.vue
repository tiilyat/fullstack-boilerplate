<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  create: [title: string]
}>()

const title = ref('')

const handleSubmit = () => {
  const trimmed = title.value.trim()
  if (trimmed) {
    emit('create', trimmed)
    title.value = ''
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    handleSubmit()
  }
}
</script>

<template>
  <div class="flex gap-2">
    <UInput
      v-model="title"
      placeholder="Add a new task..."
      class="flex-1"
      @keydown="handleKeydown"
    />
    <UButton @click="handleSubmit">Add</UButton>
  </div>
</template>
