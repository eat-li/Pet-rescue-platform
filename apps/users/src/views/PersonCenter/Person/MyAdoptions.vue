<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  getMyApplicationsAPI,
  getMyAdoptionsAPI,
  getAdoptionApplicationsAPI,
  updateApplicationStatusAPI,
  getAdoptionDetailAPI
} from '../../../api/adoption'
import Toast from '../../../components/Common/Toast.vue'
import { useToast } from '../../../hooks/Common/useToast.js'

const router = useRouter()
const {
  showToast, toastMessage, toastType, duration,
  showSuccess, showError, hideToast
} = useToast()

// ── 当前 Tab ──────────────────────────────────────────────
const activeTab = ref('my-applications')

// ── 我提交的申请 ──────────────────────────────────────────
const myApplications = ref([])
const loadingApplications = ref(false)

// ── 我发布的领养帖子 ──────────────────────────────────────
const myAdoptions = ref([])
const loadingAdoptions = ref(false)

// 每个帖子的申请列表（key: adoptionId）
const postApplications = ref({})
const expandedPosts = ref(new Set())
const loadingPost = ref({})

// ── 详情弹窗状态 ──────────────────────────────────────────
const showDetailModal = ref(false)
const detailData = ref(null)
const detailLoading = ref(false)

// 待处理申请总数（用于 Tab 角标）
const pendingCount = computed(() => {
  let count = 0
  for (const list of Object.values(postApplications.value)) {
    count += list.filter(a => a.status === 'pending').length
  }
  return count
})

// ── 常量映射 ──────────────────────────────────────────────
const experienceMap = {
  none: '无经验',
  little: '少量（1~2年）',
  some: '有经验（3~5年）',
  rich: '丰富（5年以上）'
}

const appStatusMap = {
  pending:  { label: '待处理', color: '#f97316', bg: '#fff7ed' },
  approved: { label: '已通过', color: '#16a34a', bg: '#dcfce7' },
  rejected: { label: '已拒绝', color: '#ef4444', bg: '#fee2e2' }
}

const adoptionStatusMap = {
  pending:  { label: '待领养', color: '#2563eb', bg: '#eff6ff' },
  approved: { label: '已领养', color: '#6b7280', bg: '#f3f4f6' },
  rejected: { label: '已取消', color: '#ef4444', bg: '#fee2e2' }
}

// ── 工具函数 ──────────────────────────────────────────────
const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `http://localhost:3000${path}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })
}

// ── 获取我提交的申请 ──────────────────────────────────────
const fetchMyApplications = async () => {
  loadingApplications.value = true
  try {
    myApplications.value = await getMyApplicationsAPI()
  } catch (err) {
    showError(err.message || '获取申请列表失败')
  } finally {
    loadingApplications.value = false
  }
}

// ── 获取我发布的帖子 ──────────────────────────────────────
const fetchMyAdoptions = async () => {
  loadingAdoptions.value = true
  try {
    myAdoptions.value = await getMyAdoptionsAPI()
    // 自动加载所有帖子的申请列表，为角标和实时显示提供数据
    await Promise.all(
      myAdoptions.value.map(async (adoption) => {
        try {
          postApplications.value[adoption.id] = await getAdoptionApplicationsAPI(adoption.id)
        } catch (e) {
          // 忽略单个加载失败
        }
      })
    )
  } catch (err) {
    showError(err.message || '获取发布列表失败')
  } finally {
    loadingAdoptions.value = false
  }
}

// ── 展开/收起某帖子的申请列表 ──────────────────────────────
const toggleApplications = async (adoptionId) => {
  const set = expandedPosts.value
  if (set.has(adoptionId)) {
    set.delete(adoptionId)
    expandedPosts.value = new Set(set)
    return
  }
  set.add(adoptionId)
  expandedPosts.value = new Set(set)
  if (!postApplications.value[adoptionId]) {
    loadingPost.value[adoptionId] = true
    try {
      postApplications.value[adoptionId] = await getAdoptionApplicationsAPI(adoptionId)
    } catch (err) {
      showError(err.message || '获取申请失败')
    } finally {
      loadingPost.value[adoptionId] = false
    }
  }
}

// ── 发布者审批申请 ────────────────────────────────────────
const handleReview = async (appId, status, adoptionId) => {
  try {
    await updateApplicationStatusAPI(appId, status)
    const label = status === 'approved' ? '已通过' : '已拒绝'
    showSuccess(`申请${label}`)
    // 刷新该帖子的申请列表
    postApplications.value[adoptionId] = await getAdoptionApplicationsAPI(adoptionId)
    // 如果是批准，也刷新我的发布列表（帖子状态会变化）
    if (status === 'approved') {
      await fetchMyAdoptions()
    }
  } catch (err) {
    showError(err.message || '操作失败')
  }
}

// ── 打开详情弹窗 ──────────────────────────────────────────
const viewDetail = async (adoptionId) => {
  detailData.value = null
  detailLoading.value = true
  showDetailModal.value = true
  try {
    detailData.value = await getAdoptionDetailAPI(adoptionId)
  } catch (err) {
    showError(err.message || '获取详情失败')
    showDetailModal.value = false
  } finally {
    detailLoading.value = false
  }
}

// 关闭详情弹窗
const closeDetailModal = () => {
  showDetailModal.value = false
  detailData.value = null
}

// 宠物年龄计算
const calcPetAge = (birthday) => {
  if (!birthday) return '未知'
  const birth = new Date(birthday)
  const now = new Date()
  const ms = now - birth
  const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365))
  const months = Math.floor((ms % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))
  if (years > 0) return `${years}岁${months > 0 ? months + '个月' : ''}`
  return months > 0 ? `${months}个月` : '不足1个月'
}

// ── Tab 切换 ──────────────────────────────────────────────
const switchTab = (tab) => {
  activeTab.value = tab
  if (tab === 'my-applications' && myApplications.value.length === 0) {
    fetchMyApplications()
  }
  if (tab === 'my-posts' && myAdoptions.value.length === 0) {
    fetchMyAdoptions()
  }
}

onMounted(() => {
  fetchMyApplications()
  fetchMyAdoptions() // 同时加载帖子和申请以显示角标
})
</script>

<template>
  <div class="my-adoptions">
    <!-- Tab 切换 -->
    <div class="tab-bar">
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'my-applications' }"
        @click="switchTab('my-applications')"
      >
        💌 我的申请
      </button>
      <button
        class="tab-btn"
        :class="{ active: activeTab === 'my-posts' }"
        @click="switchTab('my-posts')"
      >
        🐾 我的发布
        <span v-if="pendingCount > 0" class="pending-badge">{{ pendingCount }}</span>
      </button>
    </div>

    <!-- ── 我的申请 Tab ────────────────────────────────── -->
    <div v-if="activeTab === 'my-applications'">
      <div v-if="loadingApplications" class="empty-hint">加载中...</div>
      <div v-else-if="myApplications.length === 0" class="empty-hint">
        <span>暂无领养申请记录</span>
        <button class="goto-btn" @click="router.push('/adopt')">去看看宠物 →</button>
      </div>
      <div v-else class="card-list">
        <div v-for="app in myApplications" :key="app.id" class="app-card">
          <img
            class="pet-thumb"
            :src="getImageUrl(app.adoption?.pet?.image)"
            :alt="app.adoption?.pet?.nickName"
          />
          <div class="card-info">
            <div class="card-title">
              {{ app.adoption?.pet?.nickName || '未知宠物' }}
              <span class="breed">{{ app.adoption?.pet?.breed }}</span>
            </div>
            <div class="card-meta">
              <span>发布人：{{ app.adoption?.user?.nickname || app.adoption?.user?.username || '匿名' }}</span>
              <span>申请时间：{{ formatDate(app.createdAt) }}</span>
            </div>
            <div class="card-footer">
              <span
                class="status-badge"
                :style="{ color: appStatusMap[app.status]?.color, background: appStatusMap[app.status]?.bg }"
              >
                {{ appStatusMap[app.status]?.label }}
              </span>
              <span
                class="adoption-status"
                :style="{ color: adoptionStatusMap[app.adoption?.status]?.color }"
              >
                帖子：{{ adoptionStatusMap[app.adoption?.status]?.label }}
              </span>
            </div>
          </div>
          <button class="view-btn" @click="viewDetail(app.adoptionId)">查看详情</button>
        </div>
      </div>
    </div>

    <!-- ── 我的发布 Tab ────────────────────────────────── -->
    <div v-if="activeTab === 'my-posts'">
      <div v-if="loadingAdoptions" class="empty-hint">加载中...</div>
      <div v-else-if="myAdoptions.length === 0" class="empty-hint">
        <span>暂无发布记录</span>
        <button class="goto-btn" @click="router.push('/adopt/create')">去发布 →</button>
      </div>
      <div v-else class="card-list">
        <div v-for="adoption in myAdoptions" :key="adoption.id" class="post-card">
          <!-- 帖子头部 -->
          <div class="post-header">
            <img
              class="pet-thumb"
              :src="getImageUrl(adoption.pet?.image)"
              :alt="adoption.pet?.nickName"
            />
            <div class="card-info">
              <div class="card-title">
                {{ adoption.pet?.nickName || '未知宠物' }}
                <span class="breed">{{ adoption.pet?.breed }}</span>
              </div>
              <div class="card-meta">
                <span>发布时间：{{ formatDate(adoption.createdAt) }}</span>
              </div>
              <span
                class="status-badge"
                :style="{ color: adoptionStatusMap[adoption.status]?.color, background: adoptionStatusMap[adoption.status]?.bg }"
              >
                {{ adoptionStatusMap[adoption.status]?.label }}
              </span>
            </div>
            <button
              class="expand-btn"
              :class="{ expanded: expandedPosts.has(adoption.id) }"
              @click="toggleApplications(adoption.id)"
            >
              {{ expandedPosts.has(adoption.id) ? '收起申请 ▲' : '查看申请 ▼' }}
            </button>
          </div>

          <!-- 申请列表（展开） -->
          <div v-if="expandedPosts.has(adoption.id)" class="applications-panel">
            <div v-if="loadingPost[adoption.id]" class="mini-hint">加载申请中...</div>
            <div v-else-if="!postApplications[adoption.id] || postApplications[adoption.id].length === 0" class="mini-hint">
              暂无申请
            </div>
            <div v-else class="applicant-list">
              <div
                v-for="app in postApplications[adoption.id]"
                :key="app.id"
                class="applicant-card"
              >
                <div class="applicant-info">
                  <img
                    class="applicant-avatar"
                    :src="app.applicant?.avatar ? getImageUrl(app.applicant.avatar) : '/default-avatar.jpg'"
                    alt="avatar"
                  />
                  <div class="applicant-detail">
                    <div class="applicant-name">{{ app.name }}</div>
                    <div class="applicant-meta">
                      <span>📞 {{ app.phone }}</span>
                      <span v-if="app.experience">🐕 {{ experienceMap[app.experience] }}</span>
                    </div>
                    <div v-if="app.reason" class="applicant-reason">
                      "{{ app.reason }}"
                    </div>
                  </div>
                  <span
                    class="status-badge sm"
                    :style="{ color: appStatusMap[app.status]?.color, background: appStatusMap[app.status]?.bg }"
                  >
                    {{ appStatusMap[app.status]?.label }}
                  </span>
                </div>
                <div v-if="app.status === 'pending' && adoption.status === 'pending'" class="review-actions">
                  <button class="approve-btn" @click="handleReview(app.id, 'approved', adoption.id)">
                    ✅ 通过
                  </button>
                  <button class="reject-btn" @click="handleReview(app.id, 'rejected', adoption.id)">
                    ❌ 拒绝
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast -->
  <Toast
    :show-toast="showToast"
    :toast-message="toastMessage"
    :toast-type="toastType"
    :duration="duration"
    @hide-toast="hideToast"
  />

  <!-- 领养详情弹窗 -->
  <Teleport to="body">
    <div v-if="showDetailModal" class="adopt-detail-overlay" @click.self="closeDetailModal">
      <div class="adopt-detail-box">
        <!-- 弹窗头部 -->
        <div class="adopt-detail-header">
          <h3>领养详情</h3>
          <button class="adopt-detail-close" @click="closeDetailModal">✕</button>
        </div>

        <!-- 加载中 -->
        <div v-if="detailLoading" class="adopt-detail-loading">
          <span>加载中...</span>
        </div>

        <!-- 详情内容 -->
        <div v-else-if="detailData" class="adopt-detail-content">
          <!-- 宠物图片 -->
          <div class="adopt-detail-img-wrap">
            <img
              class="adopt-detail-img"
              :src="getImageUrl(detailData.pet?.image)"
              :alt="detailData.pet?.nickName"
            />
            <span
              class="adopt-detail-status"
              :style="{ color: adoptionStatusMap[detailData.status]?.color, background: adoptionStatusMap[detailData.status]?.bg }"
            >
              {{ adoptionStatusMap[detailData.status]?.label || detailData.status }}
            </span>
          </div>

          <!-- 宠物基本信息 -->
          <div class="adopt-detail-section">
            <h4 class="adopt-detail-section-title">🐾 宠物信息</h4>
            <div class="adopt-detail-grid">
              <div class="adopt-detail-item">
                <span class="label">昵称</span>
                <span class="value">{{ detailData.pet?.nickName || '未知' }}</span>
              </div>
              <div class="adopt-detail-item">
                <span class="label">品种</span>
                <span class="value">{{ detailData.pet?.breed || '未知' }}</span>
              </div>
              <div class="adopt-detail-item">
                <span class="label">类型</span>
                <span class="value">{{ detailData.pet?.type || '未知' }}</span>
              </div>
              <div class="adopt-detail-item">
                <span class="label">年龄</span>
                <span class="value">{{ calcPetAge(detailData.pet?.birthday) }}</span>
              </div>
              <div class="adopt-detail-item">
                <span class="label">性别</span>
                <span class="value">{{ detailData.pet?.gender === 'male' ? '♂ 雄' : detailData.pet?.gender === 'female' ? '♀ 雌' : '未知' }}</span>
              </div>
              <div class="adopt-detail-item">
                <span class="label">疫苗</span>
                <span class="value">{{ detailData.pet?.vaccineStatus ? '✅ 已接种' : '❌ 未接种' }}</span>
              </div>
            </div>
          </div>

          <!-- 领养信息 -->
          <div class="adopt-detail-section">
            <h4 class="adopt-detail-section-title">📋 领养要求</h4>
            <div class="adopt-detail-grid">
              <div class="adopt-detail-item">
                <span class="label">领养费用</span>
                <span class="value adopt-fee">{{ detailData.fee > 0 ? `¥${detailData.fee}` : '免费' }}</span>
              </div>
              <div class="adopt-detail-item">
                <span class="label">发布时间</span>
                <span class="value">{{ formatDate(detailData.createdAt) }}</span>
              </div>
              <div v-if="detailData.requirements" class="adopt-detail-item full">
                <span class="label">领养条件</span>
                <span class="value">{{ detailData.requirements }}</span>
              </div>
            </div>
          </div>

          <!-- 发布者信息 -->
          <div class="adopt-detail-section">
            <h4 class="adopt-detail-section-title">👤 发布者</h4>
            <div class="adopt-publisher-row">
              <img
                class="adopt-publisher-avatar"
                :src="detailData.user?.avatar ? getImageUrl(detailData.user.avatar) : '/default-avatar.jpg'"
                alt="发布者头像"
              />
              <div class="adopt-publisher-info">
                <div class="adopt-publisher-name">{{ detailData.user?.nickname || detailData.user?.username || '匿名用户' }}</div>
                <div v-if="detailData.description" class="adopt-publisher-desc">{{ detailData.description }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作 -->
        <div class="adopt-detail-footer">
          <button class="adopt-detail-cancel" @click="closeDetailModal">关闭</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style lang="scss" scoped>
.my-adoptions {
  padding: 0;
}

/* Tab 栏 */
.tab-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 12px;
}

.tab-btn {
  padding: 8px 20px;
  border: none;
  border-radius: 20px;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { background: #e9d5ff; color: #7c3aed; }
  &.active { background: #7c3aed; color: #fff; }

  .pending-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #ef4444;
    color: white;
    font-size: 11px;
    font-weight: 700;
    border-radius: 10px;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    margin-left: 5px;
    line-height: 1;
  }
}

/* 空状态 */
.empty-hint {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 40px 0;
  color: #9ca3af;
  font-size: 14px;
  text-align: center;
}

.goto-btn {
  padding: 8px 20px;
  background: linear-gradient(135deg, #ff9a3c, #f97316);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover { opacity: 0.85; }
}

/* 卡片列表 */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 申请卡片 */
.app-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
  transition: box-shadow 0.2s;

  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
}

/* 发布卡片 */
.post-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

.post-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
}

/* 宠物缩略图 */
.pet-thumb {
  width: 60px;
  height: 60px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  background: #f3f4f6;
}

/* 卡片信息 */
.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
  display: flex;
  align-items: center;
  gap: 8px;

  .breed {
    font-size: 12px;
    font-weight: 400;
    color: #9ca3af;
  }
}

.card-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 状态徽章 */
.status-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;

  &.sm { font-size: 11px; padding: 2px 10px; }
}

.adoption-status {
  font-size: 12px;
  font-weight: 500;
}

/* 查看详情按钮 */
.view-btn {
  flex-shrink: 0;
  padding: 6px 14px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;

  &:hover { border-color: #f97316; color: #f97316; }
}

/* 展开申请按钮 */
.expand-btn {
  flex-shrink: 0;
  padding: 7px 16px;
  background: #f3f4f6;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover, &.expanded { background: #ede9fe; border-color: #7c3aed; color: #7c3aed; }
}

/* 申请列表面板 */
.applications-panel {
  border-top: 1px solid #f0f0f0;
  background: #fafafa;
  padding: 12px 16px;
}

.mini-hint {
  text-align: center;
  color: #9ca3af;
  font-size: 13px;
  padding: 12px 0;
}

.applicant-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.applicant-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 14px;
}

.applicant-info {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.applicant-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.applicant-detail {
  flex: 1;
  min-width: 0;

  .applicant-name {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 4px;
  }

  .applicant-meta {
    display: flex;
    gap: 12px;
    font-size: 12px;
    color: #6b7280;
    flex-wrap: wrap;
  }

  .applicant-reason {
    margin-top: 6px;
    font-size: 12px;
    color: #6b7280;
    font-style: italic;
    background: #f9fafb;
    border-radius: 6px;
    padding: 6px 10px;
    white-space: pre-wrap;
  }
}

.review-actions {
  display: flex;
  gap: 8px;
  margin-top: 10px;

  .approve-btn, .reject-btn {
    padding: 6px 16px;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .approve-btn {
    background: #dcfce7;
    color: #16a34a;
    &:hover { background: #bbf7d0; }
  }

  .reject-btn {
    background: #fee2e2;
    color: #ef4444;
    &:hover { background: #fecaca; }
  }
}

/* ──────────────────────────────────────────────────────
   领养详情弹窗（adopt-detail- 前缀，避免DaisyUI冲突）
────────────────────────────────────────────────────── */
.adopt-detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.adopt-detail-box {
  background: #ffffff;
  border-radius: 20px;
  width: 100%;
  max-width: 520px;
  max-height: 88vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  position: relative;
  z-index: 10000;
}

.adopt-detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 22px 14px;
  border-bottom: 1px solid #f0f0f0;
  flex-shrink: 0;

  h3 {
    margin: 0;
    font-size: 17px;
    font-weight: 700;
    color: #1f2937;
  }
}

.adopt-detail-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #f3f4f6;
  color: #6b7280;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s;
  &:hover { background: #fee2e2; color: #ef4444; }
}

.adopt-detail-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
  color: #9ca3af;
  font-size: 14px;
}

.adopt-detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 0 4px;
}

.adopt-detail-img-wrap {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  flex-shrink: 0;

  .adopt-detail-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .adopt-detail-status {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 14px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
  }
}

.adopt-detail-section {
  padding: 14px 22px;
  border-bottom: 1px solid #f9f9f9;

  &:last-child { border-bottom: none; }
}

.adopt-detail-section-title {
  margin: 0 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.adopt-detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.adopt-detail-item {
  display: flex;
  flex-direction: column;
  gap: 3px;

  &.full { grid-column: 1 / -1; }

  .label {
    font-size: 11px;
    color: #9ca3af;
    font-weight: 500;
  }

  .value {
    font-size: 14px;
    color: #1f2937;
    font-weight: 500;
  }

  .adopt-fee {
    color: #f97316;
    font-weight: 700;
    font-size: 15px;
  }
}

.adopt-publisher-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.adopt-publisher-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 2px solid #f0f0f0;
}

.adopt-publisher-info {
  flex: 1;

  .adopt-publisher-name {
    font-size: 15px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 3px;
  }

  .adopt-publisher-desc {
    font-size: 12px;
    color: #6b7280;
    line-height: 1.5;
  }
}

.adopt-detail-footer {
  padding: 14px 22px;
  border-top: 1px solid #f0f0f0;
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

.adopt-detail-cancel {
  padding: 9px 28px;
  background: #f3f4f6;
  color: #374151;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { background: #e5e7eb; }
}
</style>
