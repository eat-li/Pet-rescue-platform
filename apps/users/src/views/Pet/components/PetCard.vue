<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  petList: {
    type: Array,
    default: () => []
  }
})

const router = useRouter()

// 跳转到宠物详情页
const goToDetail = (pet) => {
  router.push(`/pet/${pet.id}`)
}

console.log('PetCard received petList:', props.petList);
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
  'one_dose': '1剂',
  'two_doses': '2剂',
  'three_doses': '3剂',
  'completed': '已完成'
}

const getImageUrl = (path) => {
  if (!path || path === '图片链接') {
    // 返回一个默认的占位图或者为空
    return 'https://via.placeholder.com/150'
  }
  // 假设所有图片路径都以 / 开头，并且需要拼接基础 URL
  return `http://localhost:3000${path}`
}

// 性别显示
const getSexDisplay = (sex) => {
  return sex ? '♂ 公' : '♀ 母'
}
</script>

<template>
  <div class="pet-cards-container">
    <div 
      v-for="pet in petList" 
      :key="pet.id" 
      class="pet-card"
      @click="goToDetail(pet)"
    >
      <!-- 宠物头像 -->
      <div class="pet-avatar">
        <img :src="getImageUrl(pet.image)" :alt="pet.nickName" class="pet-image" />
      </div>

      <!-- 宠物基本信息 -->
      <div class="pet-info">
        <h3 class="pet-name">{{ pet.nickName }}</h3>

        <!-- 基本信息行 -->
        <div class="info-row">
          <span class="info-item type">{{ pet.type }}</span>
          <span class="info-item breed">{{ pet.breed }}</span>
        </div>

        <div class="info-row">
          <span class="info-item sex" :class="pet.sex ? 'male' : 'female'">
            {{ getSexDisplay(pet.sex) }}
          </span>
          <span class="info-item age">{{ calculateAge(pet.birthday) }}</span>
        </div>

        <!-- 疫苗状态 -->
        <div class="vaccine-row">
          <span class="info-item vaccine" :class="`vaccine-${pet.vaccineStatus}`">
            💉 {{ vaccineStatusMap[pet.vaccineStatus] || pet.vaccineStatus }}
          </span>
        </div>

        <!-- 特征标签 -->
        <div v-if="pet.nature && pet.nature.length > 0" class="tags-section">
          <h4 class="tags-title">特征</h4>
          <div class="tags-container">
            <span v-for="trait in pet.nature" :key="trait" class="tag nature-tag">
              {{ trait }}
            </span>
          </div>
        </div>

        <!-- 爱好标签 -->
        <div v-if="pet.hobby && pet.hobby.length > 0" class="tags-section">
          <h4 class="tags-title">爱好</h4>
          <div class="tags-container">
            <span v-for="hobby in pet.hobby" :key="hobby" class="tag hobby-tag">
              {{ hobby }}
            </span>
          </div>
        </div>

        <!-- 其他信息 -->
        <div v-if="pet.other_msg" class="other-info">
          <p class="other-text">{{ pet.other_msg }}</p>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="petList.length === 0" class="empty-state">
      <div class="empty-icon">🐾</div>
      <p class="empty-text">暂无宠物信息</p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.pet-cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  padding: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
    padding: 12px;
  }
}

.pet-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  max-width: 320px;
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
}

.pet-avatar {
  position: relative;
  width: 100%;
  height: 120px; // 从 160px 减小到 120px
  overflow: hidden;

  .pet-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;

    &:hover {
      transform: scale(1.03);
    }
  }
}

.pet-info {
  padding: 12px; // 从 16px 减小到 12px

  .pet-name {
    font-size: 16px; // 从 18px 减小到 16px
    font-weight: 600;
    color: #2d3748;
    margin: 0 0 10px 0; // 从 12px 减小到 10px
    text-align: center;
    line-height: 1.2;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px; // 从 8px 减小到 6px
    gap: 8px;
  }

  .vaccine-row {
    display: flex;
    justify-content: center;
    margin-bottom: 10px; // 从 12px 减小到 10px
  }

  .info-item {
    padding: 3px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 500;
    flex: 1;
    text-align: center;

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

    &.vaccine {
      font-size: 12px;
      padding: 4px 12px;

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

  .tags-section {
    margin-top: 10px; // 从 12px 减小到 10px

    .tags-title {
      font-size: 12px;
      font-weight: 600;
      color: #4a5568;
      margin: 0 0 4px 0; // 从 6px 减小到 4px
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .tag {
      padding: 2px 6px;
      border-radius: 6px;
      font-size: 10px;
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

  .other-info {
    margin-top: 10px; // 从 12px 减小到 10px
    padding-top: 10px; // 从 12px 减小到 10px
    border-top: 1px solid #f7fafc;

    .other-text {
      font-size: 11px;
      color: #718096;
      line-height: 1.4;
      margin: 0;
      text-align: center;
    }
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 40px 20px;

  .empty-icon {
    font-size: 36px;
    margin-bottom: 12px;
  }

  .empty-text {
    font-size: 14px;
    color: #a0aec0;
    margin: 0;
  }
}
</style>