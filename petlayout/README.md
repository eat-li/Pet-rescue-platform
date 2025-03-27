## 基础项目目录配置和构建-xinjieli2025-3-27

1. 项目目录结构配置
```
src
  - api
  - commponents
  - http
  - mock
  - router
  - store
  - views
  - utils
  - App.vue
  - main.js
```
2. mock数据配置
详见mock/db.json
3. 路由搭建
暂时构建了一个登录页，未做其他页面
4. 配置axios
http/request配置了axios实例，请求拦截器，响应拦截器
5. 配置pinia
pinia做了持久化存储用户信息和token,在登录页登录成功后，会跳转到首页，首页会根据是否有token来判断是否登录，如果没有token，则跳转到登录页
6. 构建登录组件
做了一个简单的登录和注册功能，使用的是elementplus,在views/loginpage/index.vue
7. 登录注册验证
做了一个登录和注册的服务api/user.js