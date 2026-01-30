<script setup lang="ts">
import { computed, ref } from 'vue'
import { z } from 'zod'
import useUpdateUser from '@/composables/queries/use-update-user'
import type { UserWithRole } from '@/lib/auth-client'

const props = defineProps<{
  user: UserWithRole
}>()

const emit = defineEmits<{
  success: []
  close: []
}>()

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
})

type FormData = z.infer<typeof schema>

const initialName = props.user.name || ''

const formData = ref<FormData>({
  name: initialName,
})

const { mutate: updateUser, isPending } = useUpdateUser()

const isDirty = computed(() => formData.value.name !== initialName)

function handleClose() {
  if (isDirty.value) {
    const confirmed = confirm('You have unsaved changes. Are you sure you want to close?')
    if (!confirmed) return
  }
  emit('close')
}

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
        emit('close')
      },
    }
  )
}
</script>

<template>
  <UForm
    :state="formData"
    :schema="schema"
    @submit="handleSubmit"
  >
    <div class="space-y-4">
      <UFormField label="Name" name="name" required>
        <UInput v-model="formData.name" />
      </UFormField>

      <div class="flex gap-2 justify-end">
        <UButton
          type="button"
          color="neutral"
          variant="outline"
          @click="handleClose"
        >
          Cancel
        </UButton>
        <UButton
          type="submit"
          :disabled="!isDirty || isPending"
          :loading="isPending"
        >
          Save
        </UButton>
      </div>
    </div>
  </UForm>
</template>
