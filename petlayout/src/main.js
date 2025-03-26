import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
//导入element-plus样式

import 'element-plus/dist/index.css';


const app = createApp(App)
app.use(router)

app.mount('#app')
