<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdoptionCard from './Posts/AdoptionCard.vue'
import { getAdoptionListAPI } from '@/api/adoption'
import { PawIcon } from '@/components/Icons'

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
      <div class="hero-decor">
        <span></span>
        <span></span>
        <span></span>
      </div>
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

      <!-- 加载状态：骨架屏 -->
      <div v-if="loading" class="skeleton-grid">
        <div v-for="n in 6" :key="n" class="skeleton-card">
          <div class="skeleton-img shimmer"></div>
          <div class="skeleton-body">
            <div class="skeleton-line w-60 shimmer"></div>
            <div class="skeleton-line w-40 shimmer"></div>
            <div class="skeleton-line w-80 shimmer"></div>
            <div class="skeleton-line w-50 shimmer"></div>
          </div>
        </div>
      </div>

      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <PawIcon :size="56" color="#ef4444" class="empty-icon-svg" />
        <p>{{ error }}</p>
        <button class="reset-btn" @click="fetchList(1)">重新加载</button>
      </div>

      <!-- 卡片网格 -->
      <TransitionGroup v-else-if="adoptionList.length > 0" name="card-stagger" tag="div" class="cards-grid">
        <AdoptionCard
          v-for="(item, index) in adoptionList"
          :key="item.id"
          :adoption="item"
          :style="{ '--stagger-index': index }"
        />
      </TransitionGroup>

      <!-- 空状态 -->
      <div v-else class="empty-state">
        <PawIcon :size="56" color="#f97316" class="empty-icon-svg" />
        <p class="empty-text">暂无符合条件的领养信息</p>
        <p class="empty-sub">试试调整筛选条件，或浏览全部领养信息</p>
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
  &.active {
    background: linear-gradient(135deg, #ff9a3c, #f97316);
    border-color: transparent;
    color: white;
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35);
  }

  &.status-tab-pending.active  { background: linear-gradient(135deg, #22c55e, #16a34a); border-color: transparent; box-shadow: 0 2px 8px rgba(22, 163, 74, 0.35); }
  &.status-tab-approved.active { background: linear-gradient(135deg, #9ca3af, #6b7280); border-color: transparent; box-shadow: 0 2px 8px rgba(107, 114, 128, 0.35); }
  &.status-tab-rejected.active { background: linear-gradient(135deg, #f87171, #ef4444); border-color: transparent; box-shadow: 0 2px 8px rgba(239, 68, 68, 0.35); }
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
  height: 200px;
  background: #f3f4f6;
}

.skeleton-body {
  padding: 16px;
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
  &.w-60 { width: 60%; }
  &.w-80 { width: 80%; }
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

    &:hover { border-color: #f97316; color: #f97316; }
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
