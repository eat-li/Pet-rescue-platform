<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getCartListAPI,
  updateCartItemAPI,
  deleteCartItemAPI,
  batchDeleteCartAPI,
  batchCreateBookingAPI
} from '@/api/service'
import { markRaw } from 'vue'
import { CartIcon, BathIcon, ScissorsIcon, PillIcon, BallIcon, StarIcon, PawIcon, TrashIcon, CalendarIcon } from '@/components/Icons'

const router = useRouter()

// ── 数据 ─────────────────────────────────────────────────
const cartItems = ref([])
const loading = ref(false)
const selectedTotal = ref('0.00')

// 服务类型映射
const typeMap = {
  basic_care:         { label: '基础护理', icon: markRaw(BathIcon), color: '#ea580c', bg: '#fff7ed' },
  beauty_styling:     { label: '美容造型', icon: markRaw(ScissorsIcon), color: '#d97706', bg: '#fffbeb' },
  health_medical:     { label: '健康医疗', icon: markRaw(PillIcon), color: '#ef4444', bg: '#fef2f2' },
  training_service:   { label: '训练服务', icon: markRaw(BallIcon), color: '#f59e0b', bg: '#fffbeb' },
  special_experience: { label: '特色体验', icon: markRaw(StarIcon), color: '#10b981', bg: '#ecfdf5' }
}

const getTypeInfo = (type) =>
  typeMap[type] || { label: type, icon: markRaw(PawIcon), color: '#6b7280', bg: '#f9fafb' }

// 商品是否上架（兑容 boolean true / 数字 1 / 字符串 "true"/"1"）
const isActive = (service) => {
  if (!service) return false
  const s = service.status
  return s === true || s === 1 || s === '1' || s === 'true'
}

// 已选中条目
const selectedItems = computed(() => cartItems.value.filter(i => i.selected && isActive(i.service)))
const selectedCount = computed(() => selectedItems.value.length)

// ── 拉取购物车 ────────────────────────────────────────────
const fetchCart = async () => {
  try {
    loading.value = true
    const res = await getCartListAPI()
    const items = res?.data?.data || []
    // 保留已有的选中状态，新条目默认全选
    cartItems.value = items.map(i => ({
      ...i,
      selected: i.selected !== undefined ? i.selected : true
    }))
    recalcTotal()
  } catch (err) {
    console.error('获取购物车失败:', err)
  } finally {
    loading.value = false
  }
}

// ── 切换选中 ──────────────────────────────────────────────
const toggleSelect = async (item) => {
  const prev = item.selected
  item.selected = !item.selected
  try {
    await updateCartItemAPI(item.id, { selected: item.selected })
    recalcTotal()
  } catch {
    item.selected = prev
  }
}

// 全选 / 取消全选
const allSelected = computed(() =>
  cartItems.value.length > 0 && cartItems.value.every(i => i.selected)
)
const toggleAll = async () => {
  const newVal = !allSelected.value
  const prev = cartItems.value.map(i => i.selected)
  cartItems.value.forEach(i => { i.selected = newVal })
  try {
    await Promise.all(cartItems.value.map(i => updateCartItemAPI(i.id, { selected: newVal })))
    recalcTotal()
  } catch {
    cartItems.value.forEach((i, idx) => { i.selected = prev[idx] })
  }
}

// 重新计算本地总价
const recalcTotal = () => {
  const total = cartItems.value
    .filter(i => i.selected && isActive(i.service))
    .reduce((sum, i) => sum + parseFloat(i.service?.price || 0), 0)
  selectedTotal.value = total.toFixed(2)
}

// ── 删除单条 ──────────────────────────────────────────────
const removing = ref(null)
const handleRemove = async (item) => {
  if (removing.value === item.id) return
  removing.value = item.id
  try {
    await deleteCartItemAPI(item.id)
    cartItems.value = cartItems.value.filter(i => i.id !== item.id)
    recalcTotal()
  } catch {
    alert('删除失败，请重试')
  } finally {
    removing.value = null
  }
}

// ── 清空购物车 ────────────────────────────────────────────
const showClearConfirm = ref(false)
const clearing = ref(false)
const handleClear = async () => {
  try {
    clearing.value = true
    const allIds = cartItems.value.map(i => i.id)
    await batchDeleteCartAPI(allIds)
    cartItems.value = []
    selectedTotal.value = '0.00'
    showClearConfirm.value = false
  } catch {
    alert('清空失败，请重试')
  } finally {
    clearing.value = false
  }
}

// ── 批量预约弹窗 ──────────────────────────────────────────
const showBookingModal = ref(false)
const bookingLoading = ref(false)
const bookingForm = ref({
  appointmentDate: '',
  appointmentTime: '',
  petName: '',
  petWeight: '',
  contact: '',
  notes: ''
})

// 打开预约弹窗
const openBookingModal = () => {
  if (selectedCount.value === 0) return
  // 默认预约日期为明天
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  bookingForm.value.appointmentDate = tomorrow.toISOString().split('T')[0]
  bookingForm.value.appointmentTime = '10:00'
  showBookingModal.value = true
}

// 关闭预约弹窗
const closeBookingModal = () => {
  if (bookingLoading.value) return
  showBookingModal.value = false
  bookingForm.value = {
    appointmentDate: '',
    appointmentTime: '',
    petName: '',
    petWeight: '',
    contact: '',
    notes: ''
  }
}

// 提交批量预约
const submitBooking = async () => {
  const { appointmentDate, appointmentTime, petName, petWeight, contact } = bookingForm.value
  if (!appointmentDate || !appointmentTime || !petName || !petWeight || !contact) {
    alert('请填写完整的预约信息')
    return
  }

  const serviceIds = selectedItems.value.map(i => i.serviceId)
  if (serviceIds.length === 0) {
    alert('请选择要预约的服务')
    return
  }

  try {
    bookingLoading.value = true
    await batchCreateBookingAPI({
      serviceIds,
      appointmentDate,
      appointmentTime,
      petName,
      petWeight: parseFloat(petWeight),
      contact,
      notes: bookingForm.value.notes
    })
    alert(`成功预约 ${serviceIds.length} 项服务！`)
    showBookingModal.value = false
    // 刷新购物车（已预约的会被删除）
    await fetchCart()
  } catch (err) {
    alert(err.response?.data?.message || '预约失败，请重试')
  } finally {
    bookingLoading.value = false
  }
}

// ── 去预约 ────────────────────────────────────────────────
const handleBookItem = (item) => {
  router.push(`/service/${item.serviceId}`)
}

onMounted(fetchCart)
</script>

<template>
  <div class="cart-page">
    <!-- 标题栏 -->
    <div class="cart-header">
      <div class="header-left">
        <h2 class="cart-title"><CartIcon :size="20" class="title-icon" /> 我的购物车</h2>
        <span class="cart-count" v-if="cartItems.length > 0">
          共 {{ cartItems.length }} 项服务
        </span>
      </div>
      <button
        v-if="cartItems.length > 0"
        class="clear-btn"
        @click="showClearConfirm = true"
      >
        清空购物车
      </button>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spin"><PawIcon :size="40" color="#f97316" /></div>
      <p>加载中...</p>
    </div>

    <!-- 空购物车 -->
    <div v-else-if="cartItems.length === 0" class="empty-state">
      <div class="empty-icon"><CartIcon :size="52" color="#d1d5db" /></div>
      <p class="empty-title">购物车空空如也</p>
      <p class="empty-sub">快去挑选感兴趣的宠物服务吧</p>
      <button class="go-service-btn" @click="router.push('/service')">
        <PawIcon :size="16" color="white" /> 浏览宠物服务
      </button>
    </div>

    <!-- 购物车列表 -->
    <template v-else>
      <!-- 全选栏 -->
      <div class="select-all-bar">
        <label class="checkbox-wrap" @click.prevent="toggleAll">
          <div :class="['custom-checkbox', { checked: allSelected }]">
            <svg v-if="allSelected" viewBox="0 0 12 10" fill="none">
              <path d="M1 5l3.5 3.5L11 1" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span>全选</span>
        </label>
        <span class="select-tip">已选 {{ selectedCount }} 项</span>
      </div>

      <!-- 服务列表 -->
      <div class="item-list">
        <div
          v-for="item in cartItems"
          :key="item.id"
          :class="['cart-item', { 'item-disabled': !isActive(item.service) }]"
        >
          <!-- 选择框 -->
          <div class="item-check" @click="toggleSelect(item)">
            <div :class="['custom-checkbox', { checked: item.selected && isActive(item.service) }]">
              <svg v-if="item.selected && isActive(item.service)" viewBox="0 0 12 10" fill="none">
                <path d="M1 5l3.5 3.5L11 1" stroke="white" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>

          <!-- 服务信息 -->
          <div class="item-info">
            <!-- 类型标签 + 名称 -->
            <div class="item-top">
              <span
                class="type-badge"
                :style="{
                  color: getTypeInfo(item.service?.type).color,
                  background: getTypeInfo(item.service?.type).bg
                }"
              >
                <component :is="getTypeInfo(item.service?.type).icon" :size="14" />
                {{ getTypeInfo(item.service?.type).label }}
              </span>
              <span v-if="!isActive(item.service)" class="offline-tag">已下架</span>
            </div>
            <h4 class="item-name">{{ item.service?.name || '未知服务' }}</h4>
            <p class="item-desc">{{ item.service?.content }}</p>

            <!-- 标签信息 -->
            <div class="item-meta">
              <span class="meta-tag">≤ {{ item.service?.weight }} kg</span>
              <span v-if="item.petWeight" class="meta-tag">宠物体重：{{ item.petWeight }} kg</span>
              <span v-if="item.notes" class="meta-tag notes-tag">备注：{{ item.notes }}</span>
            </div>
          </div>

          <!-- 右侧：价格 + 操作 -->
          <div class="item-right">
            <div class="item-price">
              <span class="price-symbol">¥</span>
              <span class="price-num">{{ item.service?.price }}</span>
            </div>
            <div class="item-actions">
              <button
                class="book-btn"
                :disabled="!isActive(item.service)"
                @click="handleBookItem(item)"
              >
                去预约
              </button>
              <button
                class="remove-btn"
                :disabled="removing === item.id"
                @click="handleRemove(item)"
              >
                {{ removing === item.id ? '...' : '删除' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部结算栏 -->
      <div class="checkout-bar">
        <div class="checkout-left">
          <span class="total-label">已选 <strong>{{ selectedCount }}</strong> 项，合计：</span>
          <span class="total-price">
            <span class="total-symbol">¥</span>{{ selectedTotal }}
          </span>
        </div>
        <button
          class="checkout-btn"
          :disabled="selectedCount === 0"
          @click="openBookingModal"
        >
          {{ selectedCount === 0 ? '请先选择服务' : `去预约 (${selectedCount})` }}
        </button>
      </div>
    </template>

    <!-- 清空确认弹窗 -->
    <div v-if="showClearConfirm" class="modal-mask" @click.self="showClearConfirm = false">
      <div class="modal-box">
        <div class="modal-icon"><TrashIcon :size="40" color="#ef4444" /></div>
        <h3 class="modal-title">确认清空购物车？</h3>
        <p class="modal-desc">清空后所有服务将从购物车移除，此操作不可撤销。</p>
        <div class="modal-actions">
          <button class="modal-cancel" @click="showClearConfirm = false">取消</button>
          <button class="modal-confirm" :disabled="clearing" @click="handleClear">
            {{ clearing ? '清空中...' : '确认清空' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 批量预约弹窗 -->
    <Teleport to="body">
      <div v-if="showBookingModal" class="cart-modal-mask" @click.self="closeBookingModal">
        <div class="cart-modal-box booking-modal-box">
          <div class="modal-header">
            <h3 class="modal-title"><CalendarIcon :size="18" color="#f97316" /> 批量预约服务</h3>
            <button class="modal-close" @click="closeBookingModal">×</button>
          </div>
          
          <div class="booking-summary">
            <p class="summary-text">已选 <strong>{{ selectedCount }}</strong> 项服务，合计 <span class="summary-price">¥{{ selectedTotal }}</span></p>
          </div>

          <div class="booking-form">
            <div class="form-row">
              <div class="form-group">
                <label>预约日期 <span class="required">*</span></label>
                <input 
                  v-model="bookingForm.appointmentDate" 
                  type="date" 
                  class="form-input"
                  :min="new Date().toISOString().split('T')[0]"
                />
              </div>
              <div class="form-group">
                <label>预约时间 <span class="required">*</span></label>
                <select v-model="bookingForm.appointmentTime" class="form-input">
                  <option value="09:00">09:00</option>
                  <option value="10:00">10:00</option>
                  <option value="11:00">11:00</option>
                  <option value="14:00">14:00</option>
                  <option value="15:00">15:00</option>
                  <option value="16:00">16:00</option>
                  <option value="17:00">17:00</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>宠物名称 <span class="required">*</span></label>
                <input v-model="bookingForm.petName" type="text" class="form-input" placeholder="请输入宠物名称" />
              </div>
              <div class="form-group">
                <label>宠物体重(kg) <span class="required">*</span></label>
                <input 
                  v-model="bookingForm.petWeight" 
                  type="number" 
                  step="0.1" 
                  class="form-input" 
                  placeholder="如：5.5"
                />
              </div>
            </div>

            <div class="form-group">
              <label>联系方式 <span class="required">*</span></label>
              <input v-model="bookingForm.contact" type="text" class="form-input" placeholder="手机号或微信号" />
            </div>

            <div class="form-group">
              <label>备注</label>
              <textarea 
                v-model="bookingForm.notes" 
                class="form-textarea" 
                rows="2" 
                placeholder="其他需求或注意事项（选填）"
              ></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button class="modal-cancel" @click="closeBookingModal">取消</button>
            <button class="modal-confirm booking-submit" :disabled="bookingLoading" @click="submitBooking">
              {{ bookingLoading ? '预约中...' : `确认预约 (${selectedCount})` }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style lang="scss" scoped>
.cart-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;
}

// ── 标题栏 ────────────────────────────────────────────────
.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 14px;
  border-bottom: 1.5px solid #f0f0f0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.cart-title {
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

.cart-count {
  font-size: 13px;
  color: #9ca3af;
  background: #f3f4f6;
  padding: 2px 10px;
  border-radius: 20px;
}

.clear-btn {
  font-size: 13px;
  color: #ef4444;
  background: none;
  border: 1px solid #fecaca;
  padding: 5px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #fef2f2; }
}

// ── 加载 / 空状态 ─────────────────────────────────────────
.loading-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  .loading-spin { font-size: 40px; animation: bounce 1.2s ease-in-out infinite; }
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
  padding: 40px 20px;
}

.empty-icon  { display: flex; align-items: center; justify-content: center; margin-bottom: 8px; }
.empty-title { font-size: 16px; font-weight: 600; color: #374151; margin: 4px 0 0; }
.empty-sub   { font-size: 13px; color: #9ca3af; margin: 0 0 16px; }

.go-service-btn {
  padding: 10px 24px;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  &:hover { background: #ea580c; }
}

// ── 全选栏 ────────────────────────────────────────────────
.select-all-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: white;
  border-radius: 10px;
  border: 1px solid #f0f0f0;
}

.checkbox-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
  color: #374151;
  user-select: none;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 2px solid #d1d5db;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  &.checked {
    background: #f97316;
    border-color: #f97316;
  }

  svg { width: 10px; height: 8px; }
}

.select-tip {
  font-size: 12px;
  color: #9ca3af;
  margin-left: auto;
}

// ── 列表 ──────────────────────────────────────────────────
.item-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 4px;
}

.cart-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background: white;
  border-radius: 14px;
  padding: 16px;
  border: 1.5px solid #f0f0f0;
  transition: all 0.2s;

  &:hover { border-color: #fed7aa; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }

  &.item-disabled {
    opacity: 0.6;
    .item-check { cursor: not-allowed; }
  }
}

.item-check {
  padding-top: 2px;
  cursor: pointer;
  flex-shrink: 0;
}

.item-info { flex: 1; min-width: 0; }

.item-top {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
}

.offline-tag {
  font-size: 11px;
  color: #ef4444;
  background: #fef2f2;
  padding: 2px 8px;
  border-radius: 20px;
}

.item-name {
  font-size: 15px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-desc {
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 8px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.meta-tag {
  font-size: 11px;
  color: #6b7280;
  background: #f9fafb;
  padding: 2px 8px;
  border-radius: 6px;
}

.notes-tag { color: #ea580c; background: #fff7ed; }

// ── 右侧操作 ──────────────────────────────────────────────
.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  flex-shrink: 0;
}

.item-price {
  display: flex;
  align-items: baseline;
  gap: 1px;
  color: #ef4444;
  .price-symbol { font-size: 12px; font-weight: 600; }
  .price-num    { font-size: 22px; font-weight: 800; line-height: 1; }
}

.item-actions {
  display: flex;
  gap: 6px;
}

.book-btn {
  padding: 6px 14px;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: #ea580c; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

.remove-btn {
  padding: 6px 12px;
  background: white;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: #fef2f2; }
  &:disabled { opacity: 0.4; cursor: not-allowed; }
}

// ── 结算栏 ────────────────────────────────────────────────
.checkout-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  border-radius: 14px;
  padding: 14px 20px;
  border: 1.5px solid #fed7aa;
  box-shadow: 0 2px 12px rgba(249, 115, 22, 0.1);
  gap: 12px;
  flex-wrap: wrap;
}

.checkout-left {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.total-label {
  font-size: 13px;
  color: #6b7280;
  strong { color: #f97316; }
}

.total-price {
  font-size: 22px;
  font-weight: 800;
  color: #ef4444;
  .total-symbol { font-size: 14px; }
}

.checkout-btn {
  padding: 10px 28px;
  background: #f97316;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: #ea580c;
    transform: translateY(-1px);
  }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

// ── 清空确认弹窗 ──────────────────────────────────────────
.modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.modal-box {
  background: white;
  border-radius: 20px;
  padding: 32px 28px;
  width: 320px;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}

.modal-icon  { display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
.modal-title { font-size: 17px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px; }
.modal-desc  { font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 24px; }

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
  &:hover { background: #e5e7eb; }
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
  &:hover:not(:disabled) { background: #dc2626; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

// ── 批量预约弹窗样式 ──────────────────────────────────────
.cart-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  backdrop-filter: blur(4px);
}

.cart-modal-box {
  background: white;
  border-radius: 20px;
  padding: 24px;
  width: 420px;
  max-width: 90vw;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
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
  &:hover { background: #e5e7eb; color: #374151; }
}

.booking-summary {
  background: linear-gradient(135deg, #fff7ed, #ffedd5);
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 20px;
  text-align: center;
}

.summary-text {
  margin: 0;
  font-size: 14px;
  color: #4b5563;
  strong { color: #f97316; font-size: 16px; }
}

.summary-price {
  color: #ef4444;
  font-weight: 700;
  font-size: 16px;
}

.booking-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
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

.required {
  color: #ef4444;
}

.form-input, .form-textarea {
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
  &:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }
}

.form-textarea {
  resize: none;
  font-family: inherit;
}

.booking-submit {
  background: #f97316 !important;
  &:hover:not(:disabled) {
    background: #ea580c !important;
  }
}
</style>
