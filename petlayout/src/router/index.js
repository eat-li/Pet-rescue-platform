import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    redirect: '/login', // 修复拼写错误
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/loginpage/index.vue'),
    meta: { title: '宠物社区交流平台 - 登录' } // 添加标题元信息
  },
  {
    path: '/admin',
    name: 'AdminHome',
    component: () => import('@/views/adminmanager/index.vue'),
    meta: {
      requiresAuth: true,
      role: 'admin',
      title: '宠物后台管理系统' // 管理页标题
    }
  },
  // 用户页架子
  {
    path: '/',
    name: 'layout',
    component: () => import('@/views/layout/index.vue'),
    meta: {
      requiresAuth: true,
      role: 'user',
      title: '宠物社区 - 首页'
    },
    // 创建二级路由架子  
    children: [
      {
        path: '/home',
        name: 'home',
        component: () => import('@/views/userhome/index.vue'),
        meta: {
          title: '宠物社区 - 首页'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// 设置标题的全局前置守卫
router.beforeEach((to, from, next) => {
  // 直接从目标路由的元信息中获取标题
  const title = to.meta && to.meta.title ? to.meta.title : '宠物社区交流平台';

  // 设置文档标题
  document.title = title;
  //如果没有token则跳转到登录页
  // 未完成

  next();
});

export default router