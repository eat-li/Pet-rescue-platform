<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getServiceListAPI } from '../../../api/service.js'
import { formatImageUrl } from '../../../utils/imgformat.js'

const router = useRouter()

// 尝试从父组件获取共享数据
const homeData = inject('homeData', null)

const serviceList = ref([])
const loading = ref(false)

const fetchServices = async () => {
  // 如果父组件已提供数据，直接使用
  if (homeData && homeData.services && homeData.services.length > 0) {
    serviceList.value = homeData.services
    return
  }
  
  // 兼容独立使用的情况，自己请求数据
  try {
    loading.value = true
    const res = await getServiceListAPI({ page: 1, limit: 4, status: 'true' })
    serviceList.value = res?.data?.data?.services || []
  } catch (err) {
    console.error('获取服务列表失败:', err)
    serviceList.value = []
  } finally {
    loading.value = false
  }
}

// 监听父组件数据变化
watch(
  () => homeData?.services,
  (newServices) => {
    if (newServices && newServices.length > 0) {
      serviceList.value = newServices
      loading.value = false
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 如果父组件没有提供数据，自己请求
  if (!homeData || !homeData.services || homeData.services.length === 0) {
    fetchServices()
  }
})

const goService = (id) => router.push(`/service/${id}`)
const goServiceList = () => router.push('/service')

// 服务类型映射
const serviceTypeMap = {
  basic_care:         '基础护理',
  beauty_styling:     '美容造型',
  health_medical:     '健康医疗',
  training_service:   '训练服务',
  special_experience: '特色体验'
}

const getTypeLabel = (type) => serviceTypeMap[type] || type
</script>

<template>
  <section class="pet-service-section">
    <!-- 区块标题 -->
    <div class="section-header">
      <div class="header-left">
        <div class="section-badge">宠物服务</div>
        <h2 class="section-title">专业护理 · 贴心服务</h2>
        <p class="section-sub">为您的毛孩子提供全方位专业宠物服务，每一次服务都是一次爱的呵护</p>
      </div>
      <button class="view-all-btn" @click="goServiceList">
        查看全部服务 →
      </button>
    </div>

    <!-- 热门服务卡片 -->
    <div class="service-showcase">
      <!-- 加载骨架 -->
      <template v-if="loading">
        <div v-for="i in 4" :key="i" class="service-card skeleton" />
      </template>

      <!-- 服务卡片 -->
      <template v-else-if="serviceList.length > 0">
        <div
          v-for="item in serviceList"
          :key="item.id"
          class="service-card"
          @click="goService(item.id)"
        >
          <!-- 服务图片 -->
          <div class="card-image">
            <img
              v-if="item.image"
              :src="formatImageUrl(item.image)"
              :alt="item.name"
              loading="lazy"
              class="service-img"
            >
            <div v-else class="card-image-placeholder">
              <span>🐾</span>
            </div>
          </div>
          
          <div class="card-body">
            <div class="card-type-badge">
              {{ getTypeLabel(item.type) }}
            </div>
            <h4 class="card-name">{{ item.name }}</h4>
            <p class="card-desc">{{ item.content }}</p>
            <div class="card-footer">
              <div class="card-price">
                <span class="price-symbol">¥</span>
                <span class="price-num">{{ item.price }}</span>
                <span class="price-unit">起</span>
              </div>
              <div class="card-weight">🐶 ≤{{ item.weight }}kg</div>
            </div>
            <button class="book-btn">立即预约</button>
          </div>
        </div>
      </template>

      <!-- 暂无数据 -->
      <div v-else class="no-data">
        <span>🐾</span>
        <p>暂无服务，敬请期待</p>
      </div>
    </div>

    <!-- 底部 CTA -->
    <div class="section-footer">
      <button class="cta-btn" @click="goServiceList">
        🐾 探索更多宠物服务
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.pet-service-section {
  background: #f5f7fa;
  padding: 60px 20px;
  width: 100%;
  box-sizing: border-box;
}

// ── 标题区域 ─────────────────────────────────────────────
.section-header {
  max-width: 1200px;
  margin: 0 auto 36px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left { flex: 1; min-width: 0; }

.section-badge {
  display: inline-block;
  padding: 4px 14px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 8px;
  line-height: 1.3;
}

.section-sub {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.6;
}

.view-all-btn {
  padding: 10px 22px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: #8b5cf6;
    color: #8b5cf6;
    background: #faf5ff;
  }
}

// ── 类型快捷入口 ──────────────────────────────────────────
.type-grid {
  max-width: 1200px;
  margin: 0 auto 36px;
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 14px;

  @media (max-width: 900px)  { grid-template-columns: repeat(3, 1fr); }
  @media (max-width: 480px)  { grid-template-columns: repeat(2, 1fr); }
}

.type-card {
  background: white;
  border-radius: 14px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  border: 1.5px solid #f0f0f0;
  transition: all 0.25s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--accent);
    transform: scaleX(0);
    transition: transform 0.25s;
  }

  &:hover {
    border-color: var(--accent);
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.1);
    background: var(--accent-bg);

    &::before { transform: scaleX(1); }
    .type-arrow { color: var(--accent); opacity: 1; }
  }
}

.type-icon  { font-size: 28px; }
.type-label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}
.type-arrow {
  font-size: 14px;
  color: #d1d5db;
  opacity: 0;
  transition: all 0.2s;
}

// ── 服务卡片展示 ──────────────────────────────────────────
.service-showcase {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px)  { grid-template-columns: 1fr; }
}

.service-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1.5px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
    border-color: #e0e7ff;
  }

  &.skeleton {
    cursor: default;
    .card-image { background: #f0f0f0; }
    &::after {
      content: '';
      display: block;
      height: 180px;
      background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
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
    transition: transform 0.3s ease;
  }

  .card-image-placeholder {
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

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}



.card-body {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.card-type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  width: fit-content;
}

.card-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  line-height: 1.4;
}

.card-desc {
  font-size: 12px;
  color: #9ca3af;
  line-height: 1.6;
  margin: 0;
  flex: 1;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
}

.card-price {
  display: flex;
  align-items: baseline;
  gap: 1px;
  color: #ef4444;
  .price-symbol { font-size: 12px; font-weight: 600; }
  .price-num    { font-size: 20px; font-weight: 800; line-height: 1; }
  .price-unit   { font-size: 11px; color: #9ca3af; margin-left: 2px; }
}

.card-weight {
  font-size: 11px;
  color: #9ca3af;
  background: #f9fafb;
  padding: 3px 8px;
  border-radius: 6px;
}

.book-btn {
  width: 100%;
  padding: 9px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    transform: scale(1.02);
  }
}

// ── 暂无数据 ──────────────────────────────────────────────
.no-data {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
  span { font-size: 40px; }
  p { font-size: 14px; color: #9ca3af; margin: 12px 0 0; }
}

// ── 底部 CTA ──────────────────────────────────────────────
.section-footer {
  max-width: 1200px;
  margin: 32px auto 0;
  display: flex;
  justify-content: center;
}

.cta-btn {
  padding: 14px 40px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.3);

  &:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4);
  }
}

@media (max-width: 640px) {
  .pet-service-section { padding: 40px 16px; }
  .section-title { font-size: 22px; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .view-all-btn { align-self: flex-start; }
}
</style>
