
const communityRoutes = [
  {
    path: '/posts',
    name: 'posts',
    component: () => import("@/views/Community/index.vue"),
    meta: {
      title: "社区"
    },
    children: [
    ] //子路由
  }, {
    path: '/posts/:id',
    name: 'postDetail',
    component: () => import("../../views/Community/Posts/Detail.vue"),
    meta: {
      title: "文章详情"
    }
  }, {
    path: '/createpost',
    name: 'postAdd',
    component: () => import("../../views/Community/Posts/CreateNotice.vue"),
    meta: {
      title: '发布文章'
    }

  }
]

export default communityRoutes