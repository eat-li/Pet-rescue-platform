<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCartListAPI, deleteCartItemAPI, batchDeleteCartAPI, updateCartItemAPI, createBookingAPI } from '@/api/service'
import { useUserStore } from '@/stores/user'
import { formatImageUrl } from '@/utils/imgformat'
import Toast from '@/components/Common/Toast.vue'
import { useToast } from '@/hooks/Common/useToast.js'
import { PawIcon, CartIcon, WarningIcon, PartyIcon } from '@/components/Icons'

const router = useRouter()
const userStore = useUserStore()

// Toast 功能
const { showSuccess, showError, showWarning, showToast, toastMessage, toastType, duration, hideToast } = useToast()

// 数据
const cartItems = ref([])
const loading = ref(true)
const submitting = ref(false)
const selectedItems = ref([])

// 时间段选项
const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00']

// 预约弹窗
const showBookingModal = ref(false)
const bookingItem = ref(null)
const bookingForm = ref({
  petName: '',
  petWeight: '',
  contact: '',
  appointmentDate: '',
  appointmentTime: '',
  notes: ''
})

// 计算属性 - 参考总价（DECIMAL类型需parseFloat转换，否则会字符串拼接）
const totalPrice = computed(() => {
  return cartItems.value
    .filter(item => selectedItems.value.includes(item.id))
    .reduce((sum, item) => {
      const price = parseFloat(item.service?.price) || 0
      return sum + price
    }, 0).toFixed(2)
})

const minDate = computed(() => new Date().toISOString().split('T')[0])

// 获取购物车
const fetchCart = async () => {
  if (!userStore.token) {
    router.push('/login')
    return
  }
  
  try {
    loading.value = true
    const res = await getCartListAPI()
    cartItems.value = res?.data?.data || []
    // 默认全选
    selectedItems.value = cartItems.value.map(item => item.id)
  } catch (err) {
    console.error('获取购物车失败:', err)
  } finally {
    loading.value = false
  }
}

// 删除单项
const handleDelete = async (id) => {
  if (!confirm('确定删除该服务吗？')) return
  
  try {
    await deleteCartItemAPI(id)
    cartItems.value = cartItems.value.filter(item => item.id !== id)
    selectedItems.value = selectedItems.value.filter(sid => sid !== id)
    showSuccess('删除成功')
  } catch (err) {
    showError(err.message || '删除失败')
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedItems.value.length === 0) {
    showWarning('请选择要删除的服务')
    return
  }
  
  if (!confirm(`确定删除选中的 ${selectedItems.value.length} 项服务吗？`)) return
  
  try {
    await batchDeleteCartAPI(selectedItems.value)
    cartItems.value = cartItems.value.filter(item => !selectedItems.value.includes(item.id))
    selectedItems.value = []
    showSuccess('批量删除成功')
  } catch (err) {
    showError(err.message || '删除失败')
  }
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedItems.value.length === cartItems.value.length) {
    selectedItems.value = []
  } else {
    selectedItems.value = cartItems.value.map(item => item.id)
  }
}

// 打开预约弹窗
const openBookingModal = (item) => {
  bookingItem.value = item
  bookingForm.value = {
    petName: '',
    petWeight: item.petWeight || '',
    contact: '',
    appointmentDate: '',
    appointmentTime: '',
    notes: item.notes || ''
  }
  showBookingModal.value = true
}

// 关闭弹窗
const closeModal = () => {
  showBookingModal.value = false
  bookingItem.value = null
}

// 提交预约
const handleSubmitBooking = async () => {
  if (!bookingForm.value.petName.trim()) {
    showWarning('请填写宠物名称')
    return
  }
  if (!bookingForm.value.petWeight) {
    showWarning('请填写宠物体重')
    return
  }
  if (!bookingForm.value.contact.trim()) {
    showWarning('请填写联系方式')
    return
  }
  if (!bookingForm.value.appointmentDate) {
    showWarning('请选择预约日期')
    return
  }
  if (!bookingForm.value.appointmentTime) {
    showWarning('请选择时间段')
    return
  }
  
  try {
    submitting.value = true
    await createBookingAPI({
      serviceId: bookingItem.value.serviceId,
      petName: bookingForm.value.petName,
      petWeight: Number(bookingForm.value.petWeight),
      contact: bookingForm.value.contact,
      appointmentDate: bookingForm.value.appointmentDate,
      appointmentTime: bookingForm.value.appointmentTime,
      notes: bookingForm.value.notes,
      totalPrice: bookingItem.value.service?.price
    })
    
    // 从购物车移除
    await deleteCartItemAPI(bookingItem.value.id)
    cartItems.value = cartItems.value.filter(item => item.id !== bookingItem.value.id)
    selectedItems.value = selectedItems.value.filter(id => id !== bookingItem.value.id)
    
    showSuccess('预约成功！')
    closeModal()
  } catch (err) {
    showError(err.message || '预约失败')
  } finally {
    submitting.value = false
  }
}

// 去服务列表
const goServiceList = () => {
  router.push('/service')
}

onMounted(fetchCart)
</script>

<template>
  <div class="cart-page">
    <!-- Toast 组件 -->
    <Toast
      :show-toast="showToast"
      :toast-message="toastMessage"
      :toast-type="toastType"
      :duration="duration"
      @hide-toast="hideToast"
    />
    <!-- 顶部 -->
    <div class="cart-header">
      <div class="header-content">
        <button class="back-btn" @click="router.back()">← 返回</button>
        <h1>我的购物车</h1>
        <p class="header-desc">{{ cartItems.length }} 项服务待预约</p>
      </div>
    </div>

    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <PawIcon :size="52" color="#f97316" class="loading-icon" />
      <p>加载中...</p>
    </div>

    <!-- 空购物车 -->
    <div v-else-if="cartItems.length === 0" class="empty-state">
      <CartIcon :size="56" color="#f97316" class="empty-icon-svg" />
      <h3>购物车空空如也</h3>
      <p>快去挑选心仪的服务吧</p>
      <button class="browse-btn" @click="goServiceList">浏览服务</button>
    </div>

    <!-- 购物车列表 -->
    <div v-else class="cart-content">
      <div class="cart-main">
        <!-- 工具栏 -->
        <div class="toolbar">
          <label class="select-all" @click="toggleSelectAll">
            <input type="checkbox" :checked="selectedItems.length === cartItems.length" />
            <span>全选</span>
          </label>
          <button class="delete-btn" @click="handleBatchDelete" :disabled="selectedItems.length === 0">
            删除选中
          </button>
        </div>

        <!-- 商品列表 -->
        <div class="item-list">
          <div 
            v-for="item in cartItems" 
            :key="item.id" 
            class="cart-item"
            :class="{ selected: selectedItems.includes(item.id) }"
          >
            <label class="item-check" @click.stop>
              <input 
                type="checkbox" 
                :value="item.id" 
                v-model="selectedItems"
              />
            </label>
            
            <div class="item-image">
              <img 
                v-if="item.service?.image" 
                :src="formatImageUrl(item.service.image)" 
                :alt="item.service.name"
              >
              <div v-else class="img-placeholder">🐾</div>
            </div>

            <div class="item-info">
              <h3 class="item-name">{{ item.service?.name || '未知服务' }}</h3>
              <p class="item-type">{{ item.service?.type }}</p>
              <div class="item-meta">
                <span v-if="item.petWeight">体重: {{ item.petWeight }}kg</span>
                <span v-if="item.notes">备注: {{ item.notes }}</span>
              </div>
            </div>

            <div class="item-price">
              <span class="price-label">价格</span>
              <span class="price-value">¥{{ item.service?.price || 0 }}</span>
            </div>

            <div class="item-actions">
              <button class="book-btn" @click="openBookingModal(item)">
                立即预约
              </button>
              <button class="remove-btn" @click="handleDelete(item.id)">
                移除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 结算栏 -->
      <div class="cart-footer">
        <div class="footer-left">
          <div class="footer-count">
            <span class="count-badge">{{ cartItems.length }}</span>
            <span>项服务待预约</span>
          </div>
          <p class="footer-hint">每项服务需单独选择预约时间</p>
        </div>
        <div class="footer-right">
          <div class="total-price">
            <span class="price-label-sm">已选 {{ selectedItems.length }} 项参考总价</span>
            <span class="price-num">¥{{ totalPrice }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 预约弹窗 -->
    <div v-if="showBookingModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>预约服务</h3>
          <button class="close-btn" @click="closeModal">×</button>
        </div>
        
        <div class="modal-body">
          <div class="service-preview" v-if="bookingItem?.service">
            <span class="service-name">{{ bookingItem.service.name }}</span>
            <span class="service-price">¥{{ bookingItem.service.price }}</span>
          </div>

          <div class="form-group">
            <label>宠物名称 <span class="required">*</span></label>
            <input v-model="bookingForm.petName" placeholder="请输入宠物昵称" />
          </div>

          <div class="form-group">
            <label>宠物体重 (kg) <span class="required">*</span></label>
            <input v-model="bookingForm.petWeight" type="number" min="0.1" step="0.1" placeholder="如：5.5" />
          </div>

          <div class="form-group">
            <label>联系方式 <span class="required">*</span></label>
            <input v-model="bookingForm.contact" placeholder="请输入手机号" />
          </div>

          <div class="form-group">
            <label>预约日期 <span class="required">*</span></label>
            <input v-model="bookingForm.appointmentDate" type="date" :min="minDate" />
          </div>

          <div class="form-group">
            <label>预约时间段 <span class="required">*</span></label>
            <div class="time-slots">
              <button
                v-for="slot in timeSlots"
                :key="slot"
                :class="['time-slot', { active: bookingForm.appointmentTime === slot }]"
                type="button"
                @click="bookingForm.appointmentTime = slot"
              >{{ slot }}</button>
            </div>
          </div>

          <div class="form-group">
            <label>备注（可选）</label>
            <textarea v-model="bookingForm.notes" rows="2" placeholder="特殊情况请备注..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="cancel-btn" @click="closeModal">取消</button>
          <button class="confirm-btn" :disabled="submitting" @click="handleSubmitBooking">
            {{ submitting ? '提交中...' : '确认预约' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cart-page {
  min-height: 100vh;
  background: #f8f9fb;
}

// 头部
.cart-header {
  background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 40%, #fef3c7 100%);
  padding: 40px 20px;
  position: relative;
  overflow: hidden;
}

.header-content {
  max-width: 1100px;
  margin: 0 auto;
}

.back-btn {
  background: white;
  border: 1.5px solid #e5e7eb;
  color: #6b7280;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  transition: all 0.2s;
  &:hover { border-color: #f97316; color: #f97316; }
}

.cart-header h1 {
  font-size: 28px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 6px;
}

.header-desc {
  font-size: 15px;
  color: #92400e;
  opacity: 0.7;
  margin: 0;
}

// 加载/空状态
.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px 20px;
}

.loading-icon {
  animation: float-gentle 3s ease-in-out infinite;
  margin-bottom: 16px;
}

.empty-icon-svg {
  margin-bottom: 16px;
  opacity: 0.6;
  animation: float-gentle 3s ease-in-out infinite;
}

@keyframes float-gentle {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-6px); }
}

.empty-state h3 {
  font-size: 20px;
  color: #374151;
  margin: 0 0 8px;
}

.empty-state p {
  color: #9ca3af;
  margin: 0 0 20px;
}

.browse-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #ff9a3c, #f97316);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.35);
  transition: all 0.3s;
  &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(249, 115, 22, 0.45); }
}

// 主内容
.cart-content {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 20px 100px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
}

.select-all {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;
}

.delete-btn {
  padding: 8px 16px;
  background: #fef2f2;
  color: #ef4444;
  border: 1px solid #fecaca;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  &:hover:not(:disabled) { background: #fee2e2; }
}

// 商品项
.item-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cart-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: white;
  border-radius: 12px;
  border: 1.5px solid #f0f0f0;
  transition: all 0.2s;

  &.selected { border-color: #f97316; }
}

.item-check {
  cursor: pointer;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  background: #f3f4f6;
  flex-shrink: 0;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .img-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    color: #9ca3af;
  }
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 4px;
}

.item-type {
  font-size: 12px;
  color: #f97316;
  background: #fff7ed;
  display: inline-block;
  padding: 2px 10px;
  border-radius: 20px;
  margin: 0;
}

.item-meta {
  display: flex;
  gap: 12px;
  margin-top: 6px;
  font-size: 12px;
  color: #9ca3af;
}

.item-price {
  text-align: center;
  min-width: 80px;
}

.price-label {
  display: block;
  font-size: 12px;
  color: #9ca3af;
}

.price-value {
  font-size: 20px;
  font-weight: 800;
  color: #ef4444;
}

.item-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.book-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff9a3c, #f97316);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  transition: all 0.3s;
  &:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
}

.remove-btn {
  padding: 6px 16px;
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  &:hover { background: #f9fafb; }
}

// 底部结算栏
.cart-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
  z-index: 100;
}

.footer-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.footer-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
}

.count-badge {
  background: linear-gradient(135deg, #ff9a3c, #f97316);
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 20px;
  min-width: 20px;
  text-align: center;
}

.footer-hint {
  font-size: 11px;
  color: #9ca3af;
  margin: 0;
}

.footer-right {
  text-align: right;
}

.total-price {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.price-label-sm {
  font-size: 11px;
  color: #9ca3af;
}

.price-num {
  font-size: 22px;
  font-weight: 800;
  color: #ef4444;
}

// 弹窗
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #f3f4f6;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
  }
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
  &:hover { background: #e5e7eb; }
}

.modal-body {
  padding: 20px;
}

.service-preview {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #fff7ed;
  border-radius: 10px;
  margin-bottom: 16px;
}

.service-name {
  font-weight: 600;
  color: #374151;
}

.service-price {
  font-weight: 800;
  color: #ef4444;
}

.form-group {
  margin-bottom: 14px;

  label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #374151;
    margin-bottom: 6px;
  }

  .required { color: #ef4444; }

  input, textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1.5px solid #e5e7eb;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    box-sizing: border-box;
    &:focus { border-color: #f97316; box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1); }
  }
}

.time-slots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.time-slot {
  padding: 8px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
  &:hover { border-color: #f97316; color: #f97316; }
  &.active { background: linear-gradient(135deg, #ff9a3c, #f97316); border-color: transparent; color: white; box-shadow: 0 2px 6px rgba(249, 115, 22, 0.3); }
}

.modal-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #f3f4f6;
}

.cancel-btn {
  flex: 1;
  padding: 12px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #e5e7eb; }
}

.confirm-btn {
  flex: 1;
  padding: 12px;
  background: linear-gradient(135deg, #ff9a3c, #f97316);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  &:disabled { opacity: 0.6; }
  &:hover:not(:disabled) { transform: scale(1.01); box-shadow: 0 4px 12px rgba(249, 115, 22, 0.4); }
}
</style>
