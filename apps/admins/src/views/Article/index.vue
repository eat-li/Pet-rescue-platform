<script setup>
import PageContainer from '../../components/Common/PageContainer.vue'
import { Plus, Search, Edit, Delete, Refresh } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useArticleData } from '../../hooks/useArticleData'
import { getUserListAPI } from '../../api/user'

const {
  articleData,
  pagination,
  loading,
  typeMap,
  fetchArticleList,
  showBatchActions,
  selectedRows,
  searchText,
  handleSearch,
  handleReset,
  handlePageChange,
  handleDelete,
  handleSelectionChange,
  handleBatchDelete,
  handleClearSelection,
  uploadArticleImages,
  createArticle,
  getArticleDetail,
  updateArticle
} = useArticleData()

// 弹窗相关
const showDialog = ref(false)
const showEditDialog = ref(false)
const isEditMode = ref(false)
const currentArticleId = ref(null)

// 表单数据
const articleForm = ref({
  title: '',
  type: 'pet_daily',
  content: '',
  images: [],
  tag: [],
  userId: null
})

// 用户列表（用于选择发帖用户）
const userList = ref([])

// 标签输入
const tagInput = ref('')

// 图片上传相关
const fileList = ref([])

// 表单验证规则
const formRules = {
  title: [{ required: true, message: '请输入帖子标题', trigger: 'blur' }],
  type: [{ required: true, message: '请选择帖子类型', trigger: 'change' }],
  content: [{ required: true, message: '请输入帖子内容', trigger: 'blur' }],
  userId: [{ required: true, message: '请选择发帖用户', trigger: 'change' }]
}

// 重置表单
const resetArticleForm = () => {
  articleForm.value = {
    title: '',
    type: 'pet_daily',
    content: '',
    images: [],
    tag: [],
    userId: null
  }
  tagInput.value = ''
  fileList.value = []
  currentArticleId.value = null
  isEditMode.value = false
}

// 打开新增帖子弹窗
const handleAddArticle = async () => {
  resetArticleForm()
  // 获取用户列表
  try {
    const response = await getUserListAPI({ page: 1, limit: 100 })
    if (response && response.data) {
      userList.value = response.data.users
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
  }
  showDialog.value = true
}

// 打开编辑帖子弹窗
const handleEdit = async (row) => {
  resetArticleForm()
  isEditMode.value = true
  currentArticleId.value = row.id
  
  // 获取帖子详情
  const result = await getArticleDetail(row.id)
  if (result.success) {
    const article = result.data
    articleForm.value = {
      title: article.title,
      type: article.type,
      content: article.content,
      images: article.images || [],
      tag: article.tag || []
    }
    // 转换图片为fileList格式
    fileList.value = (article.images || []).map((url, index) => ({
      name: `image-${index}`,
      url: url
    }))
    showEditDialog.value = true
  }
}

// 取消
const handleCancel = () => {
  showDialog.value = false
  resetArticleForm()
}

const handleCancelEdit = () => {
  showEditDialog.value = false
  resetArticleForm()
}

// 处理图片上传
const handleImageUpload = async (options) => {
  const { file } = options
  const result = await uploadArticleImages([file])
  if (result.success) {
    articleForm.value.images.push(...result.urls)
    return result.urls[0]
  }
  return null
}

// 处理图片移除
const handleImageRemove = (file, fileList) => {
  const index = articleForm.value.images.findIndex(url => url === file.url)
  if (index > -1) {
    articleForm.value.images.splice(index, 1)
  }
}

// 添加标签
const handleAddTag = () => {
  const tag = tagInput.value.trim()
  if (tag && !articleForm.value.tag.includes(tag)) {
    if (articleForm.value.tag.length >= 5) {
      ElMessage.warning('标签最多5个')
      return
    }
    articleForm.value.tag.push(tag)
    tagInput.value = ''
  }
}

// 移除标签
const handleRemoveTag = (tag) => {
  const index = articleForm.value.tag.indexOf(tag)
  if (index > -1) {
    articleForm.value.tag.splice(index, 1)
  }
}

// 保存帖子（新增）
const handleSaveArticle = async () => {
  const result = await createArticle(articleForm.value)
  if (result.success) {
    showDialog.value = false
    resetArticleForm()
  }
}

// 保存帖子（编辑）
const handleSaveEdit = async () => {
  if (!currentArticleId.value) return
  const result = await updateArticle(currentArticleId.value, articleForm.value)
  if (result.success) {
    showEditDialog.value = false
    resetArticleForm()
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchArticleList()
})
</script>

<template>
  <PageContainer title="帖子管理">
    <template #extra>
      <!-- 搜索和按钮区域 -->
      <div class="header-actions">
        <div class="search-container">
          <el-input v-model="searchText" placeholder="搜索帖子..." class="search-input" @keyup.enter="handleSearch">
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
        <el-button type="primary" class="add-button" @click="handleAddArticle">
          <el-icon>
            <Plus />
          </el-icon>新增帖子
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
          <el-table :data="articleData" v-loading="loading" style="width: 100%" stripe :border="false"
            @selection-change="handleSelectionChange" height="500" :max-height="600">

            <!-- 选择 -->
            <el-table-column type="selection" width="50" fixed />

            <!-- 帖子封面 -->
            <el-table-column label="帖子封面" width="120" align="center">
              <template #default="{ row }">
                <el-image style="width: 80px; height: 80px" :src="row.cover" :zoom-rate="1.2" :max-scale="7"
                  :min-scale="0.2" show-progress :initial-index="4" fit="cover" />
              </template>
            </el-table-column>

            <!-- 帖子标题 -->
            <el-table-column prop="title" label="帖子标题" width="140" show-overflow-tooltip />

            <!-- 帖子类型 -->
            <el-table-column label="帖子类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="typeMap[row.type]" effect="light" size="medium" round>
                  {{ typeMap[row.type] }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 帖子内容 -->
            <el-table-column label="帖子内容" width="200">
              <template #default="{ row }">
                <div v-html="row.content"
                  style="max-height: 40px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                </div>
              </template>
            </el-table-column>

            <!-- 帖子状态 -->
            <el-table-column label="帖子状态" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === true ? 'success' : 'danger'" effect="light" size="medium" round>
                  {{ row.status === true ? '正常' : '待审核' }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 用户信息 -->
            <el-table-column label="发帖用户" width="160" align="center">
              <template #default="{ row }">
                <div style="display: flex; align-items: center; justify-content: center; gap: 8px;">
                  <el-avatar :src="row.avatar" v-if="row.avatar && !row.avatar.includes('default_avatar')" :size="32" />
                  <el-avatar v-else :size="32">{{ row.username?.charAt(0) }}</el-avatar>
                  <span style="font-size: 14px;">{{ row.username }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 创建时间 -->
            <el-table-column prop="create_time" label="创建时间" width="180" align="center" />

            <!-- 操作 -->
            <el-table-column label="操作" width="100" fixed="right" align="center">
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

          <!-- 新增帖子弹窗 -->
          <el-dialog v-model="showDialog" title="新增帖子" width="700" align-center @close="handleCancel">
            <main>
              <el-form :model="articleForm" :rules="formRules" label-width="80px">
                <!-- 选择用户 -->
                <el-form-item label="发帖用户" prop="userId">
                  <el-select 
                    v-model="articleForm.userId" 
                    placeholder="请选择发帖用户" 
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
                
                <!-- 标题 -->
                <el-form-item label="标题" prop="title">
                  <el-input v-model="articleForm.title" placeholder="请输入帖子标题" />
                </el-form-item>
                
                <!-- 类型 -->
                <el-form-item label="类型" prop="type">
                  <el-select v-model="articleForm.type" placeholder="请选择帖子类型" style="width: 100%">
                    <el-option label="宠物日常" value="pet_daily" />
                    <el-option label="求助问题" value="help_question" />
                    <el-option label="经验分享" value="experience_share" />
                  </el-select>
                </el-form-item>
                
                <!-- 内容 -->
                <el-form-item label="内容" prop="content">
                  <el-input 
                    v-model="articleForm.content" 
                    type="textarea" 
                    :rows="6"
                    placeholder="请输入帖子内容" 
                  />
                </el-form-item>
                
                <!-- 图片上传 -->
                <el-form-item label="图片">
                  <el-upload
                    v-model:file-list="fileList"
                    action="#"
                    :http-request="handleImageUpload"
                    :on-remove="handleImageRemove"
                    list-type="picture-card"
                    :limit="5"
                    accept="image/*"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-upload>
                </el-form-item>
                
                <!-- 标签 -->
                <el-form-item label="标签">
                  <div class="tag-input-container">
                    <el-input 
                      v-model="tagInput" 
                      placeholder="输入标签后按回车添加" 
                      @keyup.enter="handleAddTag"
                      style="width: 200px"
                    />
                    <el-button type="primary" @click="handleAddTag" style="margin-left: 8px">添加</el-button>
                  </div>
                  <div class="tag-list" style="margin-top: 8px">
                    <el-tag
                      v-for="tag in articleForm.tag"
                      :key="tag"
                      closable
                      @close="handleRemoveTag(tag)"
                      style="margin-right: 8px; margin-bottom: 8px"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
                </el-form-item>
              </el-form>
            </main>

            <template #footer>
              <div class="dialog-footer">
                <el-button @click="handleCancel">取消</el-button>
                <el-button type="primary" @click="handleSaveArticle" :loading="loading">
                  确认发布
                </el-button>
              </div>
            </template>
          </el-dialog>

          <!-- 编辑帖子弹窗 -->
          <el-dialog v-model="showEditDialog" title="编辑帖子" width="700" align-center @close="handleCancelEdit">
            <main>
              <el-form :model="articleForm" :rules="formRules" label-width="80px">
                <!-- 标题 -->
                <el-form-item label="标题" prop="title">
                  <el-input v-model="articleForm.title" placeholder="请输入帖子标题" />
                </el-form-item>
                
                <!-- 类型 -->
                <el-form-item label="类型" prop="type">
                  <el-select v-model="articleForm.type" placeholder="请选择帖子类型" style="width: 100%">
                    <el-option label="宠物日常" value="pet_daily" />
                    <el-option label="求助问题" value="help_question" />
                    <el-option label="经验分享" value="experience_share" />
                  </el-select>
                </el-form-item>
                
                <!-- 内容 -->
                <el-form-item label="内容" prop="content">
                  <el-input 
                    v-model="articleForm.content" 
                    type="textarea" 
                    :rows="6"
                    placeholder="请输入帖子内容" 
                  />
                </el-form-item>
                
                <!-- 图片上传 -->
                <el-form-item label="图片">
                  <el-upload
                    v-model:file-list="fileList"
                    action="#"
                    :http-request="handleImageUpload"
                    :on-remove="handleImageRemove"
                    list-type="picture-card"
                    :limit="5"
                    accept="image/*"
                  >
                    <el-icon><Plus /></el-icon>
                  </el-upload>
                </el-form-item>
                
                <!-- 标签 -->
                <el-form-item label="标签">
                  <div class="tag-input-container">
                    <el-input 
                      v-model="tagInput" 
                      placeholder="输入标签后按回车添加" 
                      @keyup.enter="handleAddTag"
                      style="width: 200px"
                    />
                    <el-button type="primary" @click="handleAddTag" style="margin-left: 8px">添加</el-button>
                  </div>
                  <div class="tag-list" style="margin-top: 8px">
                    <el-tag
                      v-for="tag in articleForm.tag"
                      :key="tag"
                      closable
                      @close="handleRemoveTag(tag)"
                      style="margin-right: 8px; margin-bottom: 8px"
                    >
                      {{ tag }}
                    </el-tag>
                  </div>
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

.tag-input-container {
  display: flex;
  align-items: center;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
}
</style>
