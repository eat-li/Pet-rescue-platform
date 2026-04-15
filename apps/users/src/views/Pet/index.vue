<script setup>
import PersonMenu from '../../components/Common/PersonMenu.vue'
import Addbutton from '../../components/Common/Addbutton.vue'
import SampleNav from '../../components/Common/SampleNav.vue'
import PetCard from './components/PetCard.vue'
import { ref, onMounted } from 'vue'
import { getPetListAPI } from '@/api/pet'

const petlist = [
  {
    title: '我的宠物',
    icon: '🏠',
    type: 'mypet'
  },
  {
    title: '我的收养',
    icon: '👤',
    type: 'myadopt'
  },
]

// 宠物数据
const petData = ref([])
const loading = ref(false)
const error = ref(null)

// 分页数据
const pagination = ref({
  currentPage: 1,
  limit: 6,
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
})

// 获取宠物列表
const fetchPets = async (page = 1) => {
  try {
    loading.value = true
    error.value = null
    const result = await getPetListAPI({
      page: page,
      limit: pagination.value.limit
    })
    
    // 后端返回的 data 中包含 pets 数组和 pagination
    if (result && result.pets) {
      petData.value = result.pets
      // 更新分页信息
      if (result.pagination) {
        pagination.value = {
          ...pagination.value,
          ...result.pagination
        }
      }
      console.log('获取宠物列表成功:', petData.value)
    } else {
      console.warn('返回数据格式异常:', result)
      petData.value = []
    }
  } catch (err) {
    console.error('获取宠物列表失败:', err)
    error.value = err.message || '加载失败，请稍后重试'
    petData.value = []
  } finally {
    loading.value = false
  }
}

// 切换页码
const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return
  if (page === pagination.value.currentPage) return
  if (!pagination.value.hasNextPage && page > pagination.value.currentPage) return
  if (!pagination.value.hasPreviousPage && page < pagination.value.currentPage) return
  
  fetchPets(page)
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  fetchPets()
})

</script>

<template>
  <SampleNav />
  
  <div class="pet-page-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">🐾</div>
      <p class="loading-text">正在加载宠物信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">😿</div>
      <p class="error-text">{{ error }}</p>
      <button @click="fetchPets" class="retry-button">重新加载</button>
    </div>

    <!-- 宠物卡片列表 -->
    <div v-else>
      <PetCard :petList="petData" />
      
      <!-- 分页组件 -->
      <div v-if="pagination.totalPages > 1" class="pagination-container">
        <button 
          class="page-btn prev"
          :disabled="!pagination.hasPreviousPage"
          @click="changePage(pagination.currentPage - 1)"
        >
          ← 上一页
        </button>
        
        <div class="page-numbers">
          <button 
            v-for="page in pagination.totalPages" 
            :key="page"
            :class="['page-number', { active: page === pagination.currentPage }]"
            @click="changePage(page)"
          >
            {{ page }}
          </button>
        </div>
        
        <button 
          class="page-btn next"
          :disabled="!pagination.hasNextPage"
          @click="changePage(pagination.currentPage + 1)"
        >
          下一页 →
        </button>
      </div>
    </div>
  </div>

  <Addbutton :to="'/createpet'" />
</template>

<style scoped lang="scss">
.pet-page-container {
  padding-bottom: 80px;
  min-height: calc(100vh - 200px);
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .loading-spinner {
    font-size: 48px;
    animation: bounce 1s ease-in-out infinite;
    margin-bottom: 16px;
  }

  .loading-text {
    font-size: 16px;
    color: #666;
    margin: 0;
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;

  .error-icon {
    font-size: 48px;
    margin-bottom: 16px;
  }

  .error-text {
    font-size: 16px;
    color: #e74c3c;
    margin: 0 0 20px 0;
  }

  .retry-button {
    padding: 10px 24px;
    background: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      background: #2980b9;
      transform: translateY(-2px);
    }
  }
}

.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  margin-top: 16px;

  .page-btn {
    padding: 10px 20px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;

    &:hover:not(:disabled) {
      background: #f5f5f5;
      border-color: #ccc;
      transform: translateY(-2px);
    }

    &:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    &.prev,
    &.next {
      min-width: 100px;
    }
  }

  .page-numbers {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .page-number {
    min-width: 40px;
    height: 40px;
    padding: 8px 12px;
    background: white;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    font-size: 14px;
    color: #666;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;

    &:hover {
      background: #f5f5f5;
      border-color: #3498db;
      transform: translateY(-2px);
    }

    &.active {
      background: #3498db;
      border-color: #3498db;
      color: white;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
    }
  }
}
</style>