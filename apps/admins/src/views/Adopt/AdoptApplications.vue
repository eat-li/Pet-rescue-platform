<script setup>
import PageContainer from '../../components/Common/PageContainer.vue'
import Mypagination from '../../components/Common/Mypagination.vue'
import { Refresh } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAllAdoptionApplicationsAPI, updateAdoptionApplicationStatusAPI } from '../../api/adoption'

// ── 数据 ─────────────────────────────────────────────────
const applications = ref([])
const loading = ref(false)
const filterStatus = ref('')
const pagination = ref({
  currentPage: 1,
  pageSize: 10,
  totalItems: 0,
  totalPages: 1
})

// 详情弹窗
const showDetail = ref(false)
const currentRow = ref(null)

// ── 常量映射 ─────────────────────────────────────────────
const statusMap = {
  pending:  { label: '待处理', type: 'warning' },
  approved: { label: '已通过', type: 'success' },
  rejected: { label: '已拒绝', type: 'danger' }
}

const experienceMap = {
  none:   '无经验',
  little: '少量（1~2年）',
  some:   '有经验（3~5年）',
  rich:   '丰富（5年以上）'
}

const adoptionStatusMap = {
  pending:  { label: '待领养', type: 'primary' },
  approved: { label: '已领养', type: 'success' },
  rejected: { label: '已取消', type: 'danger' }
}

// ── 工具函数 ─────────────────────────────────────────────
const getImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `http://localhost:3000${path}`
}

const formatDate = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit'
  })
}

// ── 获取申请列表 ─────────────────────────────────────────
const fetchApplications = async (page = 1) => {
  loading.value = true
  try {
    const params = { page, limit: pagination.value.pageSize }
    if (filterStatus.value) params.status = filterStatus.value
    const res = await getAllAdoptionApplicationsAPI(params)
    if (res.code === 200) {
      applications.value = res.data.applications
      pagination.value = res.data.pagination
    }
  } catch (err) {
    ElMessage.error(err.message || '获取失败')
  } finally {
    loading.value = false
  }
}

// ── 更新申请状态 ─────────────────────────────────────────
const handleUpdateStatus = async (row, status) => {
  const label = status === 'approved' ? '通过' : '拒绝'
  try {
    await ElMessageBox.confirm(
      `确定要${label}来自「${row.name}」的申请吗？${status === 'approved' ? '\n（通过后，该领养帖子将标记为已领养，其他申请将自动拒绝）' : ''}`,
      '确认操作',
      { type: 'warning', confirmButtonText: `确认${label}`, cancelButtonText: '取消' }
    )
    const res = await updateAdoptionApplicationStatusAPI(row.id, status)
    if (res.code === 200) {
      ElMessage.success(`已${label}申请`)
      await fetchApplications(pagination.value.currentPage)
      if (showDetail.value) showDetail.value = false
    }
  } catch (err) {
    if (err !== 'cancel') ElMessage.error(err.message || '操作失败')
  }
}

// ── 分页 / 搜索 ─────────────────────────────────────────
const handleSearch = () => fetchApplications(1)
const handleReset = () => { filterStatus.value = ''; fetchApplications(1) }
const handlePageChange = (page) => fetchApplications(page)

const openDetail = (row) => {
  currentRow.value = row
  showDetail.value = true
}

onMounted(() => fetchApplications())
</script>

<template>
  <PageContainer title="领养申请管理">
    <template #extra>
      <div class="header-actions">
        <!-- 状态筛选 -->
        <el-select
          v-model="filterStatus"
          placeholder="申请状态"
          class="filter-select"
          clearable
          @change="handleSearch"
        >
          <el-option label="待处理" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>

        <!-- 重置 -->
        <el-button type="info" class="reset-button" @click="handleReset">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
      </div>
    </template>

    <template #content>
      <div class="app-content">
        <!-- 统计卡片 -->
        <div class="stats-row">
          <div class="stat-card pending">
            <div class="stat-num">{{ applications.filter(i => i.status === 'pending').length }}</div>
            <div class="stat-label">待处理</div>
          </div>
          <div class="stat-card approved">
            <div class="stat-num">{{ applications.filter(i => i.status === 'approved').length }}</div>
            <div class="stat-label">已通过</div>
          </div>
          <div class="stat-card rejected">
            <div class="stat-num">{{ applications.filter(i => i.status === 'rejected').length }}</div>
            <div class="stat-label">已拒绝</div>
          </div>
          <div class="stat-card total">
            <div class="stat-num">{{ pagination.totalItems }}</div>
            <div class="stat-label">共计</div>
          </div>
        </div>

        <!-- 表格 -->
        <div class="table-container">
          <el-table
            :data="applications"
            v-loading="loading"
            style="width: 100%"
            stripe
            :border="false"
            height="460"
          >
            <!-- 申请人信息 -->
            <el-table-column label="申请人" min-width="160">
              <template #default="{ row }">
                <div class="applicant-cell">
                  <el-avatar
                    :src="getImageUrl(row.applicant?.avatar)"
                    :size="32"
                  />
                  <div class="applicant-info">
                    <div class="applicant-name">{{ row.name }}</div>
                    <div class="applicant-account">{{ row.applicant?.username }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 联系方式 -->
            <el-table-column label="联系方式" width="140" align="center">
              <template #default="{ row }">
                <span class="phone-text">{{ row.phone }}</span>
              </template>
            </el-table-column>

            <!-- 养宠经验 -->
            <el-table-column label="养宠经验" width="130" align="center">
              <template #default="{ row }">
                <span class="exp-text">{{ experienceMap[row.experience] || '-' }}</span>
              </template>
            </el-table-column>

            <!-- 宠物信息 -->
            <el-table-column label="申请宠物" min-width="180">
              <template #default="{ row }">
                <div class="pet-cell">
                  <el-image
                    :src="getImageUrl(row.adoption?.pet?.image)"
                    class="pet-avatar"
                    fit="cover"
                    hide-on-click-modal
                  >
                    <template #error>
                      <div class="image-error">🐾</div>
                    </template>
                  </el-image>
                  <div class="pet-info">
                    <div class="pet-name">{{ row.adoption?.pet?.nickName }}</div>
                    <div class="pet-breed">{{ row.adoption?.pet?.breed }} · {{ row.adoption?.pet?.type }}</div>
                    <el-tag
                      size="small"
                      :type="adoptionStatusMap[row.adoption?.status]?.type"
                      effect="light"
                      round
                    >
                      {{ adoptionStatusMap[row.adoption?.status]?.label }}
                    </el-tag>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 发布人 -->
            <el-table-column label="发布人" width="110" align="center">
              <template #default="{ row }">
                <span class="publisher-name">{{ row.adoption?.user?.nickname || row.adoption?.user?.username || '-' }}</span>
              </template>
            </el-table-column>

            <!-- 申请时间 -->
            <el-table-column label="申请时间" width="160" align="center">
              <template #default="{ row }">
                <span class="date-text">{{ formatDate(row.createdAt) }}</span>
              </template>
            </el-table-column>

            <!-- 状态 -->
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="statusMap[row.status]?.type" effect="light" round size="small">
                  {{ statusMap[row.status]?.label }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column label="操作" width="160" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button size="small" plain @click="openDetail(row)">详情</el-button>
                  <template v-if="row.status === 'pending'">
                    <el-button
                      size="small"
                      type="success"
                      plain
                      @click="handleUpdateStatus(row, 'approved')"
                    >通过</el-button>
                    <el-button
                      size="small"
                      type="danger"
                      plain
                      @click="handleUpdateStatus(row, 'rejected')"
                    >拒绝</el-button>
                  </template>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <Mypagination
            :current-page="pagination.currentPage"
            :page-size="pagination.pageSize"
            :total-items="pagination.totalItems"
            @page-change="handlePageChange"
          />
        </div>

        <!-- 详情弹窗 -->
        <el-dialog
          v-model="showDetail"
          title="申请详情"
          width="520"
          align-center
        >
          <div v-if="currentRow" class="detail-body">
            <!-- 宠物信息 -->
            <div class="detail-section">
              <div class="section-label">申请宠物</div>
              <div class="detail-pet-row">
                <el-image
                  :src="getImageUrl(currentRow.adoption?.pet?.image)"
                  class="detail-pet-img"
                  fit="cover"
                />
                <div>
                  <div class="detail-pet-name">{{ currentRow.adoption?.pet?.nickName }}</div>
                  <div class="detail-pet-sub">{{ currentRow.adoption?.pet?.breed }} · {{ currentRow.adoption?.pet?.type }}</div>
                  <el-tag size="small" :type="adoptionStatusMap[currentRow.adoption?.status]?.type" effect="light">
                    {{ adoptionStatusMap[currentRow.adoption?.status]?.label }}
                  </el-tag>
                </div>
              </div>
            </div>

            <el-divider />

            <!-- 申请信息 -->
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="申请人姓名">{{ currentRow.name }}</el-descriptions-item>
              <el-descriptions-item label="联系方式">{{ currentRow.phone }}</el-descriptions-item>
              <el-descriptions-item label="养宠经验" :span="2">
                {{ experienceMap[currentRow.experience] || '未填写' }}
              </el-descriptions-item>
              <el-descriptions-item label="申请理由" :span="2">
                <span style="white-space: pre-wrap">{{ currentRow.reason || '未填写' }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="申请时间" :span="2">{{ formatDate(currentRow.createdAt) }}</el-descriptions-item>
              <el-descriptions-item label="当前状态" :span="2">
                <el-tag :type="statusMap[currentRow.status]?.type" effect="light">
                  {{ statusMap[currentRow.status]?.label }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="发布人" :span="2">
                {{ currentRow.adoption?.user?.nickname || currentRow.adoption?.user?.username }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="showDetail = false">关闭</el-button>
              <el-button
                type="success"
                v-if="currentRow?.status === 'pending'"
                @click="handleUpdateStatus(currentRow, 'approved')"
              >✅ 通过申请</el-button>
              <el-button
                type="danger"
                v-if="currentRow?.status === 'pending'"
                @click="handleUpdateStatus(currentRow, 'rejected')"
              >❌ 拒绝申请</el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </template>
  </PageContainer>
</template>

<style scoped lang="scss">
/* 头部操作区 */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-select {
  width: 130px;
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    height: 40px;
    box-shadow: none;
    border: 1px solid #e9ecef;
    background: #f8f9fa;
    &:hover { border-color: #d0d7de; }
  }
}

.reset-button {
  background: #fff;
  border: 1px solid #d0d7de;
  color: #2563EB;
  border-radius: 6px;
  padding: 0 16px;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;
  &:hover { background: #1F2937; border-color: #d0d7de; color: #fff; }
}

/* 统计卡片 */
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 14px 16px;
  text-align: center;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);

  .stat-num { font-size: 26px; font-weight: 700; line-height: 1; margin-bottom: 4px; }
  .stat-label { font-size: 12px; color: #9ca3af; }

  &.pending  { .stat-num { color: #f97316; } border-top: 3px solid #f97316; }
  &.approved { .stat-num { color: #16a34a; } border-top: 3px solid #16a34a; }
  &.rejected { .stat-num { color: #ef4444; } border-top: 3px solid #ef4444; }
  &.total    { .stat-num { color: #8470FF; } border-top: 3px solid #8470FF; }
}

/* 表格容器 */
.table-container {
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

/* 申请人单元格 */
.applicant-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .applicant-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }
  .applicant-name { font-size: 14px; font-weight: 600; color: #1f2937; }
  .applicant-account { font-size: 12px; color: #9ca3af; }
}

.phone-text { font-size: 13px; color: #374151; }
.exp-text   { font-size: 12px; color: #6b7280; }
.date-text  { font-size: 12px; color: #6b7280; }
.publisher-name { font-size: 13px; color: #374151; }

/* 宠物单元格 */
.pet-cell {
  display: flex;
  align-items: center;
  gap: 8px;

  .pet-avatar {
    width: 44px;
    height: 44px;
    border-radius: 6px;
    flex-shrink: 0;
  }

  :deep(.image-error) {
    width: 44px;
    height: 44px;
    background: #f5f5f5;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
  }
}

.pet-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;

  .pet-name  { font-size: 13px; font-weight: 600; color: #1f2937; }
  .pet-breed { font-size: 11px; color: #9ca3af; }
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  flex-wrap: wrap;
}

/* 表格样式覆盖 */
:deep(.el-table) {
  border: none;
  th, td { border: none !important; }
  .el-table__inner-wrapper::before { display: none; }
}

:deep(.el-pagination) {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* 详情弹窗 */
.detail-section {
  margin-bottom: 8px;
  .section-label { font-size: 13px; color: #9ca3af; margin-bottom: 8px; }
}

.detail-pet-row {
  display: flex;
  align-items: center;
  gap: 12px;

  .detail-pet-img {
    width: 64px;
    height: 64px;
    border-radius: 10px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .detail-pet-name { font-size: 17px; font-weight: 700; color: #1f2937; margin: 0 0 4px; }
  .detail-pet-sub  { font-size: 12px; color: #9ca3af; margin-bottom: 6px; }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 768px) {
  .stats-row { flex-wrap: wrap; }
  .stat-card { min-width: calc(50% - 6px); }
}
</style>
