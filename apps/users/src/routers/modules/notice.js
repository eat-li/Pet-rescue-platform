
const noticeRoutes = [
  {
    path: '/notice/:id',
    name: 'noticeDetail',
    component: () => import("@/views/Notice/Detail.vue"),
    meta: {
      title: "公告详情"
    }
  }
]

export default noticeRoutes
