<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getServiceDetailAPI, createBookingAPI, addToCartAPI } from '@/api/service'

const route = useRoute()
const router = useRouter()

// ── 数据 ─────────────────────────────────────────────────
const service = ref(null)
const loading = ref(true)
const error = ref(null)

const typeMap = {
  basic_care:         { label: '基础护理', icon: '🛁', color: '#3b82f6', bg: '#eff6ff' },
  beauty_styling:     { label: '美容造型', icon: '✂️', color: '#8b5cf6', bg: '#f5f3ff' },
  health_medical:     { label: '健康医疗', icon: '💊', color: '#ef4444', bg: '#fef2f2' },
  training_service:   { label: '训练服务', icon: '🎾', color: '#f59e0b', bg: '#fffbeb' },
  special_experience: { label: '特色体验', icon: '⭐', color: '#10b981', bg: '#ecfdf5' }
}

const typeInfo = computed(() =>
  service.value ? (typeMap[service.value.type] || { label: service.value.type, icon: '🐾', color: '#6b7280', bg: '#f9fafb' }) : {}
)

// ── 预约表单 ──────────────────────────────────────────────
const showBookingPanel = ref(false)
const submitting = ref(false)
const submitSuccess = ref(false)
const cartAdding = ref(false)
const cartSuccess = ref(false)

// 可选时间段
const timeSlots = ['09:00-10:00', '10:00-11:00', '11:00-12:00', '14:00-15:00', '15:00-16:00', '16:00-17:00']

const form = reactive({
  petName: '',
  petWeight: '',
  contact: '',
  appointmentDate: '',
  appointmentTime: '',
  notes: ''
})

const formError = ref('')

// 日期限制：今天起
const minDate = computed(() => new Date().toISOString().split('T')[0])

const validateForm = () => {
  if (!form.petName.trim())       return '请填写宠物名称'
  if (!form.petWeight)            return '请填写宠物体重'
  if (Number(form.petWeight) <= 0) return '体重必须大于0'
  if (!form.contact.trim())       return '请填写联系方式'
  if (!form.appointmentDate)      return '请选择预约日期'
  if (!form.appointmentTime)      return '请选择时间段'
  return ''
}

// ── 加入购物车 ────────────────────────────────────────────
const handleAddToCart = async () => {
  try {
    cartAdding.value = true
    await addToCartAPI({
      serviceId: service.value.id,
      petWeight: form.petWeight || null,
      notes: form.notes || null
    })
    cartSuccess.value = true
    setTimeout(() => { cartSuccess.value = false }, 2500)
  } catch (err) {
    alert(err.message || '加入购物车失败，请先登录')
  } finally {
    cartAdding.value = false
  }
}

// ── 提交预约 ──────────────────────────────────────────────
const handleSubmit = async () => {
  formError.value = validateForm()
  if (formError.value) return

  try {
    submitting.value = true
    await createBookingAPI({
      serviceId: service.value.id,
      petName: form.petName,
      petWeight: Number(form.petWeight),
      contact: form.contact,
      appointmentDate: form.appointmentDate,
      appointmentTime: form.appointmentTime,
      notes: form.notes || null
    })
    submitSuccess.value = true
  } catch (err) {
    formError.value = err.message || '预约失败，请稍后重试'
  } finally {
    submitting.value = false
  }
}

// ── 获取详情 ──────────────────────────────────────────────
const fetchDetail = async () => {
  try {
    loading.value = true
    const res = await getServiceDetailAPI(route.params.id)
    service.value = res?.data?.data
    if (!service.value) error.value = '服务不存在'
    
    // 检查 URL 参数，是否直接预约
    if (route.query.action === 'book') {
      showBookingPanel.value = true
    }
  } catch (err) {
    error.value = err.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="detail-page">

    <!-- 加载中 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-icon">🐾</div>
      <p>正在加载...</p>
    </div>

    <!-- 错误 -->
    <div v-else-if="error || !service" class="error-state">
      <div>😿</div>
      <p>{{ error || '服务不存在' }}</p>
      <button class="back-btn" @click="router.back()">返回</button>
    </div>

    <!-- 正文 -->
    <template v-else>
      <!-- 顶部横幅 -->
      <div class="detail-banner" :style="{ background: `linear-gradient(135deg, ${typeInfo.color}dd, ${typeInfo.color}99)` }">
        <div class="banner-inner">
          <button class="go-back" @click="router.back()">← 返回</button>
          <div class="banner-info">
            <div class="type-badge" :style="{ background: 'rgba(255,255,255,0.2)', color: 'white' }">
              {{ typeInfo.icon }} {{ typeInfo.label }}
            </div>
            <h1>{{ service.name }}</h1>
            <div class="banner-price">¥{{ service.price }} <span>起</span></div>
          </div>
        </div>
      </div>

      <div class="main-layout">
        <!-- 左：服务详情 -->
        <div class="detail-section">
          <!-- 基本信息 -->
          <div class="info-card">
            <h3 class="section-title">服务信息</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">服务类型</span>
                <span class="info-val">
                  <span class="type-tag" :style="{ color: typeInfo.color, background: typeInfo.bg }">
                    {{ typeInfo.icon }} {{ typeInfo.label }}
                  </span>
                </span>
              </div>
              <div class="info-item">
                <span class="info-label">服务价格</span>
                <span class="info-val price-text">¥{{ service.price }} 起</span>
              </div>
              <div class="info-item">
                <span class="info-label">适用体重</span>
                <span class="info-val">≤ {{ service.weight }} kg</span>
              </div>
              <div class="info-item">
                <span class="info-label">服务状态</span>
                <span class="info-val">
                  <span :class="['status-dot', service.status ? 'on' : 'off']">
                    {{ service.status ? '🟢 正常接单' : '🔴 暂停服务' }}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <!-- 服务描述 -->
          <div class="info-card">
            <h3 class="section-title">服务详情</h3>
            <p class="service-content">{{ service.content }}</p>
          </div>

          <!-- 温馨提示 -->
          <div class="tips-card">
            <h3 class="section-title">📋 预约须知</h3>
            <ul class="tips-list">
              <li>请提前确认宠物体重，超重可能影响服务效果</li>
              <li>预约成功后请保持联系方式畅通，等待工作人员确认</li>
              <li>如需取消，请至少提前24小时通知</li>
              <li>宠物需携带健康证明，如有特殊情况请提前说明</li>
            </ul>
          </div>
        </div>

        <!-- 右：预约面板 -->
        <div class="booking-panel">
          <div class="panel-card" v-if="!submitSuccess">
            <h3 class="panel-title">📅 立即预约</h3>

            <div class="form-group">
              <label class="form-label">宠物名称 <span class="required">*</span></label>
              <input v-model="form.petName" class="form-input" placeholder="请输入宠物昵称" />
            </div>

            <div class="form-group">
              <label class="form-label">宠物体重 (kg) <span class="required">*</span></label>
              <input v-model="form.petWeight" type="number" min="0.1" step="0.1" class="form-input" placeholder="如：5.5" />
            </div>

            <div class="form-group">
              <label class="form-label">联系方式 <span class="required">*</span></label>
              <input v-model="form.contact" class="form-input" placeholder="请输入手机号" />
            </div>

            <div class="form-group">
              <label class="form-label">预约日期 <span class="required">*</span></label>
              <input v-model="form.appointmentDate" type="date" :min="minDate" class="form-input" />
            </div>

            <div class="form-group">
              <label class="form-label">预约时间段 <span class="required">*</span></label>
              <div class="time-slots">
                <button
                  v-for="slot in timeSlots"
                  :key="slot"
                  :class="['time-slot', { active: form.appointmentTime === slot }]"
                  type="button"
                  @click="form.appointmentTime = slot"
                >{{ slot }}</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">备注（可选）</label>
              <textarea v-model="form.notes" class="form-textarea" rows="3" placeholder="如有特殊情况请备注..." />
            </div>

            <!-- 错误提示 -->
            <p v-if="formError" class="form-error">⚠️ {{ formError }}</p>

            <!-- 操作按钮 -->
            <button class="submit-btn" :disabled="submitting" @click="handleSubmit">
              {{ submitting ? '提交中...' : '✅ 确认预约' }}
            </button>

            <button
              class="cart-btn"
              :disabled="cartAdding"
              @click="handleAddToCart"
            >
              {{ cartSuccess ? '✅ 已加入购物车' : (cartAdding ? '加入中...' : '🛒 加入购物车') }}
            </button>
          </div>

          <!-- 预约成功 -->
          <div class="success-card" v-else>
            <div class="success-icon">🎉</div>
            <h3>预约成功！</h3>
            <p>我们将尽快与您联系确认预约时间</p>
            <div class="success-info">
              <div>宠物：{{ form.petName }}</div>
              <div>日期：{{ form.appointmentDate }}</div>
              <div>时段：{{ form.appointmentTime }}</div>
              <div>联系：{{ form.contact }}</div>
            </div>
            <button class="back-btn" @click="router.push('/service')">返回服务列表</button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #f8f9fb;
}

// 加载/错误
.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120px 20px;
  font-size: 52px;
  p { font-size: 16px; color: #9ca3af; margin: 16px 0; }
  .loading-icon { animation: bounce 1.2s ease-in-out infinite; }
}
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

// 顶部横幅
.detail-banner {
  padding: 48px 20px 40px;
  color: white;
}
.banner-inner {
  max-width: 1100px;
  margin: 0 auto;
}
.go-back {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.4);
  color: white;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 20px;
  &:hover { background: rgba(255,255,255,0.3); }
}
.banner-info {
  h1 { font-size: 28px; font-weight: 800; margin: 12px 0 8px; }
}
.type-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}
.banner-price {
  font-size: 32px;
  font-weight: 800;
  span { font-size: 14px; font-weight: 400; opacity: 0.8; }
}

// 主体布局
.main-layout {
  max-width: 1100px;
  margin: 32px auto;
  padding: 0 20px 60px;
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;

  @media (max-width: 900px) { grid-template-columns: 1fr; }
}

// 卡片通用
.info-card, .tips-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.section-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 18px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
}

.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  @media (max-width: 640px) { grid-template-columns: 1fr; }
}
.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.info-label { font-size: 12px; color: #9ca3af; }
.info-val    { font-size: 14px; color: #374151; font-weight: 500; }
.price-text  { color: #ef4444; font-size: 18px; font-weight: 700; }
.type-tag {
  display: inline-flex;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.service-content {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.8;
  margin: 0;
  white-space: pre-wrap;
}

.tips-list {
  padding-left: 20px;
  margin: 0;
  li {
    font-size: 13px;
    color: #6b7280;
    line-height: 1.7;
    margin-bottom: 6px;
  }
}

// 预约面板
.booking-panel { position: sticky; top: 24px; }

.panel-card {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  border: 1px solid #e0e7ff;
}
.panel-title {
  font-size: 17px;
  font-weight: 700;
  color: #1a1a2e;
  margin: 0 0 20px;
}

.form-group { margin-bottom: 16px; }
.form-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 6px;
  .required { color: #ef4444; }
}
.form-input, .form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #374151;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: #fafafa;
  &:focus { border-color: #8b5cf6; background: white; }
}
.form-textarea { resize: vertical; }

.time-slots {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.time-slot {
  padding: 8px 6px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
  background: white;
  transition: all 0.2s;
  &:hover { border-color: #8b5cf6; color: #8b5cf6; }
  &.active { background: #8b5cf6; border-color: #8b5cf6; color: white; }
}

.form-error {
  font-size: 13px;
  color: #ef4444;
  margin: 4px 0 12px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: 8px;
}

.submit-btn {
  width: 100%;
  padding: 13px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 4px;
  transition: all 0.3s;
  &:hover:not(:disabled) { background: linear-gradient(135deg, #4f46e5, #7c3aed); }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.cart-btn {
  width: 100%;
  padding: 11px;
  background: white;
  color: #8b5cf6;
  border: 1.5px solid #8b5cf6;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: #f5f3ff; }
  &:disabled { opacity: 0.6; cursor: not-allowed; }
}

// 预约成功
.success-card {
  background: white;
  border-radius: 16px;
  padding: 32px 24px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  .success-icon { font-size: 52px; margin-bottom: 12px; }
  h3 { font-size: 20px; font-weight: 700; color: #16a34a; margin: 0 0 8px; }
  p  { font-size: 14px; color: #6b7280; margin: 0 0 20px; }
}
.success-info {
  background: #f0fdf4;
  border-radius: 12px;
  padding: 16px;
  text-align: left;
  margin-bottom: 20px;
  div { font-size: 13px; color: #374151; padding: 4px 0; }
}
.back-btn {
  width: 100%;
  padding: 12px;
  background: #16a34a;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  &:hover { background: #15803d; }
}
</style>
