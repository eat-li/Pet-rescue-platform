import { createRouter, createWebHistory } from "vue-router";
const routes = [
  {
    path: "/",
    redirect: "/adlogin",
  },
  {
    path: "/adlogin",
    name: "adlogin",
    component: () => import("../views/Login/index.vue"),
  },
  // 后台管理页面架子
  {
    path: "/admin",
    name: "admin",
    redirect: "/admin/home",
    component: () => import("@/views/Menu/index.vue"),
    meta: {
      title: "宠物后台管理系统", // 管理页标题
    },
    // 创建二级路由架子
    children: [
      {
        path: "home",
        name: "home",
        component: () => import("@/views/Home/index.vue"),
      },
      {
        path: "user",
        name: "user",
        component: () => import("@/views/User/index.vue"),
      },
      {
        path: "article",
        name: "article",
        component: () => import("@/views/Article/index.vue"),
      },
      {
        path: "comment",
        name: "comment",
        component: () => import("@/views/Comment/index.vue"),
      },
      {
        path: 'adopt',
        name: 'adopt',
        component: () => import('@/views/Adopt/index.vue'),
      },
      {
        path: 'adopt-applications',
        name: 'adoptApplications',
        component: () => import('@/views/Adopt/AdoptApplications.vue'),
      },
      {
        path: "notice",
        name: "notice",
        component: () => import("@/views/Notice/index.vue"),
      },
      {
        path: "service",
        name: "service",
        component: () => import("@/views/Service/index.vue"),
      },
      {
        path: "reserve",
        name: "reserve",
        component: () => import("@/views/Reserve/index.vue"),
      },
      {
        path: "pet",
        name: "pet",
        component: () => import("@/views/Pet/index.vue"),
      },
      {
        path: 'person',
        name: 'person',
        component: () => import('@/views/PersonCenter/index.vue'),
      }
    ],
  },
];
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;
