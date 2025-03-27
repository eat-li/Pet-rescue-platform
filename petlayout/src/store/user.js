import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore(
  'user',
  () => {
    const userInfo = ref(null)
    const token = ref('')

    const setToken = (newToken) => {
      token.value = newToken
    }
    const setUserInfo = (newUserInfo) => {
      userInfo.value = newUserInfo
    }
    const clearAuth = () => {
      userInfo.value = null
      token.value = ''
    }

    return {
      userInfo,
      token,
      setToken,
      setUserInfo,
      clearAuth
    }
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'user',
          storage: localStorage
        }
      ]
    }
  }
)