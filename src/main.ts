/**
 * main.ts
 *
 * Bootstraps Vuetify and other plugins then mounts the App`
 */
// Components
import App from './App.vue'
// Composables
import { createApp } from 'vue'
// Plugins
import { registerPlugins } from '@/plugins'
// Auth Store
import { useAuthStore } from '@/store/AuthStore'
//axios
import '@/axios'
// Custom theme styles
import '@/assets/styles/theme.css'


const app = createApp(App)

registerPlugins(app)

// Initialiser l'AuthStore après que Pinia soit enregistré
app.mount('#app')

// Initialiser les données d'authentification depuis localStorage
const authStore = useAuthStore()
authStore.initFromStorage()
