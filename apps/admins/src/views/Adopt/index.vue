<script setup>
import PageContainer from '../../components/Common/PageContainer.vue'
import Mypagination from '../../components/Common/Mypagination.vue'
import { Search, Delete, Refresh } from '@element-plus/icons-vue'
import { onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { useAdoptionData } from '../../hooks/useAdoptionData'
import { formatImageUrl } from '../../utils/imgformat'

const {
  adoptionData,
  pagination,
  searchText,
  filterStatus,
  filterType,
  loading,
  selectedRows,
  showBatchActions,
  fetchAdoptionList,
  handleSearch,
  handleReset,
  handlePageChange,
  handleStatusChange,
  handleDelete,
  handleBatchDelete,
  handleSelectionChange,
  handleClearSelection,
  uploadAdoptionImage,
  createAdoption
} = useAdoptionData()

// 详情弹窗
const showDetail = ref(false)
const currentRow = ref(null)

// 新增弹窗
const showAddDialog = ref(false)
const addForm = ref({
  userId: null,
  petInfo: {
    nickName: '',
    sex: true,
    breed: '',
    type: '',
    birthday: '',
    image: '',
    vaccineStatus: 'unvaccinated',
    nature: [],
    hobby: [],
    other_msg: ''
  },
  fee: 'free',
  money: null,
  request: {
    requirements: '',
    location: '',
    contact: ''
  },
  other_msg: ''
})
const petImageFile = ref(null)
const userList = ref([])

const openDetail = (row) => {
  currentRow.value = row
  showDetail.value = true
}

// 打开新增弹窗
const handleAddAdoption = async () => {
  resetAddForm()
  // 获取用户列表
  try {
    const { getUserListAPI } = await import('../../api/user')
    const response = await getUserListAPI({ page: 1, limit: 100 })
    if (response && response.data) {
      userList.value = response.data.users
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
  showAddDialog.value = true
}

// 重置表单
const resetAddForm = () => {
  addForm.value = {
    userId: null,
    petInfo: {
      nickName: '',
      sex: true,
      breed: '',
      type: '',
      birthday: '',
      image: '',
      vaccineStatus: 'unvaccinated',
      nature: [],
      hobby: [],
      other_msg: ''
    },
    fee: 'free',
    money: null,
    request: {
      requirements: '',
      location: '',
      contact: ''
    },
    other_msg: ''
  }
  petImageFile.value = null
}

// 取消新增
const handleCancelAdd = () => {
  showAddDialog.value = false
  resetAddForm()
}

// 上传宠物图片
const handlePetImageUpload = async (options) => {
  const { file } = options
  const result = await uploadAdoptionImage(file)
  if (result.success) {
    addForm.value.petInfo.image = formatImageUrl(result.url)
    return result.url
  }
  return null
}

// 保存新增
const handleSaveAdd = async () => {
  // 表单验证
  if (!addForm.value.userId) {
    ElMessage.warning('请选择发布用户')
    return
  }
  if (!addForm.value.petInfo.nickName) {
    ElMessage.warning('请输入宠物昵称')
    return
  }
  if (!addForm.value.petInfo.breed) {
    ElMessage.warning('请输入宠物品种')
    return
  }
  if (!addForm.value.petInfo.type) {
    ElMessage.warning('请输入宠物类型')
    return
  }
  if (!addForm.value.petInfo.birthday) {
    ElMessage.warning('请选择宠物生日')
    return
  }
  if (!addForm.value.petInfo.image) {
    ElMessage.warning('请上传宠物图片')
    return
  }
  if (addForm.value.fee === 'paid' && (!addForm.value.money || addForm.value.money <= 0)) {
    ElMessage.warning('有偿领养需要填写金额')
    return
  }

  const result = await createAdoption(addForm.value)
  if (result.success) {
    showAddDialog.value = false
    resetAddForm()
  }
}

// 映射表
const feeMap = {
  free:       { label: '无偿', type: 'success' },
  paid:       { label: '有偿', type: 'warning' },
  negotiable: { label: '面议', type: 'info' },
}

const statusMap = {
  pending:  { label: '待领养', type: 'primary' },
  approved: { label: '已领养', type: 'success' },
  rejected: { label: '已取消', type: 'danger' },
}

const vaccineMap = {
  unvaccinated: '未接种',
  one_dose:     '已接种1剂',
  two_doses:    '已接种2剂',
  three_doses:  '已接种3剂',
  completed:    '全程完成',
}

const calculateAge = (birthday) => {
  if (!birthday) return '-'
  const birth = new Date(birthday)
  const now = new Date()
  const ms = now - birth
  const years = Math.floor(ms / (1000 * 60 * 60 * 24 * 365))
  const months = Math.floor((ms % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))
  if (years > 0) return `${years}岁${months > 0 ? months + '月' : ''}`
  return `${months}个月`
}

onMounted(() => fetchAdoptionList())
</script>

<template>
  <PageContainer title="领养管理">
    <template #extra>
      <div class="header-actions">
        <!-- 搜索 -->
        <el-input
          v-model="searchText"
          placeholder="搜索宠物名称..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
        </el-input>

        <!-- 状态筛选 -->
        <el-select
          v-model="filterStatus"
          placeholder="领养状态"
          class="filter-select"
          clearable
          @change="handleSearch"
        >
          <el-option label="待领养" value="pending" />
          <el-option label="已领养" value="approved" />
          <el-option label="已取消" value="rejected" />
        </el-select>

        <!-- 类型筛选 -->
        <el-select
          v-model="filterType"
          placeholder="宠物类型"
          class="filter-select"
          clearable
          @change="handleSearch"
        >
          <el-option label="猫" value="猫" />
          <el-option label="狗" value="狗" />
          <el-option label="兔子" value="兔子" />
          <el-option label="其他" value="其他" />
        </el-select>

        <!-- 重置 -->
        <el-button type="info" class="reset-button" @click="handleReset">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
        
        <!-- 新增 -->
        <el-button type="primary" class="add-button" @click="handleAddAdoption">
          <el-icon><Plus /></el-icon>新增领养
        </el-button>
      </div>
    </template>

    <template #content>
      <div class="adopt-content">

        <!-- 批量操作栏 -->
        <div v-if="showBatchActions" class="batch-actions">
          <div class="batch-info">
            <span>已选中 <strong>{{ selectedRows.length }}</strong> 条记录</span>
          </div>
          <div class="batch-buttons">
            <el-button size="small" @click="handleClearSelection">取消选择</el-button>
            <el-button size="small" type="danger" @click="handleBatchDelete">
              <el-icon color="red"><Delete /></el-icon>批量删除
            </el-button>
          </div>
        </div>

        <!-- 统计卡片 -->
        <div class="stats-row">
          <div class="stat-card pending">
            <div class="stat-num">{{ adoptionData.filter(i => i.status === 'pending').length }}</div>
            <div class="stat-label">待领养</div>
          </div>
          <div class="stat-card approved">
            <div class="stat-num">{{ adoptionData.filter(i => i.status === 'approved').length }}</div>
            <div class="stat-label">已领养</div>
          </div>
          <div class="stat-card rejected">
            <div class="stat-num">{{ adoptionData.filter(i => i.status === 'rejected').length }}</div>
            <div class="stat-label">已取消</div>
          </div>
          <div class="stat-card total">
            <div class="stat-num">{{ pagination.totalItems }}</div>
            <div class="stat-label">共计</div>
          </div>
        </div>

        <div class="table-container">
          <el-table
            :data="adoptionData"
            v-loading="loading"
            style="width: 100%"
            stripe
            :border="false"
            @selection-change="handleSelectionChange"
            height="460"
          >
            <!-- 选择 -->
            <el-table-column type="selection" width="50" fixed />

            <!-- 宠物信息 -->
            <el-table-column label="宠物信息" min-width="200" fixed>
              <template #default="{ row }">
                <div class="pet-info-cell">
                  <el-image
                    :src="row.petImage"
                    :preview-src-list="[row.petImage]"
                    class="pet-avatar"
                    fit="cover"
                    hide-on-click-modal
                  >
                    <template #error>
                      <div class="image-error">🐾</div>
                    </template>
                  </el-image>
                  <div class="pet-details">
                    <div class="pet-name">{{ row.petName }}</div>
                    <div class="pet-meta">
                      <el-tag size="small" effect="plain" type="info">{{ row.petType }}</el-tag>
                      <span class="pet-breed">{{ row.petBreed }}</span>
                    </div>
                    <div class="pet-age">
                      <span :class="row.petSex ? 'sex-male' : 'sex-female'">
                        {{ row.petSex ? '♂' : '♀' }}
                      </span>
                      {{ calculateAge(row.petBirthday) }}
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 发布人 -->
            <el-table-column label="发布人" width="120" align="center">
              <template #default="{ row }">
                <div class="publisher-cell">
                  <el-avatar :src="row.publisherAvatar" :size="30" />
                  <span class="publisher-name">{{ row.publisherName }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 费用 -->
            <el-table-column label="费用类型" width="110" align="center">
              <template #default="{ row }">
                <div>
                  <el-tag :type="feeMap[row.fee]?.type" effect="light" round size="small">
                    {{ feeMap[row.fee]?.label }}
                  </el-tag>
                  <div v-if="row.fee === 'paid' && row.money" class="money-text">
                    ¥{{ row.money }}
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 当前状态 -->
            <el-table-column label="当前状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="statusMap[row.status]?.type" effect="light" round size="small">
                  {{ statusMap[row.status]?.label }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 状态变更 -->
            <el-table-column label="审批操作" width="160" align="center">
              <template #default="{ row }">
                <el-select
                  :model-value="row.status"
                  size="small"
                  class="status-select"
                  @change="(val) => handleStatusChange(row, val)"
                >
                  <el-option label="待领养" value="pending" />
                  <el-option label="✅ 已领养" value="approved" />
                  <el-option label="❌ 已取消" value="rejected" />
                </el-select>
              </template>
            </el-table-column>

            <!-- 地点 -->
            <el-table-column label="所在地点" width="140" align="center">
              <template #default="{ row }">
                <span class="location-text">{{ row.location }}</span>
              </template>
            </el-table-column>

            <!-- 联系方式 -->
            <el-table-column label="联系方式" width="140" align="center">
              <template #default="{ row }">
                <span class="contact-text">{{ row.contact }}</span>
              </template>
            </el-table-column>

            <!-- 发布时间 -->
            <el-table-column prop="create_time" label="发布时间" width="180" align="center" />

            <!-- 操作 -->
            <el-table-column label="操作" width="100" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button
                    size="small"
                    plain
                    title="查看详情"
                    @click="openDetail(row)"
                  >详情</el-button>
                  <el-button
                    size="small"
                    type="danger"
                    plain
                    @click="handleDelete(row)"
                    title="删除"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
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
          title="领养信息详情"
          width="560"
          align-center
        >
          <div v-if="currentRow" class="detail-body">
            <!-- 宠物图片 + 名称 -->
            <div class="detail-pet-header">
              <el-image
                :src="currentRow.petImage"
                class="detail-pet-img"
                fit="cover"
              />
              <div>
                <h3 class="detail-pet-name">{{ currentRow.petName }}</h3>
                <div class="detail-pet-tags">
                  <el-tag size="small" type="info">{{ currentRow.petType }}</el-tag>
                  <el-tag size="small" effect="plain">{{ currentRow.petBreed }}</el-tag>
                  <el-tag
                    size="small"
                    :type="currentRow.petSex ? 'primary' : 'danger'"
                    effect="plain"
                  >
                    {{ currentRow.petSex ? '♂ 雄' : '♀ 雌' }}
                  </el-tag>
                </div>
              </div>
            </div>

            <el-divider />

            <!-- 信息网格 -->
            <el-descriptions :column="2" border size="small">
              <el-descriptions-item label="年龄">
                {{ calculateAge(currentRow.petBirthday) }}
              </el-descriptions-item>
              <el-descriptions-item label="疫苗">
                {{ vaccineMap[currentRow.petVaccine] || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="费用">
                <el-tag :type="feeMap[currentRow.fee]?.type" effect="light" size="small">
                  {{ feeMap[currentRow.fee]?.label }}
                  <template v-if="currentRow.fee === 'paid' && currentRow.money">
                    · ¥{{ currentRow.money }}
                  </template>
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="statusMap[currentRow.status]?.type" effect="light" size="small">
                  {{ statusMap[currentRow.status]?.label }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="发布人">
                {{ currentRow.publisherName }}
              </el-descriptions-item>
              <el-descriptions-item label="发布时间">
                {{ currentRow.create_time }}
              </el-descriptions-item>
              <el-descriptions-item label="所在地点" :span="2">
                {{ currentRow.location }}
              </el-descriptions-item>
              <el-descriptions-item label="联系方式" :span="2">
                {{ currentRow.contact }}
              </el-descriptions-item>
              <el-descriptions-item
                v-if="currentRow.request?.requirements"
                label="领养要求"
                :span="2"
              >
                {{ currentRow.request.requirements }}
              </el-descriptions-item>
              <el-descriptions-item
                v-if="currentRow.other_msg"
                label="发布说明"
                :span="2"
              >
                {{ currentRow.other_msg }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="showDetail = false">关闭</el-button>
              <el-button
                type="success"
                v-if="currentRow?.status === 'pending'"
                @click="handleStatusChange(currentRow, 'approved'); showDetail = false"
              >
                ✅ 批准领养
              </el-button>
              <el-button
                type="danger"
                v-if="currentRow?.status === 'pending'"
                @click="handleStatusChange(currentRow, 'rejected'); showDetail = false"
              >
                ❌ 拒绝领养
              </el-button>
            </div>
          </template>
        </el-dialog>

        <!-- 新增领养弹窗 -->
        <el-dialog
          v-model="showAddDialog"
          title="新增领养信息"
          width="700"
          align-center
          @close="handleCancelAdd"
        >
          <el-form :model="addForm" label-width="100px">
            <!-- 发布用户 -->
            <el-form-item label="发布用户" required>
              <el-select 
                v-model="addForm.userId" 
                placeholder="请选择发布用户" 
                style="width: 100%"
                filterable
              >
                <el-option 
                  v-for="user in userList" 
                  :key="user.id" 
                  :label="user.username" 
                  :value="user.id"
                />
              </el-select>
            </el-form-item>

            <el-divider>宠物信息</el-divider>

            <!-- 宠物昵称 -->
            <el-form-item label="宠物昵称" required>
              <el-input v-model="addForm.petInfo.nickName" placeholder="请输入宠物昵称" />
            </el-form-item>

            <!-- 宠物性别 -->
            <el-form-item label="性别" required>
              <el-radio-group v-model="addForm.petInfo.sex">
                <el-radio :label="true">公 ♂</el-radio>
                <el-radio :label="false">母 ♀</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 宠物类型 -->
            <el-form-item label="宠物类型" required>
              <el-select v-model="addForm.petInfo.type" placeholder="请选择宠物类型" style="width: 100%">
                <el-option label="猫" value="猫" />
                <el-option label="狗" value="狗" />
                <el-option label="兔子" value="兔子" />
                <el-option label="其他" value="其他" />
              </el-select>
            </el-form-item>

            <!-- 宠物品种 -->
            <el-form-item label="品种" required>
              <el-input v-model="addForm.petInfo.breed" placeholder="请输入品种，如：金毛、布偶猫等" />
            </el-form-item>

            <!-- 生日 -->
            <el-form-item label="生日" required>
              <el-date-picker
                v-model="addForm.petInfo.birthday"
                type="date"
                placeholder="选择生日"
                style="width: 100%"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>

            <!-- 疫苗状态 -->
            <el-form-item label="疫苗状态">
              <el-select v-model="addForm.petInfo.vaccineStatus" placeholder="请选择疫苗状态" style="width: 100%">
                <el-option label="未接种" value="unvaccinated" />
                <el-option label="已接种1剂" value="one_dose" />
                <el-option label="已接种2剂" value="two_doses" />
                <el-option label="已接种3剂" value="three_doses" />
                <el-option label="全程完成" value="completed" />
              </el-select>
            </el-form-item>

            <!-- 宠物图片 -->
            <el-form-item label="宠物图片" required>
              <el-upload
                class="avatar-uploader"
                action="#"
                :http-request="handlePetImageUpload"
                :show-file-list="false"
                accept="image/*"
              >
                <img v-if="addForm.petInfo.image" :src="addForm.petInfo.image" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>

            <!-- 性格 -->
            <el-form-item label="性格">
              <el-input v-model="addForm.petInfo.nature" placeholder="如：温顺、活泼、胆小等" />
            </el-form-item>

            <!-- 爱好 -->
            <el-form-item label="爱好">
              <el-input v-model="addForm.petInfo.hobby" placeholder="如：玩球、睡觉、吃罐头" />
            </el-form-item>

            <el-divider>领养信息</el-divider>

            <!-- 费用类型 -->
            <el-form-item label="费用类型" required>
              <el-radio-group v-model="addForm.fee">
                <el-radio label="free">无偿</el-radio>
                <el-radio label="paid">有偿</el-radio>
                <el-radio label="negotiable">面议</el-radio>
              </el-radio-group>
            </el-form-item>

            <!-- 金额（有偿时显示） -->
            <el-form-item label="金额" v-if="addForm.fee === 'paid'">
              <el-input-number v-model="addForm.money" :min="1" placeholder="请输入金额" />
            </el-form-item>

            <!-- 所在地点 -->
            <el-form-item label="所在地点">
              <el-input v-model="addForm.request.location" placeholder="请输入所在地点" />
            </el-form-item>

            <!-- 联系方式 -->
            <el-form-item label="联系方式">
              <el-input v-model="addForm.request.contact" placeholder="请输入联系方式" />
            </el-form-item>

            <!-- 领养要求 -->
            <el-form-item label="领养要求">
              <el-input 
                v-model="addForm.request.requirements" 
                type="textarea" 
                :rows="3"
                placeholder="请输入领养要求"
              />
            </el-form-item>

            <!-- 其他说明 -->
            <el-form-item label="其他说明">
              <el-input 
                v-model="addForm.other_msg" 
                type="textarea" 
                :rows="2"
                placeholder="请输入其他说明"
              />
            </el-form-item>
          </el-form>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="handleCancelAdd">取消</el-button>
              <el-button type="primary" @click="handleSaveAdd" :loading="loading">
                确认发布
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </template>
  </PageContainer>
</template>

<style scoped lang="scss">
/* ── 头部操作区 ─────────────────────────────────────── */
.header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-input {
  width: 220px;
  height: 40px;

  :deep(.el-input__wrapper) {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    box-shadow: none;
    padding: 0 12px;
    height: 40px;
    transition: all 0.2s ease;

    &:hover { border-color: #d0d7de; }
    &.is-focus {
      border-color: #0969da;
      background-color: #fff;
      box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
    }
  }

  :deep(.el-input__inner) {
    color: #24292f;
    font-size: 14px;
    height: 100%;
    &::placeholder { color: #656d76; }
  }
}

.search-icon { color: #656d76; font-size: 16px; }

.filter-select {
  width: 120px;
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

/* ── 统计卡片 ─────────────────────────────────────── */
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

  .stat-num {
    font-size: 26px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: #9ca3af;
  }

  &.pending  { .stat-num { color: #2563EB; } border-top: 3px solid #2563EB; }
  &.approved { .stat-num { color: #16a34a; } border-top: 3px solid #16a34a; }
  &.rejected { .stat-num { color: #ef4444; } border-top: 3px solid #ef4444; }
  &.total    { .stat-num { color: #8470FF; } border-top: 3px solid #8470FF; }
}

/* ── 批量操作栏 ─────────────────────────────────────── */
.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.batch-info {
  color: #495057;
  font-size: 14px;
  strong { color: #8470FF; font-weight: 600; }
}

.batch-buttons {
  display: flex;
  gap: 8px;
  .el-button { border-radius: 6px; }
}

/* ── 表格容器 ─────────────────────────────────────── */
.table-container {
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

/* ── 宠物信息单元格 ─────────────────────────────────── */
.pet-info-cell {
  display: flex;
  align-items: center;
  gap: 10px;

  .pet-avatar {
    width: 52px;
    height: 52px;
    border-radius: 8px;
    flex-shrink: 0;
    object-fit: cover;
  }

  :deep(.image-error) {
    width: 52px;
    height: 52px;
    background: #f5f5f5;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }
}

.pet-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  .pet-name  { font-size: 14px; font-weight: 600; color: #1f2937; }
  .pet-meta  { display: flex; align-items: center; gap: 4px; }
  .pet-breed { font-size: 12px; color: #9ca3af; }
  .pet-age   { font-size: 12px; color: #6b7280; }
}

.sex-male   { color: #3b82f6; font-weight: 700; }
.sex-female { color: #ec4899; font-weight: 700; }

/* ── 发布人 ─────────────────────────────────────────── */
.publisher-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;

  .publisher-name { font-size: 12px; color: #6b7280; }
}

/* ── 费用 / 状态 ─────────────────────────────────────── */
.money-text {
  font-size: 12px;
  color: #f97316;
  margin-top: 4px;
  font-weight: 600;
}

.status-select {
  width: 140px;
  :deep(.el-input__wrapper) {
    border-radius: 6px;
    box-shadow: none;
    border: 1px solid #e5e7eb;
    &:hover { border-color: #8470FF; }
  }
}

/* ── 地点 / 联系 ─────────────────────────────────────── */
.location-text,
.contact-text {
  font-size: 12px;
  color: #6b7280;
  word-break: break-all;
}

/* ── 操作按钮 ─────────────────────────────────────────── */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

/* ── 表格样式覆盖 ─────────────────────────────────────── */
:deep(.el-table) {
  border: none;

  .el-table__inner-wrapper::before,
  .el-table__inner-wrapper::after { display: none; }

  th, td { border: none !important; border-right: none !important; border-bottom: none !important; }

  .el-table__fixed,
  .el-table__fixed-right { border: none !important; }
}

:deep(.el-table .el-button) {
  border-radius: 8px;
  transition: all 0.2s ease;
  &.el-button--small { border-radius: 6px; }
}

:deep(.el-table .el-checkbox) {
  .el-checkbox__input.is-checked .el-checkbox__inner { background-color: #8470FF; border-color: #8470FF; border-radius: 5px; }
  .el-checkbox__input.is-indeterminate .el-checkbox__inner { background-color: #8470FF; border-color: #8470FF; }
  .el-checkbox__inner:hover { border-color: #8470FF; }
}

:deep(.el-table .el-table__header-wrapper .el-checkbox) {
  .el-checkbox__input.is-checked .el-checkbox__inner { background-color: #8470FF; border-color: #8470FF; border-radius: 5px; }
  .el-checkbox__input.is-indeterminate .el-checkbox__inner { background-color: #8470FF; border-color: #8470FF; border-radius: 10px; }
}

:deep(.el-pagination) {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

/* ── 详情弹窗 ─────────────────────────────────────────── */
.detail-pet-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 8px;

  .detail-pet-img {
    width: 80px;
    height: 80px;
    border-radius: 12px;
    object-fit: cover;
    flex-shrink: 0;
  }

  .detail-pet-name { font-size: 20px; font-weight: 700; color: #1f2937; margin: 0 0 8px; }
  .detail-pet-tags { display: flex; gap: 6px; flex-wrap: wrap; }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 768px) {
  .header-actions { flex-direction: column; align-items: stretch; gap: 8px; }
  .search-input, .filter-select { width: 100%; }
  .stats-row { flex-wrap: wrap; }
  .stat-card { min-width: calc(50% - 6px); }
}

/* 图片上传样式 */
.avatar-uploader {
  :deep(.el-upload) {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
    
    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.avatar {
  width: 120px;
  height: 120px;
  display: block;
  object-fit: cover;
}
</style>
