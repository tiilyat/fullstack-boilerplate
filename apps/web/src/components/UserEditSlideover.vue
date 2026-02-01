<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { z } from 'zod'
import useUpdateUser from '@/composables/queries/use-update-user'
import type { UserWithRole } from '@/lib/auth-client'

const props = defineProps<{
  open: boolean
  user: UserWithRole
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  success: []
}>()

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FormData = z.infer<typeof schema>

const formData = ref<FormData>({
  name: props.user.name || '',
})

const initialName = ref(props.user.name || '')

const { mutate: updateUser, isPending } = useUpdateUser()

const isDirty = computed(() => formData.value.name !== initialName.value)

const isOpen = computed({
  get: () => props.open,
  set: (value: boolean) => {
    if (!value && isDirty.value) {
      const confirmed = confirm('You have unsaved changes. Are you sure you want to close?')
      if (!confirmed) return
    }
    emit('update:open', value)
  },
})

// Reset form when user changes
watch(
  () => props.user.id,
  () => {
    formData.value = {
      name: props.user.name || '',
    }
    initialName.value = props.user.name || ''
  }
)

async function handleSubmit() {
  updateUser(
    {
      userId: props.user.id,
      data: {
        name: formData.value.name,
      },
    },
    {
      onSuccess: () => {
        emit('success')
        emit('update:open', false)
      },
    }
  )
}
</script>

<template>
  <USlideover v-model:open="isOpen">
    <template #title>
      Edit User
    </template>

    <template #body>
      <UForm :state="formData" :schema="schema" @submit="handleSubmit">
        <UFormField label="Name" name="name" required>
          <UInput v-model="formData.name" />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex gap-2 justify-end">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          @click="isOpen = false"
        >
          Cancel
        </UButton>
        <UButton
          type="button"
          :disabled="!isDirty || isPending"
          :loading="isPending"
          @click="handleSubmit"
        >
          Save
        </UButton>
      </div>
    </template>
  </USlideover>
</template>
