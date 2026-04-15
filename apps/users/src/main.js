import { createApp } from 'vue'
import App from './App.vue'
import './styles/common.css'
import './styles/tailwind.css'
import router from './routers/index.js'
import VueDir from "@cp-vuedir/core"
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
const pinia = createPinia()
const app = createApp(App)

app.use(router)
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(VueDir)
app.mount('#app')