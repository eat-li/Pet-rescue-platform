
import homeRoutes from "./home"


const layoutRoutes = [
  {
    path: '/',
    name: 'layout',
    component: () => import("../../views/Layout/index.vue"),
    meta: {
      title: "首页"
    },
    children: [
      ...homeRoutes,
    ] //子路由
  },
]

export default layoutRoutes