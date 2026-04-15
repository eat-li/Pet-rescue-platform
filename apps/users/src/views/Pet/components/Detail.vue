<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SampleNav from '@/components/Common/SampleNav.vue'
import PersonMenu from '@/components/Common/PersonMenu.vue'
import { getPetDetailAPI } from '@/api/pet'

const route = useRoute()
const router = useRouter()

// 宠物详情数据
const petDetail = ref(null)
const loading = ref(false)
const error = ref(null)

// 计算年龄
const calculateAge = (birthday) => {
  if (!birthday) return '未知'
  const birth = new Date(birthday)
  const now = new Date()
  const ageInMs = now - birth
  const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365))
  const ageInMonths = Math.floor((ageInMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))

  if (ageInYears > 0) {
    return `${ageInYears}岁${ageInMonths > 0 ? ageInMonths + '个月' : ''}`
  } else {
    return `${ageInMonths}个月`
  }
}

// 疫苗状态映射
const vaccineStatusMap = {
  'unvaccinated': '未接种',
  'one_dose': '1 剂',
  'two_doses': '2 剂',
  'three_doses': '3 剂',
  'completed': '已完成'
}

// 获取图片 URL
const getImageUrl = (path) => {
  if (!path || path === '图片链接') {
    return 'https://via.placeholder.com/400'
  }
  return `http://localhost:3000${path}`
}

// 性别显示
const getSexDisplay = (sex) => {
  return sex ? '♂ 公' : '♀ 母'
}

// 获取宠物详情
const fetchPetDetail = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await getPetDetailAPI(route.params.id)
    petDetail.value = response
    console.log('获取宠物详情成功:', petDetail.value)
    
  } catch (err) {
    console.error('获取宠物详情失败:', err)
    error.value = err.message || '加载失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPetDetail()
})
</script>

<template>
  <SampleNav />
  
  <div class="detail-page-container">
    <!-- 返回按钮 -->
    <button class="back-button" @click="$router.back()">
      ← 返回
    </button>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">🐾</div>
      <p class="loading-text">正在加载宠物信息...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">😿</div>
      <p class="error-text">{{ error }}</p>
      <button @click="fetchPetDetail" class="retry-button">重新加载</button>
    </div>

    <!-- 宠物详情 -->
    <div v-else-if="petDetail" class="pet-detail-card">
      <!-- 宠物大图 -->
      <div class="pet-avatar-large">
        <img :src="getImageUrl(petDetail.image)" :alt="petDetail.nickName" class="pet-image-large" />
      </div>

      <!-- 宠物基本信息 -->
      <div class="pet-detail-info">
        <h1 class="pet-detail-name">{{ petDetail.nickName }}</h1>

        <!-- 基本信息网格 -->
        <div class="info-grid">
          <div class="info-item-large">
            <span class="info-label">类型</span>
            <span class="info-value type">{{ petDetail.type }}</span>
          </div>
          <div class="info-item-large">
            <span class="info-label">品种</span>
            <span class="info-value breed">{{ petDetail.breed }}</span>
          </div>
          <div class="info-item-large">
            <span class="info-label">性别</span>
            <span class="info-value sex" :class="petDetail.sex ? 'male' : 'female'">
              {{ getSexDisplay(petDetail.sex) }}
            </span>
          </div>
          <div class="info-item-large">
            <span class="info-label">年龄</span>
            <span class="info-value age">{{ calculateAge(petDetail.birthday) }}</span>
          </div>
        </div>

        <!-- 疫苗状态 -->
        <div class="vaccine-section">
          <span class="info-label">疫苗接种</span>
          <span class="vaccine-badge" :class="`vaccine-${petDetail.vaccineStatus}`">
            💉 {{ vaccineStatusMap[petDetail.vaccineStatus] || petDetail.vaccineStatus }}
          </span>
        </div>

        <!-- 特征标签 -->
        <div v-if="petDetail.nature && petDetail.nature.length > 0" class="tags-section-large">
          <h3 class="section-title">🏷️ 特征</h3>
          <div class="tags-container-large">
            <span v-for="trait in petDetail.nature" :key="trait" class="tag-large nature-tag">
              {{ trait }}
            </span>
          </div>
        </div>

        <!-- 爱好标签 -->
        <div v-if="petDetail.hobby && petDetail.hobby.length > 0" class="tags-section-large">
          <h3 class="section-title">❤️ 爱好</h3>
          <div class="tags-container-large">
            <span v-for="hobby in petDetail.hobby" :key="hobby" class="tag-large hobby-tag">
              {{ hobby }}
            </span>
          </div>
        </div>

        <!-- 其他信息 -->
        <div v-if="petDetail.other_msg" class="other-info-large">
          <h3 class="section-title">📝 其他信息</h3>
          <p class="other-text-large">{{ petDetail.other_msg }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.detail-page-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  padding-bottom: 80px;
}

.back-button {
  display: inline-flex;
  align-items: center;
  padding: 10px 20px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;

  &:hover {
    background: #f5f5f5;
    transform: translateX(-4px);
  }
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

.pet-detail-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pet-avatar-large {
  width: 100%;
  height: 300px;
  overflow: hidden;
  background: #f5f5f5;

  .pet-image-large {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.pet-detail-info {
  padding: 24px;

  .pet-detail-name {
    font-size: 28px;
    font-weight: 700;
    color: #2d3748;
    margin: 0 0 20px 0;
    text-align: center;
  }

  .info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 20px;
  }

  .info-item-large {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;
    gap: 8px;

    .info-label {
      font-size: 13px;
      color: #6c757d;
      font-weight: 500;
    }

    .info-value {
      font-size: 16px;
      font-weight: 600;
      padding: 6px 12px;
      border-radius: 8px;

      &.type {
        background: #e6f3ff;
        color: #0066cc;
      }

      &.breed {
        background: #f0f9ff;
        color: #0284c7;
      }

      &.sex {
        &.male {
          background: #dbeafe;
          color: #1d4ed8;
        }

        &.female {
          background: #fce7f3;
          color: #be185d;
        }
      }

      &.age {
        background: #fef3c7;
        color: #d97706;
      }
    }
  }

  .vaccine-section {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;
    margin-bottom: 20px;

    .info-label {
      font-size: 14px;
      color: #6c757d;
      font-weight: 500;
    }

    .vaccine-badge {
      font-size: 14px;
      font-weight: 600;
      padding: 8px 16px;
      border-radius: 8px;

      &.vaccine-unvaccinated {
        background: #fee2e2;
        color: #dc2626;
      }

      &.vaccine-one_dose,
      &.vaccine-two_doses {
        background: #fef3c7;
        color: #d97706;
      }

      &.vaccine-three_doses {
        background: #dbeafe;
        color: #2563eb;
      }

      &.vaccine-completed {
        background: #dcfce7;
        color: #16a34a;
      }
    }
  }

  .tags-section-large {
    margin-bottom: 20px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #4a5568;
      margin: 0 0 12px 0;
    }

    .tags-container-large {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag-large {
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;

      &.nature-tag {
        background: #f3e8ff;
        color: #7c3aed;
      }

      &.hobby-tag {
        background: #ecfdf5;
        color: #059669;
      }
    }
  }

  .other-info-large {
    padding: 16px;
    background: #f8f9fa;
    border-radius: 12px;

    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #4a5568;
      margin: 0 0 12px 0;
    }

    .other-text-large {
      font-size: 14px;
      color: #718096;
      line-height: 1.6;
      margin: 0;
    }
  }
}
</style>