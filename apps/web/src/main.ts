import ui from '@nuxt/ui/vue-plugin'
import { VueQueryPlugin } from '@tanstack/vue-query'
import { createApp } from 'vue'
import App from './App.vue'
import './assets/main.css'
import { queryClient } from './lib/vue-query'
import router from './router'

const app = createApp(App)

app.use(router)
app.use(ui)
app.use(VueQueryPlugin, {
  queryClient,
})

app.mount('#app')
