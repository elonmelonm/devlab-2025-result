import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Toast from 'vue-toast-notification'
import 'vue-toast-notification/dist/theme-sugar.css'

const app = createApp(App)

// Configuration des notifications toast
app.use(Toast, {
  position: 'top-right',
  duration: 5000,
  dismissible: true
})

app.use(router)
app.mount('#app')
