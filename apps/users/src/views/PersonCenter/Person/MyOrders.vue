<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUserBookingsAPI, cancelBookingAPI } from '@/api/service'
import Toast from '@/components/Common/Toast.vue'
import { useToast } from '@/hooks/Common/useToast.js'
import { markRaw } from 'vue'
import { ClipboardIcon, ClockIcon, CheckIcon, SparkleIcon, CloseIcon, CalendarIcon, PawIcon } from '@/components/Icons'

const { showToast, toastMessage, toastType, duration, showSuccess, showError, showWarning, hideToast } = useToast()

// ── 数据 ─────────────────────────────────────────────────
const bookings = ref([])
const loading = ref(false)
const activeTab = ref('all')

// 状态映射
const statusMap = {
  pending: { label: '待确认', color: '#f59e0b', bg: '#fffbeb', icon: markRaw(ClockIcon) },
  confirmed: { label: '已确认', color: '#10b981', bg: '#ecfdf5', icon: markRaw(CheckIcon) },
  completed: { label: '已完成', color: '#f97316', bg: '#fff7ed', icon: markRaw(SparkleIcon) },
  cancelled: { label: '已取消', color: '#9ca3af', bg: '#f3f4f6', icon: markRaw(CloseIcon) }
}

const getStatusInfo = (status) =>
  statusMap[status] || { label: status, color: '#6b7280', bg: '#f9fafb', icon: markRaw(ClipboardIcon) }

// 服务类型映射
const serviceTypeMap = {
  basic_care:         '基础护理',
  beauty_styling:     '美容造型',
  health_medical:     '健康医疗',
  training_service:   '训练服务',
  special_experience: '特色体验'
}

const getTypeLabel = (type) => serviceTypeMap[type] || type

// 过滤后的订单
const filteredBookings = computed(() => {
  if (activeTab.value === 'all') return bookings.value
  return bookings.value.filter(b => b.status === activeTab.value)
})

// 统计数量
const countByStatus = computed(() => ({
  all: bookings.value.length,
  pending: bookings.value.filter(b => b.status === 'pending').length,
  confirmed: bookings.value.filter(b => b.status === 'confirmed').length,
  completed: bookings.value.filter(b => b.status === 'completed').length,
  cancelled: bookings.value.filter(b => b.status === 'cancelled').length
}))

// ── 拉取订单 ────────────────────────────────────────────
const fetchBookings = async () => {
  try {
    loading.value = true
    const res = await getUserBookingsAPI()
    bookings.value = res?.data?.data || []
  } catch (err) {
    console.error('获取订单失败:', err)
    showError('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// ── 取消预约 ────────────────────────────────────────────
const cancellingId = ref(null)
const showCancelModal = ref(false)
const cancelTarget = ref(null)
const cancelReason = ref('')

const openCancelModal = (booking) => {
  if (booking.status !== 'pending') {
    showWarning('只有待确认的订单可以取消')
    return
  }
  cancelTarget.value = booking
  cancelReason.value = ''
  showCancelModal.value = true
}

const closeCancelModal = () => {
  showCancelModal.value = false
  cancelTarget.value = null
  cancelReason.value = ''
}

const confirmCancel = async () => {
  if (!cancelTarget.value) return
  try {
    cancellingId.value = cancelTarget.value.id
    await cancelBookingAPI(cancelTarget.value.id, {
      cancelReason: cancelReason.value || '用户取消'
    })
    showSuccess('订单已取消')
    closeCancelModal()
    await fetchBookings()
  } catch (err) {
    showError(err.response?.data?.message || '取消失败，请重试')
  } finally {
    cancellingId.value = null
  }
}

// ── 格式化日期 ──────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${formatDate(dateStr)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(fetchBookings)
</script>

<template>
  <div class="orders-page">
    <!-- Toast -->
    <Toast
      :show-toast="showToast"
      :toast-message="toastMessage"
      :toast-type="toastType"
      :duration="duration"
      @hide-toast="hideToast"
    />
    <!-- 标题栏 -->
    <div class="orders-header">
      <h2 class="orders-title"><ClipboardIcon :size="20" class="title-icon" /> 我的订单</h2>
      <span class="orders-count" v-if="bookings.length > 0">
        共 {{ bookings.length }} 笔预约
      </span>
    </div>

    <!-- 状态标签页 -->
    <div class="tabs-bar">
      <button
        v-for="tab in [
          { key: 'all', label: '全部' },
          { key: 'pending', label: '待确认' },
          { key: 'confirmed', label: '已确认' },
          { key: 'completed', label: '已完成' },
          { key: 'cancelled', label: '已取消' }
        ]"
        :key="tab.key"
        :class="['tab-btn', { active: activeTab === tab.key }]"
        @click="activeTab = tab.key"
      >
        {{ tab.label }}
        <span class="tab-badge" v-if="countByStatus[tab.key] > 0">
          {{ countByStatus[tab.key] }}
        </span>
      </button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spin"><ClipboardIcon :size="40" color="#f97316" /></div>
      <p>加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredBookings.length === 0" class="empty-state">
      <div class="empty-icon"><ClipboardIcon :size="52" color="#d1d5db" /></div>
      <p class="empty-title">暂无订单</p>
      <p class="empty-sub">{{ activeTab === 'all' ? '您还没有预约任何服务' : '该状态下没有订单' }}</p>
    </div>

    <!-- 订单列表 -->
    <div v-else class="orders-list">
      <div
        v-for="order in filteredBookings"
        :key="order.id"
        :class="['order-card', { 'order-cancelled': order.status === 'cancelled' }]"
      >
        <!-- 订单头部 -->
        <div class="order-header">
          <div class="order-info">
            <span class="order-id">订单号：{{ order.id }}</span>
            <span class="order-time">{{ formatDateTime(order.createdAt) }}</span>
          </div>
          <span
            class="status-tag"
            :style="{
              color: getStatusInfo(order.status).color,
              background: getStatusInfo(order.status).bg
            }"
          >
            <component :is="getStatusInfo(order.status).icon" :size="13" />
            {{ getStatusInfo(order.status).label }}
          </span>
        </div>

        <!-- 服务信息 -->
        <div class="order-body">
          <div class="service-info">
            <div class="service-image" v-if="order.service?.image">
              <img :src="order.service.image" :alt="order.service.name" />
            </div>
            <div class="service-image placeholder" v-else><PawIcon :size="28" color="#d1d5db" /></div>
            <div class="service-detail">
              <h4 class="service-name">{{ order.service?.name || '未知服务' }}</h4>
              <p class="service-type" v-if="order.service?.type">
                类型：{{ getTypeLabel(order.service.type) }}
              </p>
              <div class="appointment-info">
                <span class="info-item"><CalendarIcon :size="13" /> {{ formatDate(order.appointmentDate) }}</span>
                <span class="info-item"><ClockIcon :size="13" /> {{ order.appointmentTime }}</span>
              </div>
            </div>
          </div>

          <div class="pet-info">
            <div class="info-row">
              <span class="info-label">宠物：</span>
              <span class="info-value">{{ order.petName }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">体重：</span>
              <span class="info-value">{{ order.petWeight }} kg</span>
            </div>
            <div class="info-row">
              <span class="info-label">联系方式：</span>
              <span class="info-value">{{ order.contact }}</span>
            </div>
            <div class="info-row" v-if="order.notes">
              <span class="info-label">备注：</span>
              <span class="info-value notes">{{ order.notes }}</span>
            </div>
          </div>
        </div>

        <!-- 订单底部 -->
        <div class="order-footer">
          <div class="price-section">
            <span class="price-label">实付金额：</span>
            <span class="price-value">
              <span class="price-symbol">¥</span>{{ order.total_price }}
            </span>
          </div>
          <div class="action-section">
            <button
              v-if="order.status === 'pending'"
              class="cancel-btn"
              :disabled="cancellingId === order.id"
              @click="openCancelModal(order)"
            >
              {{ cancellingId === order.id ? '取消中...' : '取消订单' }}
            </button>
            <span v-else-if="order.status === 'cancelled' && order.cancelReason" class="cancel-reason">
              取消原因：{{ order.cancelReason }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 取消订单弹窗 -->
    <Teleport to="body">
      <div v-if="showCancelModal" class="order-modal-mask" @click.self="closeCancelModal">
        <div class="order-modal-box">
          <div class="modal-header">
            <h3 class="modal-title"><CloseIcon :size="18" color="#ef4444" /> 取消订单</h3>
            <button class="modal-close" @click="closeCancelModal">×</button>
          </div>
          <div class="modal-body">
            <p class="modal-tip">确定要取消这笔订单吗？</p>
            <div class="form-group">
              <label>取消原因（选填）</label>
              <textarea
                v-model="cancelReason"
                class="form-textarea"
                rows="3"
                placeholder="请输入取消原因"
              ></textarea>
            </div>
          </div>
          <div class="modal-actions">
            <button class="modal-cancel" @click="closeCancelModal">再想想</button>
            <button
              class="modal-confirm"
              :disabled="cancellingId"
              @click="confirmCancel"
            >
              {{ cancellingId ? '取消中...' : '确认取消' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.orders-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

// ── 标题栏 ────────────────────────────────────────────────
.orders-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1.5px solid #f0f0f0;
}

.orders-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  .title-icon {
    color: #f97316;
  }
}

.orders-count {
  font-size: 13px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 10px;
  border-radius: 20px;
}

// ── 标签页 ────────────────────────────────────────────────
.tabs-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.tab-btn {
  padding: 8px 16px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    border-color: #f97316;
    color: #f97316;
  }

  &.active {
    background: #f97316;
    border-color: transparent;
    color: white;
  }
}

.tab-badge {
  background: rgba(255,255,255,0.2);
  padding: 1px 6px;
  border-radius: 10px;
  font-size: 11px;
}

// ── 加载 / 空状态 ─────────────────────────────────────────
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  .loading-spin { animation: bounce 1.2s ease-in-out infinite; }
  p { font-size: 14px; color: #9ca3af; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 60px 20px;
}

.empty-icon  { display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.empty-title { font-size: 16px; font-weight: 600; color: #374151; margin: 4px 0 0; }
.empty-sub   { font-size: 13px; color: #9ca3af; margin: 0; }

// ── 订单列表 ──────────────────────────────────────────────
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 4px;
}

.order-card {
  background: white;
  border-radius: 16px;
  border: 1.5px solid #f0f0f0;
  overflow: hidden;
  transition: all 0.2s;

  &:hover {
    border-color: #fed7aa;
    box-shadow: 0 4px 16px rgba(249, 115, 22, 0.08);
  }

  &.order-cancelled {
    opacity: 0.7;
  }
}

.order-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.order-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-id {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.order-time {
  font-size: 12px;
  color: #9ca3af;
}

.status-tag {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

// ── 订单主体 ──────────────────────────────────────────────
.order-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.service-info {
  display: flex;
  gap: 12px;
}

.service-image {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &.placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }
}

.service-detail {
  flex: 1;
  min-width: 0;
}

.service-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px;
}

.service-type {
  font-size: 12px;
  color: #ea580c;
  background: #fff7ed;
  display: inline-block;
  padding: 2px 8px;
  border-radius: 20px;
  margin: 0 0 8px;
}

.appointment-info {
  display: flex;
  gap: 12px;
}

.info-item {
  font-size: 12px;
  color: #6b7280;
  background: #f9fafb;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 4px 10px;
  border-radius: 8px;
}

// ── 宠物信息 ──────────────────────────────────────────────
.pet-info {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
  padding: 12px;
  background: #fafafa;
  border-radius: 10px;
}

.info-row {
  display: flex;
  gap: 4px;
  font-size: 13px;
}

.info-label {
  color: #9ca3af;
}

.info-value {
  color: #374151;
  font-weight: 500;

  &.notes {
    grid-column: 1 / -1;
    color: #6b7280;
  }
}

// ── 订单底部 ──────────────────────────────────────────────
.order-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
}

.price-section {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.price-label {
  font-size: 13px;
  color: #6b7280;
}

.price-value {
  font-size: 20px;
  font-weight: 800;
  color: #ef4444;
}

.price-symbol {
  font-size: 14px;
}

.action-section {
  display: flex;
  gap: 8px;
}

.cancel-btn {
  padding: 6px 14px;
  background: white;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #fef2f2;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.cancel-reason {
  font-size: 12px;
  color: #9ca3af;
}

// ── 取消弹窗 ──────────────────────────────────────────────
.order-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  backdrop-filter: blur(4px);
}

.order-modal-box {
  background: white;
  border-radius: 20px;
  padding: 24px;
  width: 380px;
  max-width: 90vw;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.modal-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #e5e7eb;
    color: #374151;
  }
}

.modal-body {
  margin-bottom: 20px;
}

.modal-tip {
  font-size: 14px;
  color: #4b5563;
  margin: 0 0 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }
}

.form-textarea {
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  resize: none;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }
}

.modal-actions {
  display: flex;
  gap: 10px;
}

.modal-cancel {
  flex: 1;
  padding: 10px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #e5e7eb;
  }
}

.modal-confirm {
  flex: 1;
  padding: 10px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #dc2626;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}
</style>
