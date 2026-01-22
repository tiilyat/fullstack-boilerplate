<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import * as z from 'zod'
import { useLoginEmail } from '@/composables/use-auth'

const router = useRouter()
const route = useRoute()
const redirectTo = route.query.redirectTo as string | undefined
const loading = ref(false)
const error = ref<string | null>(null)

const { mutate } = useLoginEmail({
  onMutate: () => {
    loading.value = true
    error.value = null // Clear previous errors
  },
  onError: (e) => {
    loading.value = false
    if (e instanceof Error) {
      error.value = e.message
    } else {
      error.value = 'An unknown error occurred'
    }
  },
  onSuccess: (_data) => {
    loading.value = false
    router.push(redirectTo || '/')
  },
})

const fields: AuthFormField[] = [
  {
    name: 'email',
    type: 'email',
    label: 'Email',
    placeholder: 'Enter your email',
    required: true,
  },
  {
    name: 'password',
    type: 'password',
    label: 'Password',
    placeholder: 'Enter your password',
    required: true,
  },
]

const schema = z.object({
  email: z.email('Invalid email'),
  password: z.string('Password is required').min(8, 'Password must be at least 8 characters long'),
})

type Schema = z.output<typeof schema>

async function onSubmit(payload: FormSubmitEvent<Schema>) {
  const { data } = payload
  mutate({
    email: data.email,
    password: data.password,
  })
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 h-screen">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Login"
        description="Enter your credentials to access your account."
        icon="i-lucide-user"
        :fields="fields"
        :loading="loading"
        @submit="onSubmit"
      >
        <template #validation>
          <UAlert v-if="error" color="error" icon="i-lucide-triangle-alert" :title="error" />
        </template>

        <template #description>
          Don't have an account?
          <ULink to="/auth/sign-up" class="text-primary font-medium">Sign up</ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
