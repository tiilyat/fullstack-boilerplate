<script setup lang="ts">
interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'error' | 'primary' | 'success' | 'warning'
}

const {
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
} = defineProps<Props>()

const emit = defineEmits<{
  close: [value: boolean]
}>()
</script>

<template>
  <UModal :open="true">
    <template #header>
      {{ title }}
    </template>

    <template #body>
      <p class="text-muted">
        {{ message }}
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="emit('close', false)">
          {{ cancelLabel }}
        </UButton>
        <UButton :color="confirmColor" @click="emit('close', true)">
          {{ confirmLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
