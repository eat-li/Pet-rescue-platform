 import { createWebHistory, createRouter } from 'vue-router'
import LoginRoutes from "./modules/login.js"
import RegisterRoutes from "./modules/register.js"
import layoutRoutes from "./modules/layout.js"
import communityRoutes from "./modules/community.js"
import profileRoutes from "./modules/profile.js"
import petRoutes from './modules/pet.js'
import adoptRoutes from './modules/adopt.js'
import serviceRoutes from './modules/service.js'
import noticeRoutes from './modules/notice.js'

const routes = [
  ...LoginRoutes,
  ...RegisterRoutes,
  ...layoutRoutes,
  ...communityRoutes,
  ...profileRoutes,
  ...petRoutes,
  ...adoptRoutes,
  ...serviceRoutes,
  ...noticeRoutes
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router