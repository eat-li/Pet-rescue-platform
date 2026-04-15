<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getCartAPI,
  updateCartItemAPI,
  removeCartItemAPI,
  clearCartAPI
} from '@/api/service'

const router = useRouter()

// ── 数据 ─────────────────────────────────────────────────
const cartItems = ref([])
const loading = ref(false)
const selectedTotal = ref('0.00')

// 服务类型映射
const typeMap = {
  basic_care:         { label: '基础护理', icon: '🛁', color: '#3b82f6', bg: '#eff6ff' },
  beauty_styling:     { label: '美容造型', icon: '✂️', color: '#8b5cf6', bg: '#f5f3ff' },
  health_medical:     { label: '健康医疗', icon: '💊', color: '#ef4444', bg: '#fef2f2' },
  training_service:   { label: '训练服务', icon: '🎾', color: '#f59e0b', bg: '#fffbeb' },
  special_experience: { label: '特色体验', icon: '⭐', color: '#10b981', bg: '#ecfdf5' }
}

const getTypeInfo = (type) =>
  typeMap[type] || { label: type, icon: '🐾', color: '#6b7280', bg: '#f9fafb' }

// 已选中条目
const selectedItems = computed(() => cartItems.value.filter(i => i.selected && i.service?.status))
const selectedCount = computed(() => selectedItems.value.length)

// ── 拉取购物车 ────────────────────────────────────────────
const fetchCart = async () => {
  try {
    loading.value = true
    const res = await getCartAPI()
    const data = res?.data?.data
    if (data) {
      cartItems.value = data.items || []
      selectedTotal.value = data.selectedTotal || '0.00'
    }
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
    .filter(i => i.selected && i.service?.status)
    .reduce((sum, i) => sum + parseFloat(i.service?.price || 0), 0)
  selectedTotal.value = total.toFixed(2)
}

// ── 删除单条 ──────────────────────────────────────────────
const removing = ref(null)
const handleRemove = async (item) => {
  if (removing.value === item.id) return
  removing.value = item.id
  try {
    await removeCartItemAPI(item.id)
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
    await clearCartAPI()
    cartItems.value = []
    selectedTotal.value = '0.00'
    showClearConfirm.value = false
  } catch {
    alert('清空失败，请重试')
  } finally {
    clearing.value = false
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
        <h2 class="cart-title">🛒 我的购物车</h2>
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
      <div class="loading-spin">🐾</div>
      <p>加载中...</p>
    </div>

    <!-- 空购物车 -->
    <div v-else-if="cartItems.length === 0" class="empty-state">
      <div class="empty-icon">🛒</div>
      <p class="empty-title">购物车空空如也</p>
      <p class="empty-sub">快去挑选感兴趣的宠物服务吧</p>
      <button class="go-service-btn" @click="router.push('/service')">
        🐾 浏览宠物服务
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
          :class="['cart-item', { 'item-disabled': !item.service?.status }]"
        >
          <!-- 选择框 -->
          <div class="item-check" @click="toggleSelect(item)">
            <div :class="['custom-checkbox', { checked: item.selected && item.service?.status }]">
              <svg v-if="item.selected && item.service?.status" viewBox="0 0 12 10" fill="none">
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
                {{ getTypeInfo(item.service?.type).icon }}
                {{ getTypeInfo(item.service?.type).label }}
              </span>
              <span v-if="!item.service?.status" class="offline-tag">已下架</span>
            </div>
            <h4 class="item-name">{{ item.service?.name || '未知服务' }}</h4>
            <p class="item-desc">{{ item.service?.content }}</p>

            <!-- 标签信息 -->
            <div class="item-meta">
              <span class="meta-tag">🐶 ≤ {{ item.service?.weight }} kg</span>
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
                :disabled="!item.service?.status"
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
          @click="router.push('/service')"
        >
          {{ selectedCount === 0 ? '请先选择服务' : `去预约 (${selectedCount})` }}
        </button>
      </div>
    </template>

    <!-- 清空确认弹窗 -->
    <div v-if="showClearConfirm" class="modal-mask" @click.self="showClearConfirm = false">
      <div class="modal-box">
        <div class="modal-icon">🗑️</div>
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

.empty-icon  { font-size: 52px; }
.empty-title { font-size: 16px; font-weight: 600; color: #374151; margin: 4px 0 0; }
.empty-sub   { font-size: 13px; color: #9ca3af; margin: 0 0 16px; }

.go-service-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: linear-gradient(135deg, #4f46e5, #7c3aed); }
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
    background: #8b5cf6;
    border-color: #8b5cf6;
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

  &:hover { border-color: #e0e7ff; box-shadow: 0 2px 10px rgba(0,0,0,0.06); }

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

.notes-tag { color: #8b5cf6; background: #f5f3ff; }

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
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: linear-gradient(135deg, #4f46e5, #7c3aed); }
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
  border: 1.5px solid #e0e7ff;
  box-shadow: 0 2px 12px rgba(99, 102, 241, 0.1);
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
  strong { color: #8b5cf6; }
}

.total-price {
  font-size: 22px;
  font-weight: 800;
  color: #ef4444;
  .total-symbol { font-size: 14px; }
}

.checkout-btn {
  padding: 10px 28px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover:not(:disabled) {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
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

.modal-icon  { font-size: 40px; margin-bottom: 12px; }
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
</style>
