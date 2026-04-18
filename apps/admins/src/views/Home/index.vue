<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import {
  User, Document, Setting, Calendar, StarFilled, Bell,
  Refresh
} from '@element-plus/icons-vue'
import { getUserListAPI } from '@/api/user'
import { getArticleListAPI } from '@/api/article'
import { getAllAdoptionAPI } from '@/api/adoption'
import { getBookingStatsAPI } from '@/api/booking'
import { getNoticeListAPI } from '@/api/notice'
import { getServiceListAPI } from '@/api/service'
import { useAdminStore } from '@/stores/admin'

const adminStore = useAdminStore()

// ===== 统计数据 =====
const stats = ref({ users: 0, articles: 0, adoptions: 0, bookings: 0, services: 0, notices: 0 })
const bookingDetail = ref({ pending: 0, confirmed: 0, completed: 0, cancelled: 0 })
const adoptionDetail = ref({ pending: 0, approved: 0, rejected: 0 })
const loading = ref(true)
const refreshing = ref(false)

// ===== 时间 =====
const currentTime = ref('')
const greeting = ref('')
let timeInterval = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    weekday: 'short'
  })
  const h = now.getHours()
  if (h < 6) greeting.value = '夜深了'
  else if (h < 12) greeting.value = '上午好'
  else if (h < 14) greeting.value = '中午好'
  else if (h < 18) greeting.value = '下午好'
  else greeting.value = '晚上好'
}

// ===== 卡片配置 =====
const statCards = [
  { key: 'users',     label: '注册用户', icon: User,        color: '#2563eb' },
  { key: 'articles',  label: '社区帖子', icon: Document,    color: '#059669' },
  { key: 'services',  label: '服务项目', icon: Setting,     color: '#7c3aed' },
  { key: 'bookings',  label: '服务预约', icon: Calendar,    color: '#d97706' },
  { key: 'adoptions', label: '领养信息', icon: StarFilled,  color: '#dc2626' },
  { key: 'notices',   label: '系统公告', icon: Bell,        color: '#0891b2' },
]

// ===== ECharts =====
const bookingChartEl  = ref(null)
const adoptionChartEl = ref(null)
const overviewChartEl = ref(null)
let bookingChart  = null
let adoptionChart = null
let overviewChart = null

const initBookingChart = () => {
  if (!bookingChartEl.value) return
  if (bookingChart) bookingChart.dispose()
  bookingChart = echarts.init(bookingChartEl.value)
  const total = bookingDetail.value.pending + bookingDetail.value.confirmed +
                bookingDetail.value.completed + bookingDetail.value.cancelled
  bookingChart.setOption({
    tooltip: { trigger: 'item', formatter: '{b}<br/>{c} 条 ({d}%)' },
    legend: {
      bottom: '2%', left: 'center',
      itemWidth: 10, itemHeight: 10,
      textStyle: { color: '#6b7280', fontSize: 12 }
    },
    graphic: total === 0 ? [{
      type: 'text', left: 'center', top: '42%',
      style: { text: '暂无数据', font: '14px sans-serif', fill: '#9ca3af' }
    }] : [],
    series: [{
      type: 'pie',
      radius: ['48%', '72%'],
      center: ['50%', '44%'],
      avoidLabelOverlap: false,
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 15, fontWeight: 'bold' },
        scaleSize: 8
      },
      data: [
        { value: bookingDetail.value.pending,   name: '待确认', itemStyle: { color: '#d97706' } },
        { value: bookingDetail.value.confirmed,  name: '已确认', itemStyle: { color: '#2563eb' } },
        { value: bookingDetail.value.completed,  name: '已完成', itemStyle: { color: '#059669' } },
        { value: bookingDetail.value.cancelled,  name: '已取消', itemStyle: { color: '#dc2626' } },
      ]
    }]
  })
}

const initAdoptionChart = () => {
  if (!adoptionChartEl.value) return
  if (adoptionChart) adoptionChart.dispose()
  adoptionChart = echarts.init(adoptionChartEl.value)
  adoptionChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '6%', right: '6%', bottom: '12%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['待审核', '已通过', '已拒绝'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280' }
    },
    yAxis: {
      type: 'value', minInterval: 1,
      axisLine: { show: false },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
    },
    series: [{
      type: 'bar', barMaxWidth: 56,
      data: [
        { value: adoptionDetail.value.pending,  itemStyle: { color: '#d97706', borderRadius: [4,4,0,0] } },
        { value: adoptionDetail.value.approved, itemStyle: { color: '#059669', borderRadius: [4,4,0,0] } },
        { value: adoptionDetail.value.rejected, itemStyle: { color: '#dc2626', borderRadius: [4,4,0,0] } },
      ],
      label: { show: true, position: 'top', color: '#6b7280', fontSize: 13, fontWeight: '600' }
    }]
  })
}

const initOverviewChart = () => {
  if (!overviewChartEl.value) return
  if (overviewChart) overviewChart.dispose()
  overviewChart = echarts.init(overviewChartEl.value)
  overviewChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '3%', bottom: '10%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['注册用户', '社区帖子', '服务项目', '服务预约', '领养信息', '系统公告'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 12 }
    },
    yAxis: {
      type: 'value', minInterval: 1,
      axisLine: { show: false },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
    },
    series: [{
      type: 'bar', barMaxWidth: 48,
      itemStyle: { color: '#3b82f6', borderRadius: [4,4,0,0] },
      data: [
        stats.value.users,
        stats.value.articles,
        stats.value.services,
        stats.value.bookings,
        stats.value.adoptions,
        stats.value.notices,
      ],
      label: { show: true, position: 'top', fontSize: 12, fontWeight: '500',
        formatter: (p) => p.value > 0 ? p.value : '' ,
        color: '#374151'
      }
    }]
  })
}

const initCharts = () => {
  initBookingChart()
  initAdoptionChart()
  initOverviewChart()
}

// ===== 数据加载 =====
const fetchAllData = async () => {
  try {
    refreshing.value = true
    const results = await Promise.allSettled([
      getUserListAPI({ page: 1, limit: 1 }),
      getArticleListAPI({ page: 1, limit: 1 }),
      getAllAdoptionAPI({ page: 1, limit: 1 }),
      getBookingStatsAPI(),
      getServiceListAPI({ page: 1, limit: 1 }),
      getNoticeListAPI({ page: 1, limit: 1 }),
      getAllAdoptionAPI({ page: 1, limit: 1, status: 'pending' }),
      getAllAdoptionAPI({ page: 1, limit: 1, status: 'approved' }),
      getAllAdoptionAPI({ page: 1, limit: 1, status: 'rejected' }),
    ])

    const [usersR, articlesR, adoptionsR, bookingR, servicesR, noticesR,
           adoptPendR, adoptApprR, adoptRejR] = results

    if (usersR.status === 'fulfilled' && usersR.value?.code === 200)
      stats.value.users = usersR.value.data.pagination.totalItems

    if (articlesR.status === 'fulfilled' && articlesR.value?.code === 200)
      stats.value.articles = articlesR.value.data.pagination.totalItems

    if (adoptionsR.status === 'fulfilled' && adoptionsR.value?.code === 200)
      stats.value.adoptions = adoptionsR.value.data.pagination.totalItems

    if (bookingR.status === 'fulfilled' && bookingR.value?.code === 200) {
      const bStats = bookingR.value.data.stats
      bookingDetail.value = {
        pending:   bStats.find(s => s.status === 'pending')?.count   || 0,
        confirmed: bStats.find(s => s.status === 'confirmed')?.count || 0,
        completed: bStats.find(s => s.status === 'completed')?.count || 0,
        cancelled: bStats.find(s => s.status === 'cancelled')?.count || 0,
      }
      stats.value.bookings = bookingR.value.data.total
    }

    if (servicesR.status === 'fulfilled' && servicesR.value?.code === 200)
      stats.value.services = servicesR.value.data.pagination.totalItems

    if (noticesR.status === 'fulfilled' && noticesR.value?.code === 200)
      stats.value.notices = noticesR.value.data.pagination.totalItems

    if (adoptPendR.status === 'fulfilled' && adoptPendR.value?.code === 200)
      adoptionDetail.value.pending  = adoptPendR.value.data.pagination.totalItems
    if (adoptApprR.status === 'fulfilled' && adoptApprR.value?.code === 200)
      adoptionDetail.value.approved = adoptApprR.value.data.pagination.totalItems
    if (adoptRejR.status === 'fulfilled' && adoptRejR.value?.code === 200)
      adoptionDetail.value.rejected = adoptRejR.value.data.pagination.totalItems

  } finally {
    loading.value = false
    refreshing.value = false
    await nextTick()
    initCharts()
  }
}

const handleResize = () => {
  bookingChart?.resize()
  adoptionChart?.resize()
  overviewChart?.resize()
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  fetchAllData()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  clearInterval(timeInterval)
  window.removeEventListener('resize', handleResize)
  bookingChart?.dispose()
  adoptionChart?.dispose()
  overviewChart?.dispose()
})
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <!-- 顶部欢迎栏 -->
    <div class="welcome-banner">
      <div class="welcome-left">
        <div class="welcome-avatar">
          <el-icon :size="28"><User /></el-icon>
        </div>
        <div class="welcome-text">
          <div class="welcome-title">
            {{ greeting }}，<span class="admin-name">{{ adminStore.adminInfo?.username || '管理员' }}</span> 👋
          </div>
          <div class="welcome-sub">欢迎回到宠物管理后台，这里是今日系统数据概览</div>
        </div>
      </div>
      <div class="welcome-right">
        <div class="time-display">{{ currentTime }}</div>
        <el-button
          :icon="Refresh"
          :loading="refreshing"
          circle
          plain
          size="small"
          class="refresh-btn"
          @click="fetchAllData"
        />
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-grid">
      <div
        v-for="card in statCards"
        :key="card.key"
        class="stat-card"
        :style="{ '--card-color': card.color, '--card-bg': card.bg, '--card-border': card.border }"
      >
        <div class="card-icon-wrap">
          <el-icon :size="24"><component :is="card.icon" /></el-icon>
        </div>
        <div class="card-body">
          <div class="card-num">
            <span v-if="!loading">{{ stats[card.key].toLocaleString() }}</span>
            <el-skeleton-item v-else variant="text" style="width: 60px; height: 32px;" />
          </div>
          <div class="card-label">{{ card.label }}</div>
        </div>
      </div>
    </div>

    <!-- 图表区：左侧饼图 + 右侧柱状图 -->
    <div class="charts-row">
      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">预约状态分布</span>
          <div class="chart-badges">
            <span class="badge" style="--bc:#f59e0b">待确认 {{ bookingDetail.pending }}</span>
            <span class="badge" style="--bc:#3b82f6">已确认 {{ bookingDetail.confirmed }}</span>
            <span class="badge" style="--bc:#10b981">已完成 {{ bookingDetail.completed }}</span>
            <span class="badge" style="--bc:#ef4444">已取消 {{ bookingDetail.cancelled }}</span>
          </div>
        </div>
        <div ref="bookingChartEl" class="chart-area" />
      </div>

      <div class="chart-card">
        <div class="chart-header">
          <span class="chart-title">领养审核状态</span>
          <div class="chart-badges">
            <span class="badge" style="--bc:#f59e0b">待审核 {{ adoptionDetail.pending }}</span>
            <span class="badge" style="--bc:#10b981">已通过 {{ adoptionDetail.approved }}</span>
            <span class="badge" style="--bc:#ef4444">已拒绝 {{ adoptionDetail.rejected }}</span>
          </div>
        </div>
        <div ref="adoptionChartEl" class="chart-area" />
      </div>
    </div>

    <!-- 全宽概览柱状图 -->
    <div class="chart-card overview-card">
      <div class="chart-header">
        <span class="chart-title">系统数据总览</span>
        <span class="chart-sub">各模块数量一览</span>
      </div>
      <div ref="overviewChartEl" class="chart-area overview-chart-area" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.dashboard {
  padding: 24px;
  min-height: 100%;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ===== 欢迎栏 ===== */
.welcome-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fff;
  border-radius: 8px;
  padding: 20px 24px;
  border: 1px solid #e5e7eb;
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.welcome-avatar {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6b7280;
}

.welcome-title {
  font-size: 16px;
  font-weight: 500;
  line-height: 1.4;
  color: #111827;
  .admin-name { color: #2563eb; }
}

.welcome-sub {
  font-size: 13px;
  color: #6b7280;
  margin-top: 2px;
}

.welcome-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.time-display {
  font-size: 13px;
  color: #6b7280;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.refresh-btn {
  border-color: #d1d5db !important;
  color: #6b7280 !important;
  &:hover { 
    border-color: #9ca3af !important;
    color: #374151 !important;
  }
}

/* ===== 统计卡片 ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.stat-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: border-color 0.2s ease;
  cursor: default;

  &:hover {
    border-color: #d1d5db;
  }
}

.card-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--card-color);
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-num {
  font-size: 22px;
  font-weight: 600;
  color: #111827;
  line-height: 1.2;
  font-variant-numeric: tabular-nums;
}

.card-label {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
  white-space: nowrap;
}

/* ===== 图表卡片 ===== */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.chart-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e7eb;
}

.overview-card {
  width: 100%;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
}

.chart-title {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.chart-sub {
  font-size: 12px;
  color: #6b7280;
}

.chart-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background: #f3f4f6;
  color: #374151;
  font-weight: 400;
  white-space: nowrap;
}

.chart-area {
  width: 100%;
  height: 260px;
}

.overview-chart-area {
  height: 240px;
}

/* ===== 深色表格兼容 ===== */
:deep(.el-loading-mask) {
  border-radius: 8px;
}
</style>
