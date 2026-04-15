
const LoginRoutes = [
  {
    path:'/login',
    name:'login',
    component:()=>import('../../views/Login/index.vue'),
    meta:{title:'登录'}
  }
]

export default LoginRoutes