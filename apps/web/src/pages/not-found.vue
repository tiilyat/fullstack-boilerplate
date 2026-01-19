<script setup lang="ts">
const error = {
  statusCode: 404,
  statusMessage: 'Page not found',
  message: 'The page you are looking for does not exist or has been moved.',
}
</script>

<template>
  <UError :error="error" redirect="/" />
</template>
