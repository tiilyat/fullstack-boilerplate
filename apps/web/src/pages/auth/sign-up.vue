<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import * as z from 'zod'
import { authClient } from '@/lib/auth-client'

const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)

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

  await authClient.signUp.email(
    {
      email: data.email,
      password: data.password,
      name: data.email.split('@')[0] ?? data.email,
    },
    {
      onRequest: () => {
        loading.value = true
      },
      onSuccess: () => {
        loading.value = false
        router.push('/')
      },
      onError: (ctx) => {
        loading.value = false
        error.value = ctx.error.message
      },
    },
  )
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 h-screen">
    <UPageCard class="w-full max-w-md">
      <UAuthForm
        :schema="schema"
        title="Register"
        description="Create a new account"
        icon="i-lucide-user"
        :fields="fields"
        @submit="onSubmit"
      >
        <template #description>
          Already have an account?
          <ULink to="/auth" class="text-primary font-medium">Sign in</ULink>.
        </template>
      </UAuthForm>
    </UPageCard>
  </div>
</template>
