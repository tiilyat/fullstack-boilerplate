<script setup lang="ts">
interface Props {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: 'error' | 'primary' | 'success' | 'warning'
}

const props = withDefaults(defineProps<Props>(), {
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  confirmColor: 'primary',
})

const emit = defineEmits<{
  close: [value: boolean]
}>()
</script>

<template>
  <UModal :open="true">
    <template #header>
      {{ props.title }}
    </template>

    <template #body>
      <p class="text-muted">
        {{ props.message }}
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="ghost" @click="emit('close', false)">
          {{ props.cancelLabel }}
        </UButton>
        <UButton :color="props.confirmColor" @click="emit('close', true)">
          {{ props.confirmLabel }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
