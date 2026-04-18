<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdoptionCard from './Posts/AdoptionCard.vue'
import { getAdoptionListAPI } from '@/api/adoption'

const router = useRouter()

// ── 数据状态 ──────────────────────────────────────────────
const adoptionList = ref([])
const loading = ref(false)
const error = ref(null)

// ── 分页状态 ──────────────────────────────────────────────
const pagination = ref({
  currentPage: 1,
  pageSize: 6,
  totalItems: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false
})

// ── 筛选状态 ──────────────────────────────────────────────
// 后端 status: pending(待领养) / approved(已领养) / rejected(已取消)
const typeFilters = ['全部', '猫', '狗', '其他']
const statusFilters = [
  { label: '全部',   value: '' },
  { label: '待领养', value: 'pending' },
  { label: '已领养', value: 'approved' },
  { label: '已取消', value: 'rejected' }
]

const activeType = ref('全部')
const activeStatus = ref('')

// 筛选变化时重置页码并重新拉取
watch([activeType, activeStatus], () => {
  pagination.value.currentPage = 1
  fetchList(1)
})

// ── 获取列表 ──────────────────────────────────────────────
const fetchList = async (page = 1) => {
  try {
    loading.value = true
    error.value = null

    const params = {
      page,
      limit: pagination.value.pageSize
    }

    // 类型筛选（传给后端的是宠物类型，对应 pet.type）
    if (activeType.value !== '全部') {
      params.type = activeType.value
    }

    // 状态筛选
    if (activeStatus.value) {
      params.status = activeStatus.value
    }

    const result = await getAdoptionListAPI(params)

    if (result && result.adoptions) {
      adoptionList.value = result.adoptions
      if (result.pagination) {
        pagination.value = { ...pagination.value, ...result.pagination }
      }
    } else {
      adoptionList.value = []
    }
  } catch (err) {
    console.error('获取领养列表失败:', err)
    error.value = err.message || '加载失败，请稍后重试'
    adoptionList.value = []
  } finally {
    loading.value = false
  }
}

const changePage = (page) => {
  if (page < 1 || page > pagination.value.totalPages) return
  if (page === pagination.value.currentPage) return
  fetchList(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetFilter = () => {
  activeType.value = '全部'
  activeStatus.value = ''
}

onMounted(() => fetchList(1))

const statusClass = (val) => {
  const map = { '': '', pending: 'status-tab-pending', approved: 'status-tab-approved', rejected: 'status-tab-rejected' }
  return map[val] || ''
}
</script>

<template>
  <div class="adopt-page">
    <!-- 顶部导航 -->
    <nav class="top-nav">
      <div class="nav-inner">
        <button class="back-btn" @click="router.push('/')">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          返回首页
        </button>
        <span class="nav-title">宠物领养</span>
        <button class="nav-publish-btn" @click="$router.push('/adopt/create')">
          发布信息
        </button>
      </div>
    </nav>

    <!-- 标题区 -->
    <div class="page-header">
      <div class="header-inner">
        <h1>领养代替购买，给它们一个家</h1>
        <p>目前共有 <strong>{{ pagination.totalItems }}</strong> 条领养信息</p>
      </div>
    </div>

    <div class="main-content">
      <!-- 筛选栏 -->
      <div class="filter-bar">
        <div class="filter-group">
          <span class="filter-label">宠物类型</span>
          <div class="filter-tabs">
            <button
              v-for="type in typeFilters"
              :key="type"
              :class="['filter-tab', { active: activeType === type }]"
              @click="activeType = type"
            >{{ type }}</button>
          </div>
        </div>
        <div class="filter-group">
          <span class="filter-label">领养状态</span>
          <div class="filter-tabs">
            <button
              v-for="s in statusFilters"
              :key="s.value"
              :class="['filter-tab', statusClass(s.value), { active: activeStatus === s.value }]"
              @click="activeStatus = s.value"
            >{{ s.label }}</button>
          </div>
        </div>
      </div>

      <!-- 结果提示 -->
      <div class="result-info">
        共找到 <strong>{{ pagination.totalItems }}</strong> 条领养信息
        <span v-if="pagination.totalPages > 1">，第 {{ pagination.currentPage }} / {{ pagination.totalPages }} 页</span>
      </div>

      <!-- 加载状态 -->
      <div v-if="loading" class="loading-state">
        <div class="loading-paw">🐾</div>
        <p>正在加载中...</p>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <div class="error-icon">😿</div>
        <p>{{ error }}</p>
        <button class="reset-btn" @click="fetchList(1)">重新加载</button>
      </div>

      <!-- 卡片网格 -->
      <div v-else-if="adoptionList.length > 0" class="cards-grid">
        <AdoptionCard
          v-for="item in adoptionList"
          :key="item.id"
          :adoption="item"
        />
      </div>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <div class="empty-icon">🐾</div>
        <p class="empty-text">暂无符合条件的领养信息</p>
        <button class="reset-btn" @click="resetFilter">重置筛选</button>
      </div>

      <!-- 分页 -->
      <div v-if="!loading && pagination.totalPages > 1" class="pagination">
        <button class="page-btn" :disabled="!pagination.hasPreviousPage" @click="changePage(pagination.currentPage - 1)">
          ‹ 上一页
        </button>
        <div class="page-numbers">
          <button
            v-for="page in pagination.totalPages"
            :key="page"
            :class="['page-num', { active: page === pagination.currentPage }]"
            @click="changePage(page)"
          >{{ page }}</button>
        </div>
        <button class="page-btn" :disabled="!pagination.hasNextPage" @click="changePage(pagination.currentPage + 1)">
          下一页 ›
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.adopt-page {
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

.nav-publish-btn {
  padding: 6px 16px;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;

  &:hover { background: #ea6c0a; }
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
    strong { color: #f97316; font-weight: 600; }
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
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;

  .filter-label { font-size: 14px; font-weight: 600; color: #6b7280; white-space: nowrap; min-width: 60px; }
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

  &:hover { border-color: #f97316; color: #f97316; }
  &.active { background: #f97316; border-color: #f97316; color: white; }

  &.status-tab-pending.active  { background: #16a34a; border-color: #16a34a; }
  &.status-tab-approved.active { background: #6b7280; border-color: #6b7280; }
  &.status-tab-rejected.active { background: #ef4444; border-color: #ef4444; }
}

.result-info {
  font-size: 14px;
  color: #9ca3af;
  margin-bottom: 20px;
  strong { color: #f97316; }
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 20px;
  text-align: center;

  p { font-size: 16px; color: #9ca3af; margin: 12px 0; }

  .loading-paw, .error-icon { font-size: 52px; animation: bounce 1.2s ease-in-out infinite; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
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

  .empty-icon { font-size: 56px; margin-bottom: 16px; }
  .empty-text { font-size: 16px; color: #9ca3af; margin: 0 0 20px; }
}

.reset-btn {
  padding: 10px 24px;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  margin-top: 12px;

  &:hover { background: #ea6c0a; }
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

    &:hover { border-color: #f97316; color: #f97316; }
    &.active { background: #f97316; border-color: #f97316; color: white; box-shadow: 0 2px 8px rgba(249,115,22,0.4); }
  }
}
</style>
