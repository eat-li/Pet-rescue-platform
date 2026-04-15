
const adoptRoutes = [
  {
    path: '/adopt',
    name: 'adopt',
    component: () => import('../../views/Adoption/index.vue'),
    meta: { title: '宠物领养' }
  },
  {
    // 发布领养（必须在 /:id 之前，防止路由冲突）
    path: '/adopt/create',
    name: 'adoptCreate',
    component: () => import('../../views/Adoption/Posts/CreateAdoption.vue'),
    meta: { title: '发布领养' }
  },
  {
    // 领养详情
    path: '/adopt/:id',
    name: 'adoptDetail',
    component: () => import('../../views/Adoption/Posts/Detail.vue'),
    meta: { title: '领养详情' }
  }
]

export default adoptRoutes
