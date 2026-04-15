<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  getMyApplicationsAPI,
  getMyAdoptionsAPI,
  getAdoptionApplicationsAPI,
  updateApplicationStatusAPI
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

onMounted(() => fetchMyApplications())
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
      </button>
    </div>

    <!-- ── 我的申请 Tab ────────────────────────────────── -->
    <div v-if="activeTab === 'my-applications'">
      <div v-if="loadingApplications" class="empty-hint">加载中...</div>
      <div v-else-if="myApplications.length === 0" class="empty-hint">
        <span>暂无领养申请记录</span>
        <button class="goto-btn" @click="router.push('/adoption')">去看看宠物 →</button>
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
          <button class="view-btn" @click="router.push(`/adoption/${app.adoptionId}`)">查看详情</button>
        </div>
      </div>
    </div>

    <!-- ── 我的发布 Tab ────────────────────────────────── -->
    <div v-if="activeTab === 'my-posts'">
      <div v-if="loadingAdoptions" class="empty-hint">加载中...</div>
      <div v-else-if="myAdoptions.length === 0" class="empty-hint">
        <span>暂无发布记录</span>
        <button class="goto-btn" @click="router.push('/adoption/create')">去发布 →</button>
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
</style>
