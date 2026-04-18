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
    <!-- 顶部导航 -->
    <nav class="top-nav">
      <div class="nav-inner">
        <button class="back-btn" @click="router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          返回首页
        </button>
        <span class="nav-title">宠物服务</span>
        <button class="nav-cart-btn" @click="router.push('/profile/cart')">
          购物车
        </button>
      </div>
    </nav>

    <!-- 标题区 -->
    <div class="page-header">
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
            {{ opt.icon }} {{ opt.label }}
          </button>
        </div>
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
    color: #8b5cf6;
    background: #f5f3ff;
  }
}

.nav-title {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
}

.nav-cart-btn {
  padding: 6px 16px;
  background: #8b5cf6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { background: #7c3aed; }
}

// ── 标题区 ──────────────────────────────────────────────
.page-header {
  background: white;
  border-bottom: 1px solid #f0f0f0;
}

.header-inner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px 20px 24px;

  h1 {
    font-size: 22px;
    font-weight: 800;
    color: #1a1a2e;
    margin: 0 0 6px;
  }

  p {
    font-size: 14px;
    color: #9ca3af;
    margin: 0;
    strong { color: #8b5cf6; font-weight: 600; }
  }
}

.main-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 32px 20px 60px;
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
