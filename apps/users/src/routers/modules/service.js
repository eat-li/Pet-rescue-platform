const serviceRoutes = [
  {
    path: '/service',
    name: 'service',
    component: () => import('../../views/ServieCenter/index.vue'),
    meta: { title: '宠物服务' }
  },
  {
    path: '/service/:id',
    name: 'serviceDetail',
    component: () => import('../../views/ServieCenter/Services/Detail.vue'),
    meta: { title: '服务详情' }
  }
]

export default serviceRoutes
