import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'userinfo',
  () => {
    const userInfo = ref({})
    const token = ref('')
    //设置token和用户信息
    const setToken = (newToken) => {
      token.value = newToken
    }
    const setUserInfo = (newUserInfo) => {
      userInfo.value = newUserInfo
    }
    const clearAuth = () => {
      userInfo.value = {}
      token.value = ''
    }

    return {
      userInfo,
      token,
      setToken,
      setUserInfo,
      clearAuth,
    }
  },
  {
    persist: {
      key: 'pet-platform-user', // 存储的key名称
      storage: localStorage, // 使用localStorage存储
      paths: ['userInfo', 'token'], // 指定需要持久化的状态
    }
  }
)