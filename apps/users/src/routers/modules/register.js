
const RegisterRoutes = [
  {
    path: '/register',
    name: 'register',
    component: () => import('../../views/Register/index.vue'),
    meta: { title: '注册' }
  }
]

export default RegisterRoutes