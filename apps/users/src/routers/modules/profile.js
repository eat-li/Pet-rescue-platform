
const profileRoutes = [
  {
    path: '/profile',
    name: 'profile',
    component: () => import("../../views/PersonCenter/index.vue"),
    meta: {
      title: "用户中心"
    },
    children: [
      // 账号信息
      {
        path: '',
        name: 'account',
        component: () => import("../../views/PersonCenter/Person/account.vue"),
        meta: {
          title: "账号信息"
        }
      }, {
        path: 'cart',
        name: 'cart',
        component: () => import("../../views/PersonCenter/Person/cart.vue"),
        meta: {
          title: "我的购物车"
        }
      }, {
        path: 'my-adoptions',
        name: 'myAdoptions',
        component: () => import("../../views/PersonCenter/Person/MyAdoptions.vue"),
        meta: {
          title: "我的领养"
        }
      }
    ] //子路由
  },
]

export default profileRoutes