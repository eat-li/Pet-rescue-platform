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
  { key: 'users',     label: '注册用户', icon: User,        color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe' },
  { key: 'articles',  label: '社区帖子', icon: Document,    color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  { key: 'services',  label: '服务项目', icon: Setting,     color: '#8470FF', bg: '#f5f3ff', border: '#ddd6fe' },
  { key: 'bookings',  label: '服务预约', icon: Calendar,    color: '#f59e0b', bg: '#fffbeb', border: '#fde68a' },
  { key: 'adoptions', label: '领养信息', icon: StarFilled,  color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
  { key: 'notices',   label: '系统公告', icon: Bell,        color: '#06b6d4', bg: '#ecfeff', border: '#a5f3fc' },
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
        { value: bookingDetail.value.pending,   name: '待确认', itemStyle: { color: '#f59e0b' } },
        { value: bookingDetail.value.confirmed,  name: '已确认', itemStyle: { color: '#3b82f6' } },
        { value: bookingDetail.value.completed,  name: '已完成', itemStyle: { color: '#10b981' } },
        { value: bookingDetail.value.cancelled,  name: '已取消', itemStyle: { color: '#ef4444' } },
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
        { value: adoptionDetail.value.pending,  itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{offset:0,color:'#fbbf24'},{offset:1,color:'#f59e0b'}]), borderRadius: [6,6,0,0] } },
        { value: adoptionDetail.value.approved, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{offset:0,color:'#34d399'},{offset:1,color:'#10b981'}]), borderRadius: [6,6,0,0] } },
        { value: adoptionDetail.value.rejected, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1, [{offset:0,color:'#f87171'},{offset:1,color:'#ef4444'}]), borderRadius: [6,6,0,0] } },
      ],
      label: { show: true, position: 'top', color: '#6b7280', fontSize: 13, fontWeight: '600' }
    }]
  })
}

const initOverviewChart = () => {
  if (!overviewChartEl.value) return
  if (overviewChart) overviewChart.dispose()
  overviewChart = echarts.init(overviewChartEl.value)
  const colors = ['#3b82f6', '#10b981', '#8470FF', '#f59e0b', '#ef4444', '#06b6d4']
  overviewChart.setOption({
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    grid: { left: '3%', right: '3%', bottom: '10%', top: '14%', containLabel: true },
    xAxis: {
      type: 'category',
      data: ['注册用户', '社区帖子', '服务项目', '服务预约', '领养信息', '系统公告'],
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 13 }
    },
    yAxis: {
      type: 'value', minInterval: 1,
      axisLine: { show: false },
      axisLabel: { color: '#6b7280' },
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' } }
    },
    series: [{
      type: 'bar', barMaxWidth: 64,
      data: [
        { value: stats.value.users,     itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#60a5fa'},{offset:1,color:'#3b82f6'}]), borderRadius:[6,6,0,0] } },
        { value: stats.value.articles,  itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#34d399'},{offset:1,color:'#10b981'}]), borderRadius:[6,6,0,0] } },
        { value: stats.value.services,  itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#a78bfa'},{offset:1,color:'#8470FF'}]), borderRadius:[6,6,0,0] } },
        { value: stats.value.bookings,  itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#fbbf24'},{offset:1,color:'#f59e0b'}]), borderRadius:[6,6,0,0] } },
        { value: stats.value.adoptions, itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#f87171'},{offset:1,color:'#ef4444'}]), borderRadius:[6,6,0,0] } },
        { value: stats.value.notices,   itemStyle: { color: new echarts.graphic.LinearGradient(0,0,0,1,[{offset:0,color:'#22d3ee'},{offset:1,color:'#06b6d4'}]), borderRadius:[6,6,0,0] } },
      ],
      label: { show: true, position: 'top', fontSize: 13, fontWeight: '600',
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 14px;
  padding: 22px 28px;
  color: #fff;
  box-shadow: 0 4px 20px rgba(102, 126, 234, 0.35);
}

.welcome-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.welcome-avatar {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: rgba(255,255,255,0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.welcome-title {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
  .admin-name { color: #fde68a; }
}

.welcome-sub {
  font-size: 13px;
  opacity: 0.85;
  margin-top: 4px;
}

.welcome-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.time-display {
  font-size: 13px;
  opacity: 0.9;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.refresh-btn {
  border-color: rgba(255,255,255,0.5) !important;
  background: rgba(255,255,255,0.15) !important;
  color: #fff !important;
  &:hover { background: rgba(255,255,255,0.28) !important; }
}

/* ===== 统计卡片 ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 16px;
}

.stat-card {
  background: var(--card-bg);
  border: 1px solid var(--card-border);
  border-radius: 12px;
  padding: 18px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: default;

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.09);
  }
}

.card-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  background: var(--card-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #fff;
  box-shadow: 0 4px 12px color-mix(in srgb, var(--card-color) 40%, transparent);
}

.card-body {
  flex: 1;
  min-width: 0;
}

.card-num {
  font-size: 28px;
  font-weight: 800;
  color: var(--card-color);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}

.card-label {
  font-size: 12px;
  color: #9ca3af;
  margin-top: 3px;
  white-space: nowrap;
}

/* ===== 图表卡片 ===== */
.charts-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  background: #fff;
  border-radius: 14px;
  padding: 20px 24px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.06);
  border: 1px solid #f0f0f0;
}

.overview-card {
  width: 100%;
}

.chart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.chart-sub {
  font-size: 12px;
  color: #9ca3af;
}

.chart-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.badge {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 20px;
  background: color-mix(in srgb, var(--bc) 12%, transparent);
  color: var(--bc);
  border: 1px solid color-mix(in srgb, var(--bc) 30%, transparent);
  font-weight: 500;
  white-space: nowrap;
}

.chart-area {
  width: 100%;
  height: 280px;
}

.overview-chart-area {
  height: 260px;
}

/* ===== 深色表格兼容 ===== */
:deep(.el-loading-mask) {
  border-radius: 14px;
}
</style>
