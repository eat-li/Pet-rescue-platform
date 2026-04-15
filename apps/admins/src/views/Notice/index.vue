<script setup>
import PageContainer from '../../components/Common/PageContainer.vue'
import { Plus, Search, Edit, Delete, Refresh, Upload } from '@element-plus/icons-vue'
import { ref, onMounted, reactive, nextTick } from 'vue'
import { useNoticeData } from '../../hooks/useNoticeData'
import Mypagination from '@/components/Common/Mypagination.vue'
import { formatImageUrl } from '@/utils/imgformat.js'

const {
  noticeData,
  pagination,
  loading,
  selectedRows,
  searchText,
  titleSearchText,
  showBatchActions,
  fetchNoticeList,
  handleStatusChange,
  handleDelete,
  handleBatchDelete,
  handleSelectionChange,
  handleClearSelection,
  handleSearch,
  handleReset,
  handlePageChange,
  handleCreateNotice,
  fetchNoticeDetail,
  handleUpdateNotice,
  uploadNoticeImage
} = useNoticeData()

// 弹窗相关
const showDialog = ref(false)
const dialogTitle = ref('新增公告')
const isEditing = ref(false)
const editingId = ref(null)
const dialogLoading = ref(false)

// 表单数据
const noticeForm = reactive({
  title: '',
  content: '',
  cover: ''
})

// 表单引用
const formRef = ref(null)

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入公告标题', trigger: 'blur' },
    { max: 100, message: '标题长度不能超过100个字符', trigger: 'blur' }
  ],
  content: [
    { required: true, message: '请输入公告内容', trigger: 'blur' }
  ]
}

// 新增公告
const handleAdd = () => {
  dialogTitle.value = '新增公告'
  isEditing.value = false
  editingId.value = null
  resetForm()
  showDialog.value = true
}

// 编辑公告
const handleEdit = async (row) => {
  dialogTitle.value = '编辑公告'
  isEditing.value = true
  editingId.value = row.id
  dialogLoading.value = true
  showDialog.value = true
  
  try {
    const detail = await fetchNoticeDetail(row.id)
    if (detail) {
      noticeForm.title = detail.title
      noticeForm.content = detail.content
      noticeForm.cover = detail.cover || ''
    }
  } finally {
    dialogLoading.value = false
  }
}

// 保存公告
const handleSaveNotice = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      let success = false
      
      if (isEditing.value) {
        // 编辑模式
        success = await handleUpdateNotice(editingId.value, noticeForm)
      } else {
        // 新增模式
        success = await handleCreateNotice(noticeForm)
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
  noticeForm.title = ''
  noticeForm.content = ''
  noticeForm.cover = ''
  if (formRef.value) {
    formRef.value.clearValidate()
  }
}

// 取消操作
const handleCancel = () => {
  showDialog.value = false
  resetForm()
}

// 上传封面图片
const handleCoverUpload = async (options) => {
  const { file } = options
  const result = await uploadNoticeImage(file)
  if (result.success) {
    noticeForm.cover = result.url
    return result.url
  }
  return null
}

// 组件挂载时获取数据
onMounted(() => {
  fetchNoticeList()
})
</script>

<template>
  <PageContainer title="公告管理">
    <template #extra>
      <!-- 搜索和按钮区域 -->
      <div class="header-actions">
        <div class="search-container">
          <el-input v-model="titleSearchText" placeholder="搜索公告标题或内容..." class="search-input"
            @keyup.enter="handleSearch">
            <template #prefix>
              <el-icon class="search-icon">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
        <el-button type="info" class="reset-button" @click="handleReset">
          <el-icon>
            <Refresh />
          </el-icon>重置
        </el-button>
        <el-button type="primary" class="add-button" @click="handleAdd">
          <el-icon>
            <Plus />
          </el-icon>新增公告
        </el-button>
      </div>
    </template>

    <template #content>
      <div class="notice-content">
        <!-- 批量操作栏 -->
        <div v-if="showBatchActions" class="batch-actions">
          <div class="batch-info">
            <span>已选中 <strong>{{ selectedRows.length }}</strong> 条记录</span>
          </div>
          <div class="batch-buttons">
            <el-button size="small" @click="handleClearSelection">取消选择</el-button>
            <el-button size="small" type="danger" @click="handleBatchDelete">
              <el-icon color="red">
                <Delete />
              </el-icon>
              批量删除
            </el-button>
          </div>
        </div>

        <div class="table-container">
          <el-table :data="noticeData" v-loading="loading" style="width: 100%" stripe :border="false"
            @selection-change="handleSelectionChange" height="500" :max-height="600">

            <!-- 选择 -->
            <el-table-column type="selection" width="50" fixed />

            <!-- 公告标题 -->
            <el-table-column prop="title" label="公告标题" width="200" show-overflow-tooltip />

            <!-- 公告内容 -->
            <el-table-column prop="content" label="公告内容" width="300" show-overflow-tooltip />

            <!-- 封面图片 -->
            <el-table-column label="封面图片" width="120" align="center">
              <template #default="{ row }">
                <el-image v-if="row.cover" :src="row.cover" :preview-src-list="[row.cover]" fit="cover"
                  style="width: 60px; height: 40px; border-radius: 4px;" />
                <span v-else class="no-image">无图片</span>
              </template>
            </el-table-column>

            <!-- 公告状态 - 修改为switch组件 -->
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-switch 
                  v-model="row.status" 
                  class="ml-2"
                  style="--el-switch-on-color: #8470FF; --el-switch-off-color: #ff4949" 
                  :active-value="true"
                  :inactive-value="false" 
                  @change="handleStatusChange(row)" 
                />
              </template>
            </el-table-column>

            <!-- 管理员ID -->
            <el-table-column prop="adminId" label="管理员ID" width="100" align="center" />

            <!-- 创建时间 -->
            <el-table-column label="创建时间" width="180" align="center">
              <template #default="{ row }">
                {{ row.createdAt }}
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="{ row }">
                <div style="display: flex; gap: 4px; justify-content: center;">
                  <el-button size="small" plain @click="handleEdit(row)">
                    <el-icon>
                      <Edit />
                    </el-icon>
                  </el-button>
                  <el-button size="small" type="danger" plain @click="handleDelete(row)">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页组件 -->
          <Mypagination :current-page="pagination.currentPage" :page-size="pagination.pageSize"
            :total-items="pagination.totalItems" @page-change="handlePageChange" />

          <!-- 弹窗 -->
          <el-dialog v-model="showDialog" :title="dialogTitle" width="600" align-center @close="handleCancel" destroy-on-close>
            <el-form ref="formRef" :model="noticeForm" :rules="rules" label-width="80px" v-loading="dialogLoading">
              <el-form-item label="公告标题" prop="title">
                <el-input v-model="noticeForm.title" placeholder="请输入公告标题（最多100个字符）" maxlength="100" show-word-limit />
              </el-form-item>
              <el-form-item label="公告内容" prop="content">
                <el-input v-model="noticeForm.content" type="textarea" placeholder="请输入公告内容" :rows="6" />
              </el-form-item>
              <el-form-item label="封面图片">
                <el-upload
                  class="avatar-uploader"
                  action="#"
                  :http-request="handleCoverUpload"
                  :show-file-list="false"
                  accept="image/*"
                >
                  <img v-if="noticeForm.cover" :src="noticeForm.cover" class="avatar" />
                  <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                </el-upload>
              </el-form-item>
            </el-form>

            <template #footer>
              <div class="dialog-footer">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleSaveNotice" :loading="loading">
                  {{ isEditing ? '保存修改' : '确认添加' }}
                </el-button>
              </div>
            </template>
          </el-dialog>

        </div>
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

.search-container {
  position: relative;
}

.search-input {
  width: 280px;
  height: 40px;

  :deep(.el-input__wrapper) {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    box-shadow: none;
    padding: 0 12px;
    height: 40px;
    transition: all 0.2s ease;

    &:hover {
      border-color: #d0d7de;
    }

    &.is-focus {
      border-color: #0969da;
      background-color: #ffffff;
      box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
    }
  }

  :deep(.el-input__inner) {
    color: #24292f;
    font-size: 14px;
    height: 100%;
    line-height: 40px;

    &::placeholder {
      color: #656d76;
      font-weight: 400;
    }
  }
}

.search-icon {
  color: #656d76;
  font-size: 16px;
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
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #1F2937;
    border-color: #d0d7de;
    color: #fff;
  }

  &:active {
    background: linear-gradient(180deg, #e5e7eb 0%, #d1d5db 100%);
    border-color: #d0d7de;
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
    border-color: #0969da;
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
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: #1F2937;
    border-color: #d0d7de;
    color: #fff;
  }

  &:active {
    background: linear-gradient(180deg, #e5e7eb 0%, #d1d5db 100%);
    border-color: #d0d7de;
  }

  &:focus {
    box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
    border-color: #0969da;
  }
}

.notice-content {}

.no-image {
  color: #999;
  font-size: 12px;
}

.table-container {
  background: white;
  border-radius: 8px;
  padding-left: 20px;
  padding-right: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .search-input {
    width: 100%;
  }

  .add-button {
    width: 100%;
    justify-content: center;
  }
}

/* 选择框样式 */
:deep(.el-table .el-checkbox) {
  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #8470FF;
    border-color: #8470FF;
    border-radius: 5px;
  }

  .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #8470FF;
    border-color: #8470FF;
  }

  .el-checkbox__inner:hover {
    border-color: #8470FF;

  }
}

:deep(.el-table .el-table__header-wrapper .el-checkbox) {
  .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #8470FF;
    border-color: #8470FF;
    border-radius: 5px;


  }

  .el-checkbox__input.is-indeterminate .el-checkbox__inner {
    background-color: #8470FF;
    border-color: #8470FF;
    border-radius: 10px;

  }
}

/* 移除表格边框 */
:deep(.el-table) {
  border: none;

  .el-table__inner-wrapper::before {
    display: none;
  }

  .el-table__inner-wrapper::after {
    display: none;
  }

  th,
  td {
    border: none !important;
    border-right: none !important;
    border-bottom: none !important;
  }

  .el-table__header th {
    border: none !important;
  }

  .el-table__body td {
    border: none !important;
  }

  .el-table__fixed {
    border: none !important;
  }

  .el-table__fixed-right {
    border: none !important;
  }
}

/* 操作按钮圆角样式 */
:deep(.el-table .el-table-column--selection .cell) {
  .el-button {
    border-radius: 8px;
  }
}

:deep(.el-table .el-button) {
  border-radius: 8px;
  transition: all 0.2s ease;

  &.el-button--small {
    border-radius: 6px;
  }
}

/* 批量操作栏样式 */
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

  strong {
    color: #8470FF;
    font-weight: 600;
  }
}

.batch-buttons {
  display: flex;
  gap: 8px;

  .el-button {
    border-radius: 6px;
  }
}

:deep(.el-pagination) {
  display: flex;
  justify-content: center;
  align-self: center;
  margin-top: 20px;
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
  height: 100px;
  text-align: center;
  line-height: 100px;
}

.avatar {
  width: 178px;
  height: 100px;
  display: block;
  object-fit: cover;
}
</style>
