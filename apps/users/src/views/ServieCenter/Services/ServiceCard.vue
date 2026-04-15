<script setup>
import { useRouter } from 'vue-router'
import { formatImageUrl } from '@/utils/imgformat'
import { addToCartAPI } from '@/api/service'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'
import { useToast } from '@/hooks/Common/useToast.js'

const props = defineProps({
  service: { type: Object, required: true }
})

const emit = defineEmits(['refresh'])

const router = useRouter()
const userStore = useUserStore()
const addingToCart = ref(false)

// Toast 功能
const { showSuccess, showError } = useToast()

const typeMap = {
  basic_care:         { label: '基础护理', icon: '🛁', color: '#3b82f6', bg: '#eff6ff' },
  beauty_styling:     { label: '美容造型', icon: '✂️', color: '#8b5cf6', bg: '#f5f3ff' },
  health_medical:     { label: '健康医疗', icon: '💊', color: '#ef4444', bg: '#fef2f2' },
  training_service:   { label: '训练服务', icon: '🎾', color: '#f59e0b', bg: '#fffbeb' },
  special_experience: { label: '特色体验', icon: '⭐', color: '#10b981', bg: '#ecfdf5' }
}

const typeInfo = typeMap[props.service.type] || { label: props.service.type, icon: '🐾', color: '#6b7280', bg: '#f9fafb' }

const goDetail = () => {
  router.push(`/service/${props.service.id}`)
}

// 加入购物车
const handleAddToCart = async (e) => {
  e.stopPropagation()
  
  if (!userStore.token) {
    router.push('/login')
    return
  }

  try {
    addingToCart.value = true
    const res = await addToCartAPI({ serviceId: props.service.id })
    if (res?.data?.code === 201) {
      showSuccess('已添加到购物车')
    } else {
      showError(res?.data?.message || '添加失败')
    }
  } catch (err) {
    console.error('添加购物车失败:', err)
    showError(err.message || '添加失败')
  } finally {
    addingToCart.value = false
  }
}

// 立即预约
const handleBook = (e) => {
  e.stopPropagation()
  
  if (!userStore.token) {
    router.push('/login')
    return
  }
  
  router.push(`/service/${props.service.id}?action=book`)
}
</script>

<template>
  <div class="service-card" @click="goDetail">
    <!-- 服务图片 -->
    <div class="card-image">
      <img 
        v-if="service.image" 
        :src="formatImageUrl(service.image)" 
        :alt="service.name"
        class="service-img"
      >
      <div v-else class="image-placeholder">
        <span>🐾</span>
      </div>
    </div>

    <div class="card-body">
      <!-- 类型标签 -->
      <div class="type-badge" :style="{ color: typeInfo.color, background: typeInfo.bg }">
        <span>{{ typeInfo.icon }}</span>
        <span>{{ typeInfo.label }}</span>
      </div>

      <!-- 服务名称 -->
      <h3 class="service-name">{{ service.name }}</h3>

      <!-- 描述摘要 -->
      <p class="service-desc">{{ service.content }}</p>

      <!-- 底部信息 -->
      <div class="card-footer">
        <div class="price-block">
          <span class="price-unit">¥</span>
          <span class="price-num">{{ service.price }}</span>
          <span class="price-sub">起</span>
        </div>
        <div class="weight-info">
          🐶 ≤ {{ service.weight }} kg
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="cart-btn" :disabled="addingToCart" @click="handleAddToCart">
          <span v-if="addingToCart">添加中...</span>
          <span v-else>🛒 加入购物车</span>
        </button>
        <button class="book-btn" @click="handleBook">立即预约</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.service-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  border: 1.5px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 28px rgba(0, 0, 0, 0.12);
    border-color: #e0e7ff;
  }
}

// ── 服务图片区域 ──────────────────────────────────────────
.card-image {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background: #f8f9fa;
  position: relative;

  .service-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);

    span {
      font-size: 48px;
      opacity: 0.5;
    }
  }
}

.service-card:hover .service-img {
  transform: scale(1.05);
}

.card-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  width: fit-content;
}

.service-name {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  line-height: 1.4;
}

.service-desc {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;
}

.price-block {
  display: flex;
  align-items: baseline;
  gap: 2px;
  color: #ef4444;

  .price-unit { font-size: 13px; font-weight: 600; }
  .price-num  { font-size: 24px; font-weight: 800; line-height: 1; }
  .price-sub  { font-size: 12px; color: #9ca3af; margin-left: 2px; }
}

.weight-info {
  font-size: 12px;
  color: #9ca3af;
  background: #f9fafb;
  padding: 4px 10px;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.cart-btn {
  flex: 1;
  padding: 10px;
  background: white;
  color: #6366f1;
  border: 1.5px solid #6366f1;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover:not(:disabled) {
    background: #f5f3ff;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.book-btn {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    transform: scale(1.02);
  }
}
</style>
