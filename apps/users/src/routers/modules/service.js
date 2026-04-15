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
  },
  {
    path: '/cart',
    name: 'cart',
    component: () => import('../../views/ServieCenter/Cart.vue'),
    meta: { title: '购物车' }
  }
]

export default serviceRoutes
