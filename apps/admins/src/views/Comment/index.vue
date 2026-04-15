<script setup>
import PageContainer from '../../components/Common/PageContainer.vue'
import Mypagination from '../../components/Common/Mypagination.vue'
import { Plus, Search, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { useCommentData } from '../../hooks/useCommentData'

const {
  commentData,
  pagination,
  searchText,
  loading,
  selectedRows,
  showBatchActions,
  fetchCommentList,
  handleSearch,
  handleReset,
  handlePageChange,
  handleStatusChange,
  handleDelete,
  handleSelectionChange,
  handleBatchDelete,
  handleClearSelection,
} = useCommentData()

console.log(commentData.value)

// 弹窗相关
const showDialog = ref(false)

// 编辑处理
const handleEdit = (row) => {
  console.log('编辑评论:', row)
  // 这里可以添加编辑评论的逻辑
}

// 取消操作
const handleCancel = () => {
  showDialog.value = false
}

// 保存用户（这里应该是保存评论）
const handleSaveUser = () => {
  // 这里可以添加保存评论的逻辑
  showDialog.value = false
}

// 组件挂载时获取数据
onMounted(() => {
  fetchCommentList()
})
</script>

<template>
  <PageContainer title="评论管理">
    <template #extra>
      <!-- 搜索和按钮区域 -->
      <div class="header-actions">
        <div class="search-container">
          <el-input v-model="searchText" placeholder="搜索评论内容..." class="search-input" @keyup.enter="handleSearch">
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
            <el-button size="small" type="danger" @click="handleBatchDelete">
              <el-icon color="red">
                <Delete />
              </el-icon>
              批量删除
            </el-button>
          </div>
        </div>

        <div class="table-container">
          <el-table :data="commentData" v-loading="loading" style="width: 100%" stripe :border="false"
            @selection-change="handleSelectionChange" height="500" :max-height="600">

            <!-- 选择 -->
            <el-table-column type="selection" width="50" fixed />

            <!-- 帖子信息 -->
            <el-table-column label="帖子标题" width="150" align="center">
              <template #default="{ row }">
                <!-- 如果有封面图就显示，否则显示默认图标 -->
                <div class="article-cover">
                  {{ row.article?.title || '未知帖子' }}
                </div>

              </template>
            </el-table-column>

            <!-- 评论内容 -->
            <el-table-column label="评论内容" width="280" algin="ceter">
              <template #default="{ row }">
                <div class="comment-content" :title="row.content">
                  {{ row.content }}
                </div>
              </template>
            </el-table-column>

            <el-table-column label="评论用户" width="160" align="center">
              <template #default="{ row }">
                <div>{{ row.username }}</div>
              </template>
            </el-table-column>


            <!-- 评论状态显示 -->
            <el-table-column label=" 当前状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === true ? 'success' : 'danger'" effect="light" size="medium" round>
                  {{ row.status === true ? '正常' : '待审核' }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 状态切换 -->
            <el-table-column label="状态切换" width="100" align="center">
              <template #default="{ row }">
                <el-switch v-model="row.status" class="status-switch" 
                  style="--el-switch-on-color: #8470FF; --el-switch-off-color: #ff4949"
                  :active-value="true" :inactive-value="false"
                  @change="handleStatusChange(row)" />
              </template>
            </el-table-column>

            <!-- 创建时间 -->
            <el-table-column prop="create_time" label="创建时间" width="180" align="center" />

            <!-- 操作 -->
            <el-table-column label="操作" width="120" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button size="small" plain @click="handleEdit(row)" title="编辑">
                    <el-icon>
                      <Edit />
                    </el-icon>
                  </el-button>
                  <el-button size="small" type="danger" plain @click="handleDelete(row)" title="删除">
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

          <!-- 编辑弹窗 -->
          <el-dialog v-model="showDialog" title="编辑评论" width="600" align-center @close="handleCancel">
            <main>
              <!-- 这里可以添加编辑评论的表单 -->
              <p>编辑评论功能待实现</p>
            </main>

            <template #footer>
              <div class="dialog-footer">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleSaveUser" :loading="loading">
                  确认保存
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

/* 新增样式 */
.article-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.article-cover {
  .no-cover {
    width: 60px;
    height: 60px;
    background: #f5f5f5;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
  }
}

.article-title {
  font-size: 12px;
  font-weight: bold;
  text-align: center;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment-content {
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  line-height: 1.4;
  font-size: 14px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  .username {
    font-size: 14px;
    font-weight: 500;
    color: #333;
  }

  .nickname {
    font-size: 12px;
    color: #666;
  }
}

.status-switch {
  :deep(.el-switch__core) {
    border-radius: 10px;
  }
}

.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
}
</style>
