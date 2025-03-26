import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  //登录页路由
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/loginpage/index.vue')
  }

]


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
