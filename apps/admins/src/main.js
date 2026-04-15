import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia';//导入pinia
import router from '@/router/index.js'
import 'element-plus/dist/index.css';//导入elementplus配置
import '@/styles/common.scss'
import persist from 'pinia-plugin-persistedstate'//导入pinia持久化存储配置

const app = createApp(App)
// app.config.globalProperties.$echarts = echarts//将echarts挂载到app实例上，方便全局使用
//12 1827


const pinia = createPinia()
app.use(pinia)
pinia.use(persist)
app.use(router)
app.mount('#app')
