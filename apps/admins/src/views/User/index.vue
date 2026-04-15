<script setup>
import PageContainer from '../../components/Common/PageContainer.vue'
import { Plus, Search, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import Mypagination from '@/components/Common/Mypagination.vue'
import { useUserData } from '@/hooks/useUserData.js'

// 使用 useUserData hook
const {
  userData,
  pagination,
  searchText,
  loading,
  selectedRows,
  showBatchActions,
  fetchUserList,
  handleSearch,
  handleReset,
  handlePageChange,
  handleStatusChange,
  handleDelete,
  handleSelectionChange,
  handleBatchDelete,
  handleClearSelection,
  handleRegister,
  handleEdit: handleEditUser
} = useUserData()

// 弹窗相关
const showDialog = ref(false)
const showEditDialog = ref(false)
const currentEditUser = ref(null)

// 表单数据
const form = ref({
  username: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: ''
})

// 编辑表单数据
const editForm = ref({
  username: '',
  nickname: '',
  email: '',
  phone: ''
})

// 重置表单
const resetForm = () => {
  form.value = {
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  }
}

// 重置编辑表单
const resetEditForm = () => {
  editForm.value = {
    username: '',
    nickname: '',
    email: '',
    phone: ''
  }
  currentEditUser.value = null
}

// 新增用户功能
const handleAddUser = () => {
  resetForm()
  showDialog.value = true
}

// 编辑用户
const handleEdit = (row) => {
  currentEditUser.value = row
  editForm.value = {
    username: row.username,
    nickname: row.nickname || '',
    email: row.email,
    phone: row.phone
  }
  showEditDialog.value = true
}

// 取消编辑
const handleCancelEdit = () => {
  showEditDialog.value = false
  resetEditForm()
}

// 保存编辑
const handleSaveEdit = async () => {
  if (!currentEditUser.value) return

  const result = await handleEditUser(currentEditUser.value.id, editForm.value)

  if (result.success) {
    showEditDialog.value = false
    resetEditForm()
  }
}

// 保存用户信息（添加用户）
const handleSaveUser = async () => {
  // 直接调用 useUserData 中的 handleRegister 方法
  // 它已经包含了完整的验证逻辑
  const result = await handleRegister(form.value)

  if (result.success) {
    showDialog.value = false
    resetForm()
  }
  // 错误处理已经在 handleRegister 中完成
}

// 取消添加
const handleCancel = () => {
  showDialog.value = false
  resetForm()
}

// 组件挂载时获取数据
onMounted(() => {
  fetchUserList()
})
</script>

<template>
  <PageContainer title="用户管理">
    <template #extra>
      <!-- 搜索和按钮区域 -->
      <div class="header-actions">
        <div class="search-container">
          <el-input v-model="searchText" placeholder="搜索用户名、邮箱或手机号..." class="search-input" @keyup.enter="handleSearch">
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
        <el-button type="primary" class="add-button" @click="handleAddUser">
          <el-icon>
            <Plus />
          </el-icon>新增用户
        </el-button>
      </div>
    </template>

    <template #content>
      <div class="user-content">
        <!-- 批量操作栏 -->
        <div v-if="showBatchActions" class="batch-actions">
          <div class="batch-info">
            <span>已选中 <strong>{{ selectedRows.length }}</strong> 条记录</span>
          </div>
          <div class="batch-buttons">
            <el-button size="small" @click="handleClearSelection">取消选择</el-button>
            <el-button size="small" type="plain" @click="handleBatchDelete">
              <el-icon color="red">
                <Delete />
              </el-icon>
              批量删除
            </el-button>
          </div>
        </div>

        <div class="table-container">
          <el-table :data="userData" v-loading="loading" style="width: 100%" stripe :border="false"
            @selection-change="handleSelectionChange" height="500" :max-height="600">

            <!-- 选择 -->
            <el-table-column type="selection" width="55" fixed />

            <!-- 用户名 -->
            <el-table-column prop="username" label="用户名" min-width="120px" />

            <!-- 昵称 -->
            <el-table-column prop="nickname" label="昵称" min-width="120px" />

            <!-- 邮箱 -->
            <el-table-column prop="email" label="邮箱" min-width="180px" />

            <!-- 手机号 -->
            <el-table-column prop="phone" label="手机号" min-width="130px" />

            <!-- 头像 -->
            <el-table-column label="头像" width="100" align="center">
              <template #default="{ row }">
                <el-avatar :src="row.avatar" v-if="row.avatar && !row.avatar.includes('default_avatar')" :size="40" />
                <el-avatar v-else :size="40">{{ row.username.charAt(0) }}</el-avatar>
              </template>
            </el-table-column>


            <!-- 状态 -->
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.status" class="ml-2"
                  style="--el-switch-on-color: #8470FF; --el-switch-off-color: #ff4949" :active-value="1"
                  :inactive-value="0" @change="handleStatusChange(row)" />
              </template>
            </el-table-column>

            <!-- 创建时间 -->
            <el-table-column prop="create_time" label="创建时间" min-width="160px" />

            <!-- 操作 -->
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="{ row }">
                <el-button size="small" plain @click="handleEdit(row)">
                  <el-icon>
                    <Edit />
                  </el-icon>
                </el-button>
                <el-button size="small" type="plain" @click="handleDelete(row)">
                  <el-icon color="red">
                    <Delete />
                  </el-icon>
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页组件 -->
          <Mypagination :current-page="pagination.currentPage" :page-size="pagination.pageSize"
            :total-items="pagination.totalItems" @page-change="handlePageChange" />

          <!-- 添加用户弹窗 -->
          <el-dialog v-model="showDialog" title="添加用户" width="600" align-center @close="handleCancel">
            <main>
              <el-form :model="form" label-width="80px">
                <!-- 用户名 -->
                <el-form-item label="用户名">
                  <el-input v-model="form.username" placeholder="请输入用户名" />
                </el-form-item>
                <!-- 邮箱 -->
                <el-form-item label="邮箱">
                  <el-input v-model="form.email" placeholder="请输入邮箱" />
                </el-form-item>
                <!-- 手机号 -->
                <el-form-item label="手机号">
                  <el-input v-model="form.phone" placeholder="请输入手机号" />
                </el-form-item>
                <!-- 密码 -->
                <el-form-item label="密码">
                  <el-input v-model="form.password" placeholder="请输入密码" type="password" show-password />
                </el-form-item>
                <!-- 确认密码 -->
                <el-form-item label="确认密码">
                  <el-input v-model="form.confirmPassword" placeholder="请确认密码" type="password" show-password />
                </el-form-item>
              </el-form>
            </main>

            <template #footer>
              <div class="dialog-footer">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleSaveUser" :loading="loading">
                  确认添加
                </el-button>
              </div>
            </template>
          </el-dialog>

          <!-- 编辑用户弹窗 -->
          <el-dialog v-model="showEditDialog" title="编辑用户" width="600" align-center @close="handleCancelEdit">
            <main>
              <el-form :model="editForm" label-width="80px">
                <!-- 用户名 -->
                <el-form-item label="用户名">
                  <el-input v-model="editForm.username" placeholder="请输入用户名" />
                </el-form-item>
                <!-- 昵称 -->
                <el-form-item label="昵称">
                  <el-input v-model="editForm.nickname" placeholder="请输入昵称" />
                </el-form-item>
                <!-- 邮箱 -->
                <el-form-item label="邮箱">
                  <el-input v-model="editForm.email" placeholder="请输入邮箱" />
                </el-form-item>
                <!-- 手机号 -->
                <el-form-item label="手机号">
                  <el-input v-model="editForm.phone" placeholder="请输入手机号" />
                </el-form-item>
              </el-form>
            </main>

            <template #footer>
              <div class="dialog-footer">
                <el-button @click="handleCancelEdit">取消</el-button>
                <el-button type="primary" @click="handleSaveEdit" :loading="loading">
                  确认修改
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

.user-content {}

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
</style>
