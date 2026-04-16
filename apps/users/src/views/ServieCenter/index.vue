<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ServiceCard from './Services/ServiceCard.vue'
import { getServiceListAPI } from '@/api/service'
import Toast from '@/components/Common/Toast.vue'
import { useToast } from '@/hooks/Common/useToast.js'

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
  { label: '全部',     value: '',                 icon: '🐾' },
  { label: '基础护理', value: 'basic_care',         icon: '🛁' },
  { label: '美容造型', value: 'beauty_styling',     icon: '✂️' },
  { label: '健康医疗', value: 'health_medical',     icon: '💊' },
  { label: '训练服务', value: 'training_service',   icon: '🎾' },
  { label: '特色体验', value: 'special_experience', icon: '⭐' }
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
    <!-- Hero 横幅 -->
    <div class="hero-banner">
      <div class="hero-content">
        <div class="hero-nav">
          <button class="home-btn" @click="router.push('/')">
            ← 返回首页
          </button>
        </div>
        <div class="hero-badge">宠物服务中心</div>
        <h1 class="hero-title">🐾 专业护理 · 贴心服务</h1>
        <p class="hero-desc">为您的毛孩子提供全方位专业宠物服务，每一次服务都是一次爱的呵护</p>
        <div v-if="!loading" class="hero-stats">
          <div class="stat-item">
            <span class="stat-num">{{ pagination.totalItems }}</span>
            <span class="stat-label">项服务</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 工具栏：类型筛选 + 购物车入口 -->
      <div class="toolbar">
        <div class="filter-bar">
          <span class="filter-label">服务类型</span>
          <div class="filter-tabs">
            <button
              v-for="opt in typeOptions"
              :key="opt.value"
              :class="['filter-tab', { active: activeType === opt.value }]"
              @click="activeType = opt.value"
            >
              {{ opt.icon }} {{ opt.label }}
            </button>
          </div>
        </div>
        <button class="cart-entry" @click="router.push('/profile/cart')">
          🛒 购物车
        </button>
      </div>

      <!-- 结果提示 -->
      <div class="result-info">
        共 <strong>{{ pagination.totalItems }}</strong> 项服务
        <span v-if="pagination.totalPages > 1">，第 {{ pagination.currentPage }} / {{ pagination.totalPages }} 页</span>
      </div>

      <!-- 加载中 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-icon">🐾</div>
        <p>正在加载中...</p>
      </div>

      <!-- 错误 -->
      <div v-else-if="error" class="error-state">
        <div>😿</div>
        <p>{{ error }}</p>
        <button class="reset-btn" @click="fetchList(1)">重新加载</button>
      </div>

      <!-- 卡片列表 -->
      <div v-else-if="serviceList.length > 0" class="cards-grid">
        <ServiceCard
          v-for="item in serviceList"
          :key="item.id"
          :service="item"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🔍</div>
        <p>暂无该类型的服务</p>
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

.hero-banner {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%);
  padding: 40px 20px;
  color: white;
}

.hero-content {
  max-width: 1100px;
  margin: 0 auto;
  text-align: center;
  position: relative;
}

.hero-nav {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.home-btn {
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.85);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(4px);
  &:hover {
    background: rgba(255, 255, 255, 0.25);
    color: white;
    border-color: rgba(255, 255, 255, 0.5);
  }
}

.hero-badge {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.hero-title {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 8px;
  line-height: 1.3;
}

.hero-desc {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 20px;
  line-height: 1.6;
}

.hero-stats {
  display: flex;
  justify-content: center;
  gap: 32px;
  .stat-item { display: flex; flex-direction: column; gap: 2px; }
  .stat-num  { font-size: 24px; font-weight: 800; }
  .stat-label { font-size: 12px; opacity: 0.85; }
}

.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 60px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.cart-entry {
  flex-shrink: 0;
  padding: 12px 20px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  &:hover {
    transform: scale(1.02);
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
  }
}

.filter-bar {
  background: white;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  flex: 1;
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

  &:hover { border-color: #8b5cf6; color: #8b5cf6; }
  &.active { background: #8b5cf6; border-color: #8b5cf6; color: white; }
}

.result-info {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 20px;
  strong { color: #8b5cf6; }
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  font-size: 48px;
  p { font-size: 16px; color: #9ca3af; margin: 12px 0; }
  .loading-icon { animation: bounce 1.2s ease-in-out infinite; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-10px); }
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
  .empty-icon { font-size: 52px; margin-bottom: 16px; }
  p { font-size: 16px; color: #9ca3af; margin: 0 0 20px; }
}

.reset-btn {
  padding: 10px 24px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  &:hover { background: #7c3aed; }
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
    cursor: pointer;
    transition: all 0.2s;
    &:hover:not(:disabled) { border-color: #8b5cf6; color: #8b5cf6; }
    &:disabled { opacity: 0.4; cursor: not-allowed; }
  }

  .page-numbers { display: flex; gap: 6px; }

  .page-num {
    min-width: 40px;
    height: 40px;
    background: white;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
    &:hover  { border-color: #8b5cf6; color: #8b5cf6; }
    &.active { background: #8b5cf6; border-color: #8b5cf6; color: white; }
  }
}
</style>
