import './style.css'
import 'vue-sonner/style.css'
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { onUnauthorized } from './lib/api'
import { useAuthStore } from './stores/auth'
import './composables/useDarkMode'

const app = createApp(App)

app.use(createPinia())
app.use(router)

// Token kedaluwarsa/dicabut: bersihkan sesi dan kembali ke halaman login.
onUnauthorized(() => {
  useAuthStore().clear()
  if (router.currentRoute.value.name !== 'login') router.push({ name: 'login' })
})

app.mount('#app')
