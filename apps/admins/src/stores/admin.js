import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAdminStore = defineStore(
  'admin',
  () => {
    const adminInfo = ref(null)
    const token = ref('')

    // 设置token和用户信息
    const setToken = (newToken) => {
      token.value = newToken
    }
    const setAdminInfo = (newAdminInfo) => {
      adminInfo.value = newAdminInfo
    }
    // 清除token和用户信息，退出登录后需要进行信息清除
    const clearAdminAuth = () => {
      adminInfo.value = null
      token.value = ''
    }

    // 这里的值可以直接在组件中使用
    return {
      adminInfo,
      token,
      setToken,
      setAdminInfo,
      clearAdminAuth
    }
  },
  {
    // 配置持久化存储，信息能够存到localStorage中
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'admin',
          storage: localStorage
        }
      ]
    }
  }
)