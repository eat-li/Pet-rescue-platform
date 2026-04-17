import axios from 'axios'
import { useUserStore } from '../stores/user'
export const baseURL = 'http://localhost:3000'

// 标记是否正在处理登出，防止多次触发
let isHandling401 = false

const Instance = axios.create({
  baseURL,
  timeout: 5000
})

// 添加请求拦截器
Instance.interceptors.request.use(function (config) {
  // 在发送请求之前做些什么

  const userStore = useUserStore()
  const token = userStore.token

  // 如果token存在，添加到请求头中
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }


  return config;
}, function (error) {
  // 对请求错误做些什么
  return Promise.reject(error);
});

// 添加响应拦截器
Instance.interceptors.response.use(
  function (response) {
    // 2xx 范围内的状态码都会触发该函数
    // 对响应数据做点什么
    return response;
  },
  function (error) {
    // 超出 2xx 范围的状态码都会触发该函数
    // 对响应错误做点什么

    // 处理401未授权错误（token过期或无效）
    if (error.response && error.response.status === 401) {
      if (!isHandling401) {
        isHandling401 = true
        
        // 清除用户认证信息
        const userStore = useUserStore()
        userStore.clearAuth()
        
        // 提示用户
        alert('登录已过期，请重新登录')
        
        // 跳转到登录页
        window.location.href = '/login'
      }
      return Promise.reject(new Error('登录已过期，请重新登录'))
    }

    // 如果有响应数据，提取后端返回的错误信息
    if (error.response && error.response.data) {
      const errorData = error.response.data;

      // 创建一个新的错误对象，包含后端的错误信息
      const customError = new Error(errorData.message || '请求失败');
      customError.code = errorData.code || error.response.status;
      customError.data = errorData;
      customError.status = error.response.status;

      return Promise.reject(customError);
    }

    // 网络错误或其他错误
    if (error.code === 'ECONNABORTED') {
      const timeoutError = new Error('请求超时，请稍后重试');
      timeoutError.code = 'TIMEOUT';
      return Promise.reject(timeoutError);
    }

    if (!error.response) {
      const networkError = new Error('网络连接失败，请检查网络');
      networkError.code = 'NETWORK_ERROR';
      return Promise.reject(networkError);
    }

    return Promise.reject(error);
  }
);

export default Instance;