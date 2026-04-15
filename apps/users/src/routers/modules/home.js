
const homeRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import("../../views/Home/index.vue"),
    meta: {
      title: "首页"
    },
    children: [] //子路由
  },
]

export default homeRoutes