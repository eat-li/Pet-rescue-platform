<script setup>
import { markRaw } from 'vue'
import { useRouter } from 'vue-router'
import { formatImageUrl } from '@/utils/imgformat'
import { addToCartAPI } from '@/api/service'
import { useUserStore } from '@/stores/user'
import { ref } from 'vue'
import { useToast } from '@/hooks/Common/useToast.js'
import { BathIcon, ScissorsIcon, PillIcon, BallIcon, StarIcon, PawIcon, CartIcon } from '../../../components/Icons'

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
  basic_care:         { label: '基础护理', icon: markRaw(BathIcon), color: '#3b82f6', bg: '#eff6ff' },
  beauty_styling:     { label: '美容造型', icon: markRaw(ScissorsIcon), color: '#f97316', bg: '#fff7ed' },
  health_medical:     { label: '健康医疗', icon: markRaw(PillIcon), color: '#ef4444', bg: '#fef2f2' },
  training_service:   { label: '训练服务', icon: markRaw(BallIcon), color: '#f59e0b', bg: '#fffbeb' },
  special_experience: { label: '特色体验', icon: markRaw(StarIcon), color: '#10b981', bg: '#ecfdf5' }
}

const typeInfo = typeMap[props.service.type] || { label: props.service.type, icon: markRaw(PawIcon), color: '#6b7280', bg: '#f9fafb' }

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
        <PawIcon :size="48" color="#f97316" />
      </div>
      <div class="image-overlay"></div>
    </div>

    <div class="card-body">
      <!-- 类型标签 -->
      <div class="type-badge" :style="{ color: typeInfo.color, background: typeInfo.bg }">
        <component :is="typeInfo.icon" :size="14" :color="typeInfo.color" />
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
          ≤ {{ service.weight }} kg
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="cart-btn" :disabled="addingToCart" @click="handleAddToCart">
          <span v-if="addingToCart">添加中...</span>
          <span v-else>
            <CartIcon :size="14" />
            加入购物车
          </span>
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
  transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.14);
    border-color: rgba(249, 115, 22, 0.2);

    .service-img {
      transform: scale(1.06);
    }

    .image-overlay {
      opacity: 0.35;
    }
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
    transition: transform 0.4s ease;
  }

  .image-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60%;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.25), transparent);
    opacity: 0.15;
    transition: opacity 0.3s ease;
    pointer-events: none;
  }

  .image-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
  }
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
  color: #f97316;
  border: 1.5px solid #f97316;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  &:hover:not(:disabled) {
    background: #fff7ed;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.book-btn {
  flex: 1;
  padding: 10px;
  background: linear-gradient(135deg, #ff9a3c, #f97316);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4);
  }
}
</style>
