<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getAdoptionDetailAPI, submitAdoptionApplicationAPI } from '@/api/adoption'
import Toast from '@/components/Common/Toast.vue'
import { useToast } from '@/hooks/Common/useToast.js'
import { useUserStore } from '@/stores/user'
import { LocationIcon, PhoneIcon, MailIcon, SparkleIcon, GameIcon, ClipboardIcon, CommentIcon, PawIcon, PartyIcon, WarningIcon } from '@/components/Icons'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const {
  showToast, toastMessage, toastType, duration,
  showSuccess, showError, showWarning, hideToast
} = useToast()

// ── 登录状态 & 是否是发布者 ─────────────────────────────────
const isLoggedIn   = computed(() => !!userStore.token)
const isPublisher  = computed(() => {
  const uid = userStore.userInfo?.id
  return uid && adoption.value?.userId === uid
})

// 点击申请领养按鈕——先检查登录状态
const handleApplyClick = () => {
  if (!isLoggedIn.value) {
    showWarning('请先登录后再申请领养')
    setTimeout(() => router.push('/login'), 1500)
    return
  }
  applyError.value = ''
  showModal.value = true
}
const adoption = ref(null)
const loading = ref(true)
const error = ref(null)
const showModal = ref(false)
const applying = ref(false)
const applySuccess = ref(false)
const applyError = ref('')

const applyForm = ref({
  name: '',
  phone: '',
  experience: '',
  reason: ''
})

// ── 状态 / 费用映射 ──────────────────────────────────────
const statusMap = {
  pending:  { label: '待领养', color: '#16a34a', bg: '#dcfce7' },
  approved: { label: '已领养', color: '#6b7280', bg: '#f3f4f6' },
  rejected: { label: '已取消', color: '#ef4444', bg: '#fee2e2' }
}

const feeMap = {
  free:       { label: '无偿领养', icon: '🎁', color: '#16a34a', bg: '#dcfce7' },
  paid:       { label: '有偿领养', icon: '💰', color: '#ea580c', bg: '#ffedd5' },
  negotiable: { label: '费用面议', icon: '🤝', color: '#d97706', bg: '#fef3c7' }
}

const vaccineMap = {
  unvaccinated: '未接种',
  one_dose:     '已接种1剂',
  two_doses:    '已接种2剂',
  three_doses:  '已接种3剂',
  completed:    '全程完成 ✅'
}

// ── 计算属性 ─────────────────────────────────────────────
const pet = computed(() => adoption.value?.pet || {})
const user = computed(() => adoption.value?.user || {})
const publisherName = computed(() => user.value.nickname || user.value.username || '匿名用户')

const petAge = computed(() => {
  if (!pet.value.birthday) return '未知'
  const birth = new Date(pet.value.birthday)
  const now = new Date()
  const ms = now - birth
  const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365))
  const months = Math.floor((ms % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))
  if (years > 0) return `${years}岁${months > 0 ? months + '个月' : ''}`
  return `${months}个月`
})

const feeDisplay = computed(() => {
  if (!adoption.value) return ''
  const fee = feeMap[adoption.value.fee]
  if (!fee) return ''
  if (adoption.value.fee === 'paid' && adoption.value.money) {
    return `${fee.label} · ¥${adoption.value.money}`
  }
  return fee.label
})

const location = computed(() => adoption.value?.request?.location || '地点未填写')
const contact = computed(() => adoption.value?.request?.contact || '联系方式未填写')
const requirements = computed(() => adoption.value?.request?.requirements || '暂无要求')

const getImageUrl = (path) => {
  if (!path || path === '图片链接') return 'https://via.placeholder.com/800x500?text=暂无图片'
  if (path.startsWith('http')) return path
  return `http://localhost:3000${path}`
}

// ── 获取详情 ─────────────────────────────────────────────
const fetchDetail = async () => {
  try {
    loading.value = true
    error.value = null
    adoption.value = await getAdoptionDetailAPI(route.params.id)
  } catch (err) {
    error.value = err.message || '获取详情失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// ── 申请领养 ─────────────────────────────────────────────
const submitApply = async () => {
  if (!applyForm.value.name || !applyForm.value.phone) {
    showWarning('请填写姓名和联系方式')
    return
  }
  applyError.value = ''
  applying.value = true
  try {
    await submitAdoptionApplicationAPI({
      adoptionId: adoption.value.id,
      name: applyForm.value.name,
      phone: applyForm.value.phone,
      experience: applyForm.value.experience || undefined,
      reason: applyForm.value.reason || undefined
    })
    applying.value = false
    applySuccess.value = true
    setTimeout(() => {
      showModal.value = false
      applySuccess.value = false
      applyForm.value = { name: '', phone: '', experience: '', reason: '' }
    }, 2000)
  } catch (err) {
    applying.value = false
    if (err.status === 401 || err.code === 401) {
      showModal.value = false
      showWarning('登录已过期，请重新登录')
      setTimeout(() => router.push('/login'), 1500)
    } else {
      applyError.value = err.message || '申请失败，请稍后重试'
    }
  }
}

onMounted(fetchDetail)
</script>

<template>
  <div class="detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-paw">🐾</div>
      <p>正在加载中...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">😿</div>
      <p>{{ error }}</p>
      <button class="back-btn" @click="$router.back()">← 返回列表</button>
    </div>

    <!-- 详情内容 -->
    <div v-else-if="adoption" class="detail-wrap">
      <!-- 顶部返回 -->
      <div class="top-nav">
        <button class="back-btn" @click="$router.back()">← 返回</button>
        <span
          class="status-badge"
          :style="{ color: statusMap[adoption.status]?.color, background: statusMap[adoption.status]?.bg }"
        >
          {{ statusMap[adoption.status]?.label }}
        </span>
      </div>

      <div class="content-grid">
        <!-- 左列：图片 + 发布者 -->
        <div class="left-col">
          <div class="pet-image-wrap">
            <img :src="getImageUrl(pet.image)" :alt="pet.nickName" />
          </div>

          <!-- 发布者 -->
          <div class="publisher-card">
            <div class="publisher-avatar">
              <img
                :src="user.avatar ? `http://localhost:3000${user.avatar}` : '/default-avatar.jpg'"
                :alt="publisherName"
              />
            </div>
            <div class="publisher-info">
              <p class="pub-name">{{ publisherName }}</p>
              <p class="pub-label">发布人</p>
            </div>
          </div>

          <!-- 联系 + 地点 -->
          <div class="contact-card">
            <div class="contact-item">
              <LocationIcon :size="20" color="#f97316" />
              <div>
                <p class="contact-label">所在地点</p>
                <p class="contact-val">{{ location }}</p>
              </div>
            </div>
            <div class="contact-item">
              <PhoneIcon :size="20" color="#f97316" />
              <div>
                <p class="contact-label">联系方式</p>
                <p class="contact-val">{{ contact }}</p>
              </div>
            </div>
          </div>

          <!-- 操作按鈕：未登录/非发布者可申请 -->
          <template v-if="adoption.status === 'pending'">
            <button
              v-if="!isPublisher"
              class="apply-btn"
              @click="handleApplyClick"
            >
              <MailIcon :size="16" /> 申请领养
            </button>
            <div v-else class="publisher-notice">
              <PawIcon :size="16" color="#16a34a" /> 这是您发布的领养帖子
            </div>
          </template>
          <button v-else class="apply-btn disabled" disabled>
            {{ statusMap[adoption.status]?.label }}
          </button>
        </div>

        <!-- 右列：详情 -->
        <div class="right-col">
          <!-- 宠物标题 -->
          <div class="pet-title-row">
            <h1 class="pet-name">{{ pet.nickName }}</h1>
            <span class="sex-icon" :class="pet.sex ? 'male' : 'female'">
              {{ pet.sex ? '♂ 雄' : '♀ 雌' }}
            </span>
          </div>

          <!-- 费用标签 -->
          <div
            class="fee-label"
            :style="{ color: feeMap[adoption.fee]?.color, background: feeMap[adoption.fee]?.bg }"
          >
            {{ feeMap[adoption.fee]?.icon }} {{ feeDisplay }}
          </div>

          <!-- 基本信息网格 -->
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">宠物类型</span>
              <span class="info-value">{{ pet.type }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">品种</span>
              <span class="info-value">{{ pet.breed }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">年龄</span>
              <span class="info-value">{{ petAge }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">疫苗状态</span>
              <span class="info-value">{{ vaccineMap[pet.vaccineStatus] || '未知' }}</span>
            </div>
          </div>

          <!-- 性格标签 -->
          <div v-if="pet.nature && pet.nature.length > 0" class="section-block">
            <h3 class="section-title"><SparkleIcon :size="16" color="#f97316" /> 宠物性格</h3>
            <div class="nature-tags">
              <span v-for="tag in pet.nature" :key="tag" class="nature-tag">{{ tag }}</span>
            </div>
          </div>

          <!-- 爱好标签 -->
          <div v-if="pet.hobby && pet.hobby.length > 0" class="section-block">
            <h3 class="section-title"><GameIcon :size="16" color="#f97316" /> 宠物爱好</h3>
            <div class="nature-tags">
              <span v-for="tag in pet.hobby" :key="tag" class="hobby-tag">{{ tag }}</span>
            </div>
          </div>

          <!-- 领养要求 -->
          <div class="section-block">
            <h3 class="section-title"><ClipboardIcon :size="16" color="#f97316" /> 领养要求</h3>
            <p class="section-text">{{ requirements }}</p>
          </div>

          <!-- 说明信息 -->
          <div v-if="adoption.other_msg" class="section-block">
            <h3 class="section-title"><CommentIcon :size="16" color="#f97316" /> 其他说明</h3>
            <p class="section-text">{{ adoption.other_msg }}</p>
          </div>

          <!-- 宠物其他信息 -->
          <div v-if="pet.other_msg" class="section-block">
            <h3 class="section-title"><PawIcon :size="16" color="#f97316" /> 宠物介绍</h3>
            <p class="section-text">{{ pet.other_msg }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 申请领养弹窗 -->
    <Teleport to="body">
      <div v-if="showModal" class="adopt-apply-overlay" @click.self="showModal = false">
        <div class="adopt-apply-box">
          <div v-if="applySuccess" class="apply-success">
            <PartyIcon :size="52" color="#16a34a" />
            <h3>申请已提交！</h3>
            <p>发布人会尽快与您联系，请保持电话畅通。</p>
          </div>
          <template v-else>
            <div class="adopt-apply-header">
              <h3>申请领养 · {{ pet.nickName }}</h3>
              <button class="adopt-apply-close" @click="showModal = false">✕</button>
            </div>
            <div class="adopt-apply-body">
              <div class="adopt-form-item">
                <label>您的姓名 <span class="required">*</span></label>
                <input v-model="applyForm.name" placeholder="请输入您的真实姓名" />
              </div>
              <div class="adopt-form-item">
                <label>联系方式 <span class="required">*</span></label>
                <input v-model="applyForm.phone" placeholder="请输入手机号或微信" />
              </div>
              <div class="adopt-form-item">
                <label>养宠经验</label>
                <select v-model="applyForm.experience">
                  <option value="">请选择</option>
                  <option value="none">无经验</option>
                  <option value="little">少量经验（1~2年）</option>
                  <option value="some">有经验（3~5年）</option>
                  <option value="rich">丰富经验（5年以上）</option>
                </select>
              </div>
              <div class="adopt-form-item">
                <label>申请理由</label>
                <textarea v-model="applyForm.reason" placeholder="说说您为什么想领养这只宠物..." rows="3" />
              </div>
            </div>
            <div v-if="applyError" class="adopt-apply-error">
              <WarningIcon :size="14" color="#ef4444" /> {{ applyError }}
            </div>
            <div class="adopt-apply-footer">
              <button class="cancel-btn" @click="showModal = false">取消</button>
              <button class="submit-btn" :disabled="applying" @click="submitApply">
                {{ applying ? '提交中...' : '提交申请' }}
              </button>
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>

  <!-- Toast 提示（使用 Teleport 确保覆盖在 modal 之上） -->
  <Teleport to="body">
    <Toast
      :show-toast="showToast"
      :toast-message="toastMessage"
      :toast-type="toastType"
      :duration="duration"
      @hide-toast="hideToast"
    />
  </Teleport>
</template>

<style lang="scss" scoped>
.detail-page {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 24px 20px 60px;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  text-align: center;

  .loading-paw, .error-icon { font-size: 52px; margin-bottom: 16px; animation: bounce 1.2s ease-in-out infinite; }
  p { font-size: 16px; color: #9ca3af; }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.detail-wrap {
  max-width: 1100px;
  margin: 0 auto;
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.back-btn {
  padding: 8px 20px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: #f97316; color: #f97316; }
}

.status-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
}

.content-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
}

.left-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pet-image-wrap {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 20px;
    box-shadow: inset 0 0 0 1px rgba(249, 115, 22, 0.12);
    pointer-events: none;
  }

  img {
    width: 100%;
    height: 300px;
    object-fit: cover;
    display: block;
    transition: transform 0.5s ease;
  }

  &:hover img {
    transform: scale(1.03);
  }
}

.publisher-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border-left: 3px solid #f97316;

  .publisher-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;

    img { width: 100%; height: 100%; object-fit: cover; }
  }

  .pub-name  { font-size: 15px; font-weight: 600; color: #1f2937; margin: 0; }
  .pub-label { font-size: 12px; color: #9ca3af; margin: 4px 0 0; }
}

.contact-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 14px;

  .contact-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;

    .contact-label { font-size: 12px; color: #9ca3af; margin: 0; }
    .contact-val   { font-size: 14px; font-weight: 500; color: #374151; margin: 4px 0 0; }
  }
}

.apply-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ff9a3c, #f97316);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(249,115,22,0.4);
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  animation: apply-pulse 2.5s ease-in-out infinite;
  animation-play-state: paused;

  &:not(.disabled) {
    animation-play-state: running;
    &:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(249,115,22,0.5); }
  }

  &.disabled { background: #d1d5db; box-shadow: none; cursor: not-allowed; }
}

@keyframes apply-pulse {
  0%, 100% { box-shadow: 0 4px 16px rgba(249, 115, 22, 0.4); }
  50%      { box-shadow: 0 4px 24px rgba(249, 115, 22, 0.6); }
}

.publisher-notice {
  width: 100%;
  padding: 14px 16px;
  background: #f0fdf4;
  border: 1.5px solid #86efac;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 600;
  color: #16a34a;
  text-align: center;
}

.right-col {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.pet-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .pet-name  { font-size: 28px; font-weight: 800; color: #1f2937; margin: 0; }
  .sex-icon  { font-size: 18px; font-weight: 700; padding: 6px 14px; border-radius: 20px;
    &.male   { color: #3b82f6; background: #eff6ff; }
    &.female { color: #ec4899; background: #fdf2f8; }
  }
}

.fee-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  width: fit-content;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .info-item {
    background: #f8f9fb;
    border-radius: 12px;
    padding: 14px 16px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: background 0.2s, transform 0.2s;

    &:hover {
      background: #fff7ed;
      transform: translateY(-1px);
    }

    .info-label { font-size: 12px; color: #9ca3af; }
    .info-value { font-size: 15px; font-weight: 600; color: #1f2937; }
  }
}

.section-block {
  .section-title {
    font-size: 15px;
    font-weight: 700;
    color: #374151;
    margin: 0 0 10px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .section-text  { font-size: 14px; color: #6b7280; line-height: 1.7; margin: 0;
    white-space: pre-wrap; background: #f9fafb; border-radius: 8px; padding: 12px; }
}

.nature-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  .nature-tag {
    padding: 5px 12px;
    background: #eff6ff;
    color: #1d4ed8;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
  }

  .hobby-tag {
    padding: 5px 12px;
    background: #f0fdf4;
    color: #166534;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
  }
}

/* 申请领养弹窗（类名使用 adopt-apply- 前缀，避免与 DaisyUI 冲突） */
.adopt-apply-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.adopt-apply-box {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  overflow: hidden;
  position: relative;
  z-index: 10000;
}

.adopt-apply-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid #f3f4f6;

  h3 { font-size: 17px; font-weight: 700; color: #1f2937; margin: 0; }
  .adopt-apply-close { background: none; border: none; font-size: 18px; cursor: pointer; color: #9ca3af; padding: 0;
    &:hover { color: #374151; }
  }
}

.adopt-apply-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  .adopt-form-item {
    display: flex;
    flex-direction: column;
    gap: 6px;

    label { font-size: 14px; font-weight: 500; color: #374151; .required { color: #ef4444; } }

    :deep(input), :deep(select), :deep(textarea) {
      padding: 10px 14px;
      border: 1.5px solid #e5e7eb;
      border-radius: 10px;
      font-size: 14px;
      color: #1f2937;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
      font-family: inherit;
      background: #ffffff;
      width: 100%;
      box-sizing: border-box;

      &:focus {
        border-color: #f97316;
        box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
      }
    }

    :deep(textarea) { resize: vertical; }
  }
}

.adopt-apply-footer {
  display: flex;
  gap: 12px;
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;

  .cancel-btn {
    flex: 1;
    padding: 12px;
    background: #f3f4f6;
    color: #6b7280;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    &:hover { background: #e5e7eb; }
  }

  .submit-btn {
    flex: 2;
    padding: 12px;
    background: linear-gradient(135deg, #ff9a3c, #f97316);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    &:hover:not(:disabled) { opacity: 0.9; }
    &:disabled { opacity: 0.6; cursor: not-allowed; }
  }
}

.adopt-apply-error {
  padding: 10px 24px 0;
  color: #ef4444;
  font-size: 13px;
  font-weight: 500;
  text-align: center;
  background: #fef2f2;
  border-top: 1px solid #fecaca;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.apply-success {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 24px;
  text-align: center;
  gap: 8px;

  h3 { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0; }
  p  { font-size: 14px; color: #6b7280; margin: 0; }
}
</style>
