import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { createPinia } from 'pinia';
import persist from 'pinia-plugin-persistedstate'
import 'element-plus/dist/index.css';


const app = createApp(App)

// pinia
const pinia = createPinia()
app.use(pinia)
pinia.use(persist)

app.use(router)

app.mount('#app')
