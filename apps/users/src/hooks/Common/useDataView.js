import { ref } from 'vue'
import { getPetCountAPI } from '@/api/pet'
import { getUserCountAPI } from '@/api/user'

// 数据视图
export const useDataView = () => {
  const petCount = ref(0)
  const userCount = ref(0)
  const getPetCount = async () => {
    try {
      const data = await getPetCountAPI()
      petCount.value = data.data
    } catch (err) {
      console.error('获取宠物数量失败:', err)
    }
  }
  const getUserCount = async () => {
    try {
      const data = await getUserCountAPI()
      userCount.value = data.data
    } catch (err) {
      console.error('获取用户数量失败:', err)
    }
  }
  return {
    petCount,
    userCount,
    getPetCount,
    getUserCount,
  }
}
