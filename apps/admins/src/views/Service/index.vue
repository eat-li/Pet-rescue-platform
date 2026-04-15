<script setup>
import PageContainer from '../../components/Common/PageContainer.vue'
import Mypagination from '../../components/Common/Mypagination.vue'
import { Plus, Search, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { ref, onMounted, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { useServiceData } from '../../hooks/useServiceData'

const {
  serviceData,
  pagination,
  loading,
  selectedRows,
  searchText,
  filterType,
  filterStatus,
  serviceTypeMap,
  showBatchActions,
  fetchServiceList,
  fetchServiceDetail,
  handleCreateService,
  handleUpdateService,
  handleDelete,
  handleBatchDelete,
  handleStatusChange,
  handleSelectionChange,
  handleClearSelection,
  handleSearch,
  handleReset,
  handlePageChange,
  uploadServiceImage
} = useServiceData()

// 弹窗相关
const showDialog = ref(false)
const dialogTitle = ref('新增服务')
const isEditing = ref(false)
const editingId = ref(null)
const dialogLoading = ref(false)

// 表单数据
const serviceForm = reactive({
  name: '',
  type: '',
  price: null,
  weight: null,
  content: '',
  image: ''
})

// 表单引用
const formRef = ref(null)

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入服务名称', trigger: 'blur' },
    { max: 100, message: '服务名称长度不能超过100个字符', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择服务类型', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入服务价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于等于0', trigger: 'blur' }
  ],
  weight: [
    { required: true, message: '请输入体重限制', trigger: 'blur' },
    { type: 'number', min: 0, message: '体重必须大于等于0', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入服务内容', trigger: 'blur' }
  ]
}

// 新增服务
const handleAdd = () => {
  dialogTitle.value = '新增服务'
  isEditing.value = false
  editingId.value = null
  resetForm()
  showDialog.value = true
}

// 编辑服务
const handleEdit = async (row) => {
  dialogTitle.value = '编辑服务'
  isEditing.value = true
  editingId.value = row.id
  dialogLoading.value = true
  showDialog.value = true
  
  try {
    const detail = await fetchServiceDetail(row.id)
    if (detail) {
      serviceForm.name = detail.name
      serviceForm.type = detail.type
      serviceForm.price = parseFloat(detail.price)
      serviceForm.weight = detail.weight
      serviceForm.content = detail.content
      serviceForm.image = detail.image || ''
    }
  } finally {
    dialogLoading.value = false
  }
}

// 保存服务
const handleSave = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      let success = false
      
      if (isEditing.value) {
        success = await handleUpdateService(editingId.value, serviceForm)
      } else {
        success = await handleCreateService(serviceForm)
      }
      
      if (success) {
        showDialog.value = false
        resetForm()
      }
    }
  })
}

// 重置表单
const resetForm = () => {
  serviceForm.name = ''
  serviceForm.type = ''
  serviceForm.price = null
  serviceForm.weight = null
  serviceForm.content = ''
  serviceForm.image = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 上传服务图片
const handleImageUpload = async (options) => {
  const { file } = options
  const result = await uploadServiceImage(file)
  if (result.success) {
    serviceForm.image = result.url
    return result.url
  }
  return null
}

// 取消操作
const handleCancel = () => {
  showDialog.value = false
  resetForm()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchServiceList()
})
</script>

<template>
  <PageContainer title="服务管理">
    <template #extra>
      <div class="header-actions">
        <el-input
          v-model="searchText"
          placeholder="搜索服务名称..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="filterType"
          placeholder="服务类型"
          class="filter-select"
          clearable
          @change="handleSearch"
        >
          <el-option label="基础护理" value="basic_care" />
          <el-option label="美容造型" value="beauty_styling" />
          <el-option label="健康医疗" value="health_medical" />
          <el-option label="训练服务" value="training_service" />
          <el-option label="特色体验" value="special_experience" />
        </el-select>

        <el-select
          v-model="filterStatus"
          placeholder="上架状态"
          class="filter-select"
          clearable
          @change="handleSearch"
        >
          <el-option label="已上架" value="true" />
          <el-option label="已下架" value="false" />
        </el-select>

        <el-button type="info" class="reset-button" @click="handleReset">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
        
        <el-button type="primary" class="add-button" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增服务
        </el-button>
      </div>
    </template>

    <template #content>
      <div class="service-content">
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

        <div class="table-container">
          <el-table
            :data="serviceData"
            v-loading="loading"
            style="width: 100%"
            stripe
            :border="false"
            @selection-change="handleSelectionChange"
            height="500"
          >
            <!-- 选择 -->
            <el-table-column type="selection" width="50" fixed />

            <!-- 服务图片 -->
            <el-table-column label="服务图片" width="100" align="center">
              <template #default="{ row }">
                <el-image
                  v-if="row.image"
                  :src="row.image"
                  :preview-src-list="[row.image]"
                  fit="cover"
                  style="width: 60px; height: 60px; border-radius: 8px;"
                />
                <div v-else class="no-image">无图片</div>
              </template>
            </el-table-column>

            <!-- 服务名称 -->
            <el-table-column prop="name" label="服务名称" width="160" show-overflow-tooltip />

            <!-- 服务类型 -->
            <el-table-column label="服务类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag type="primary" effect="light" size="small">
                  {{ serviceTypeMap[row.type] }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 价格 -->
            <el-table-column label="价格" width="100" align="center">
              <template #default="{ row }">
                <span class="price-text">¥{{ row.price }}</span>
              </template>
            </el-table-column>

            <!-- 体重限制 -->
            <el-table-column label="体重限制" width="100" align="center">
              <template #default="{ row }">
                <span>{{ row.weight }}kg</span>
              </template>
            </el-table-column>

            <!-- 服务内容 -->
            <el-table-column prop="content" label="服务内容" min-width="200" show-overflow-tooltip />

            <!-- 上架状态 -->
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-switch
                  v-model="row.status"
                  class="ml-2"
                  style="--el-switch-on-color: #8470FF; --el-switch-off-color: #ff4949"
                  @change="handleStatusChange(row)"
                />
              </template>
            </el-table-column>

            <!-- 创建时间 -->
            <el-table-column prop="createdAt" label="创建时间" width="180" align="center" />

            <!-- 操作 -->
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button size="small" plain @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button size="small" type="danger" plain @click="handleDelete(row)">
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

        <!-- 弹窗 -->
        <el-dialog
          v-model="showDialog"
          :title="dialogTitle"
          width="600"
          align-center
          @close="handleCancel"
          destroy-on-close
        >
          <el-form
            ref="formRef"
            :model="serviceForm"
            :rules="rules"
            label-width="100px"
            v-loading="dialogLoading"
          >
            <el-form-item label="服务名称" prop="name">
              <el-input
                v-model="serviceForm.name"
                placeholder="请输入服务名称"
                maxlength="100"
                show-word-limit
              />
            </el-form-item>

            <el-form-item label="服务类型" prop="type">
              <el-select v-model="serviceForm.type" placeholder="请选择服务类型" style="width: 100%">
                <el-option label="基础护理" value="basic_care" />
                <el-option label="美容造型" value="beauty_styling" />
                <el-option label="健康医疗" value="health_medical" />
                <el-option label="训练服务" value="training_service" />
                <el-option label="特色体验" value="special_experience" />
              </el-select>
            </el-form-item>

            <el-form-item label="价格" prop="price">
              <el-input-number
                v-model="serviceForm.price"
                :min="0"
                :precision="2"
                placeholder="请输入价格"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="体重限制" prop="weight">
              <el-input-number
                v-model="serviceForm.weight"
                :min="0"
                placeholder="请输入体重限制(kg)"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="服务内容" prop="content">
              <el-input
                v-model="serviceForm.content"
                type="textarea"
                :rows="4"
                placeholder="请输入服务内容描述"
              />
            </el-form-item>

            <el-form-item label="服务图片">
              <el-upload
                class="avatar-uploader"
                action="#"
                :http-request="handleImageUpload"
                :show-file-list="false"
                accept="image/*"
              >
                <img v-if="serviceForm.image" :src="serviceForm.image" class="avatar" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
            </el-form-item>
          </el-form>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="handleCancel">取消</el-button>
              <el-button type="primary" @click="handleSave" :loading="loading">
                {{ isEditing ? '保存修改' : '确认添加' }}
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </template>
  </PageContainer>
</template>

<style scoped lang="scss">
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
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
}

.search-icon { color: #656d76; font-size: 16px; }

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

.add-button {
  background: #CEDDF6;
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

.table-container {
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

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

.price-text {
  color: #f97316;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

:deep(.el-table) {
  border: none;
  .el-table__inner-wrapper::before,
  .el-table__inner-wrapper::after { display: none; }
  th, td { border: none !important; }
}

:deep(.el-table .el-button) {
  border-radius: 8px;
  transition: all 0.2s ease;
  &.el-button--small { border-radius: 6px; }
}

:deep(.el-pagination) {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.no-image {
  width: 60px;
  height: 60px;
  background: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 12px;
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
  width: 178px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.avatar {
  width: 178px;
  height: 120px;
  display: block;
  object-fit: cover;
}
</style>
