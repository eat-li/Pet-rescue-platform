<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ServiceCard from './Services/ServiceCard.vue'
import { getServiceListAPI } from '@/api/service'
import Toast from '@/components/Common/Toast.vue'
import { useToast } from '@/hooks/Common/useToast.js'
import { PawIcon, BathIcon, ScissorsIcon, PillIcon, BallIcon, StarIcon, CartIcon } from '@/components/Icons'

const router = useRouter()

// Toast
const { showToast, toastMessage, toastType, duration, hideToast } = useToast()

// ── 数据 ─────────────────────────────────────────────────
const serviceList = ref([])
const loading = ref(false)
const error = ref(null)
const pagination = ref({
  currentPage: 1,
  pageSize: 9,
  totalItems: 0,
  totalPages: 0
})

// ── 筛选 ─────────────────────────────────────────────────
const typeOptions = [
  { label: '全部',     value: '',                 icon: PawIcon },
  { label: '基础护理', value: 'basic_care',         icon: BathIcon },
  { label: '美容造型', value: 'beauty_styling',     icon: ScissorsIcon },
  { label: '健康医疗', value: 'health_medical',     icon: PillIcon },
  { label: '训练服务', value: 'training_service',   icon: BallIcon },
  { label: '特色体验', value: 'special_experience', icon: StarIcon }
]

const activeType = ref('')

watch(activeType, () => {
  pagination.value.currentPage = 1
  fetchList(1)
})

// ── 拉取数据 ──────────────────────────────────────────────
const fetchList = async (page = 1) => {
  try {
    loading.value = true
    error.value = null
    const params = {
      page,
      limit: pagination.value.pageSize,
      status: 'true'   // 只显示上架的服务
    }
    if (activeType.value) params.type = activeType.value

    const res = await getServiceListAPI(params)
    const data = res?.data?.data

    if (data) {
      serviceList.value = data.services || []
      pagination.value = {
        ...pagination.value,
        currentPage: page,
        totalItems: data.pagination?.totalItems || 0,
        totalPages: data.pagination?.totalPages || 0
      }
    }
  } catch (err) {
    error.value = err.message || '加载失败，请稍后重试'
    serviceList.value = []
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return
  fetchList(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => fetchList(1))
</script>

<template>
  <div class="service-page">
    <!-- Toast 组件 -->
    <Toast
      :show-toast="showToast"
      :toast-message="toastMessage"
      :toast-type="toastType"
      :duration="duration"
      @hide-toast="hideToast"
    />
    <!-- 顶部导航 -->
    <nav class="top-nav">
      <div class="nav-inner">
        <button class="back-btn" @click="router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          返回首页
        </button>
        <span class="nav-title">宠物服务</span>
        <button class="nav-cart-btn" @click="router.push('/profile/cart')">
          <CartIcon :size="14" /> 购物车
        </button>
      </div>
    </nav>

    <!-- 标题区 -->
    <div class="page-header">
      <div class="hero-decor">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <div class="header-inner">
        <h1>专业护理，贴心服务</h1>
        <p>目前共有 <strong>{{ pagination.totalItems }}</strong> 项服务</p>
      </div>
    </div>

    <div class="main-content">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <span class="filter-label">服务类型</span>
        <div class="filter-tabs">
          <button
            v-for="opt in typeOptions"
            :key="opt.value"
            :class="['filter-tab', { active: activeType === opt.value }]"
            @click="activeType = opt.value"
          >
            <component :is="opt.icon" :size="14" /> {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 结果提示 -->
      <div class="result-info">
        共 <strong>{{ pagination.totalItems }}</strong> 项服务
        <span v-if="pagination.totalPages > 1">，第 {{ pagination.currentPage }} / {{ pagination.totalPages }} 页</span>
      </div>

      <!-- 加载中：骨架屏 -->
      <div v-if="loading" class="skeleton-grid">
        <div v-for="n in 9" :key="n" class="skeleton-card">
          <div class="skeleton-img shimmer"></div>
          <div class="skeleton-body">
            <div class="skeleton-line w-40 shimmer"></div>
            <div class="skeleton-line w-70 shimmer"></div>
            <div class="skeleton-line w-90 shimmer"></div>
            <div class="skeleton-line w-50 shimmer"></div>
          </div>
        </div>
      </div>

      <!-- 错误 -->
      <div v-else-if="error" class="error-state">
        <PawIcon :size="56" color="#ef4444" class="empty-icon-svg" />
        <p>{{ error }}</p>
        <button class="reset-btn" @click="fetchList(1)">重新加载</button>
      </div>

      <!-- 卡片列表 -->
      <TransitionGroup v-else-if="serviceList.length > 0" name="card-stagger" tag="div" class="cards-grid">
        <ServiceCard
          v-for="(item, index) in serviceList"
          :key="item.id"
          :service="item"
          :style="{ '--stagger-index': index }"
        />
      </TransitionGroup>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <PawIcon :size="56" color="#f97316" class="empty-icon-svg" />
        <p class="empty-text">暂无该类型的服务</p>
        <p class="empty-sub">试试选择其他类型，或查看全部服务</p>
        <button class="reset-btn" @click="activeType = ''">查看全部</button>
      </div>

      <!-- 分页 -->
      <div v-if="!loading && pagination.totalPages > 1" class="pagination">
        <button
          class="page-btn"
          :disabled="pagination.currentPage <= 1"
          @click="changePage(pagination.currentPage - 1)"
        >‹ 上一页</button>
        <div class="page-numbers">
          <button
            v-for="p in pagination.totalPages"
            :key="p"
            :class="['page-num', { active: p === pagination.currentPage }]"
            @click="changePage(p)"
          >{{ p }}</button>
        </div>
        <button
          class="page-btn"
          :disabled="pagination.currentPage >= pagination.totalPages"
          @click="changePage(pagination.currentPage + 1)"
        >下一页 ›</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.service-page {
  min-height: 100vh;
  background: #f8f9fb;
}

// ── 顶部导航 ────────────────────────────────────────────
.top-nav {
  background: white;
  border-bottom: 1px solid #f0f0f0;
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 20px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 13px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 8px;
  transition: all 0.15s;

  &:hover {
    color: #f97316;
    background: #fff7ed;
  }
}

.nav-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
}

.nav-cart-btn {
  padding: 6px 16px;
  background: linear-gradient(135deg, #ff9a3c, #f97316);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);

  &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
}

// ── 标题区 ──────────────────────────────────────────────
.page-header {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fef3c7 100%);
  position: relative;
  overflow: hidden;
}

.hero-decor {
  position: absolute;
  inset: 0;
  pointer-events: none;

  span {
    position: absolute;
    border-radius: 50%;
    opacity: 0.12;
    background: #f97316;

    &:nth-child(1) { width: 120px; height: 120px; top: -30px; right: 10%; }
    &:nth-child(2) { width: 80px; height: 80px; bottom: -20px; left: 5%; }
    &:nth-child(3) { width: 50px; height: 50px; top: 20%; right: 30%; }
  }
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px 32px;
  position: relative;
  z-index: 1;

  h1 {
    font-size: 28px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0 0 8px;
  }

  p {
    font-size: 15px;
    color: #92400e;
    margin: 0;
    opacity: 0.7;
    strong { color: #f97316; font-weight: 700; opacity: 1; }
  }
}

.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 60px;
}

.filter-bar {
  background: rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  padding: 20px 24px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 24px;
}

.filter-label {
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
}

.filter-tabs { display: flex; gap: 8px; flex-wrap: wrap; }

.filter-tab {
  padding: 6px 16px;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  background: white;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &:hover { border-color: #f97316; color: #f97316; }
  &.active {
    background: linear-gradient(135deg, #ff9a3c, #f97316);
    border-color: transparent;
    color: white;
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35);
  }
}

.result-info {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 20px;
  strong { color: #f97316; }
}

// ── 骨架屏 ──────────────────────────────────────────
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px)  { grid-template-columns: 1fr; }
}

.skeleton-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.skeleton-img {
  height: 160px;
  background: #f3f4f6;
}

.skeleton-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 14px;
  border-radius: 7px;
  background: #f3f4f6;

  &.w-40 { width: 40%; }
  &.w-50 { width: 50%; }
  &.w-70 { width: 70%; }
  &.w-90 { width: 90%; }
}

.shimmer {
  position: relative;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.6) 50%,
      transparent 100%
    );
    animation: shimmer-sweep 1.5s ease-in-out infinite;
  }
}

@keyframes shimmer-sweep {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

// ── 错误状态 ──────────────────────────────────────────
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  text-align: center;

  p { font-size: 16px; color: #9ca3af; margin: 12px 0; }
  .empty-icon-svg { margin-bottom: 16px; animation: float-gentle 3s ease-in-out infinite; }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 640px)  { grid-template-columns: 1fr; }
}

.empty-state {
  text-align: center;
  padding: 80px 20px;

  .empty-icon-svg {
    margin-bottom: 16px;
    opacity: 0.6;
    animation: float-gentle 3s ease-in-out infinite;
  }

  .empty-text { font-size: 17px; color: #6b7280; margin: 0 0 6px; font-weight: 600; }
  .empty-sub  { font-size: 14px; color: #9ca3af; margin: 0 0 20px; }
}

@keyframes float-gentle {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

.reset-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #ff9a3c, #f97316);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 12px;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);

  &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 40px;

  .page-btn {
    padding: 10px 20px;
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
    &:hover:not(:disabled) { border-color: #f97316; color: #f97316; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }

  .page-numbers { display: flex; gap: 6px; }

  .page-num {
    min-width: 40px;
    height: 40px;
    padding: 0 8px;
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s;
    &:hover  { border-color: #f97316; color: #f97316; }
    &.active { background: linear-gradient(135deg, #ff9a3c, #f97316); border-color: transparent; color: white; box-shadow: 0 2px 8px rgba(249,115,22,0.4); }
  }
}

// ── 交错入场动画 ──────────────────────────────────────
.card-stagger-enter-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
  transition-delay: calc(var(--stagger-index, 0) * 0.07s);
}

.card-stagger-enter-from {
  opacity: 0;
  transform: translateY(24px);
}
</style>
