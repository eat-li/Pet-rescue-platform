import { 
  getArticleListAPI, 
  batchDeleteArticleAPI, 
  deleteArticleAPI, 
  createArticleAPI, 
  getArticleDetailAPI, 
  updateArticleAPI,
  uploadArticleImagesAPI 
} from "../api/article"
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import convertToChinaLocalDate from '@/utils/dateCover.js'
import { formatImageUrl } from '@/utils/imgformat.js'


export const useArticleData = () => {
  const articleData = ref([])
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })
  const searchText = ref('')
  const loading = ref(false)
  const selectedRows = ref([])

  const showBatchActions = computed(() => selectedRows.value.length > 0)


  // 类型映射map
  const typeMap = {
    pet_daily: '宠物日常',
    help_question: '求助问题',
    experience_share: '经验分享'
  }

  // 获取帖子列表
  const fetchArticleList = async () => {
    try {
      loading.value = true
      const params = {
        page: pagination.value.currentPage,
        limit: pagination.value.pageSize,
        search: searchText.value
      }
      const response = await getArticleListAPI(params)

      if (response && response.data) {
        articleData.value = response.data.articles?.map(article => ({
          ...article,
          create_time: convertToChinaLocalDate(article.createdAt),
          cover: formatImageUrl(article.images[0]),
          username: article.user.username,
          avatar: formatImageUrl(article.user.avatar),
        }))
        // 只更新必要的分页信息，保持当前页码不变
        pagination.value = {
          ...pagination.value, // 保持当前的 currentPage
          pageSize: response.data.pagination.pageSize,
          totalItems: response.data.pagination.totalItems,
          totalPages: response.data.pagination.totalPages
        }
      }
      console.log(articleData.value)

    } catch (error) {
      console.error('获取用户列表失败:', error)
      ElMessage.error('获取用户列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索功能
  const handleSearch = () => {
    pagination.value.currentPage = 1 // 重置到第一页
    fetchArticleList()
  }
  // 重置搜索
  const handleReset = () => {
    searchText.value = ''
    fetchArticleList()
  }

  // 分页变化处理
  const handlePageChange = (page) => {
    // 先检查页码是否有效
    if (page < 1 || (pagination.value.totalPages > 0 && page > pagination.value.totalPages)) {
      return
    }
    pagination.value.currentPage = page
    fetchArticleList()
  }

  // 删除帖子
  const handleDelete = async (row) => {
    console.log(row)
    try {
      await ElMessageBox.confirm(
        `确定要删除帖子 "${row.title}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )

      loading.value = true
      await deleteArticleAPI(row.id)

      ElMessage.success('删除成功')

      // 如果当前页只有一条数据且不是第一页，则跳转到上一页
      if (articleData.value.length === 1 && pagination.value.currentPage > 1) {
        pagination.value.currentPage -= 1
      }

      await fetchArticleList() // 重新获取列表
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除帖子失败:', error)
        ElMessage.error('删除帖子失败')
      } else {
        ElMessage.info('已取消删除')
      }
    } finally {
      loading.value = false
    }
  }

  //选择变化处理
  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
  }


  // 批量删除帖子
  const handleBatchDelete = async () => {
    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 条记录吗？`,
        '批量删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )

      loading.value = true

      // 提取选中帖子的ID
      const ids = selectedRows.value.map(article => article.id)

      await batchDeleteArticleAPI(ids)  // 调用批量删除接口

      ElMessage.success(`成功删除 ${selectedRows.value.length} 个帖子`)

      // 清空选择
      selectedRows.value = []

      // 如果当前页的所有数据都被删除且不是第一页，则跳转到上一页
      if (articleData.value.length === selectedRows.value.length && pagination.value.currentPage > 1) {
        pagination.value.currentPage -= 1
      }

      await fetchArticleList() // 重新获取列表
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除帖子失败:', error)
        ElMessage.error('批量删除帖子失败')
      } else {
        ElMessage.info('已取消删除')
      }
    } finally {
      loading.value = false
    }
  }
  // 清空选择
  const handleClearSelection = () => {
    selectedRows.value = []
  }

  // 上传文章图片
  const uploadArticleImages = async (files) => {
    try {
      loading.value = true
      const response = await uploadArticleImagesAPI(files)
      if (response.code === 200) {
        ElMessage.success('图片上传成功')
        return {
          success: true,
          urls: response.data.fileUrls
        }
      }
      return {
        success: false,
        error: response.message
      }
    } catch (error) {
      console.error('上传图片失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '上传图片失败'
      ElMessage.error(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // 创建帖子
  const createArticle = async (formData) => {
    try {
      loading.value = true
      const response = await createArticleAPI(formData)
      if (response.code === 201) {
        ElMessage.success('帖子发布成功')
        await fetchArticleList()
        return {
          success: true,
          data: response.data
        }
      }
      return {
        success: false,
        error: response.message
      }
    } catch (error) {
      console.error('发布帖子失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '发布帖子失败'
      ElMessage.error(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // 获取帖子详情
  const getArticleDetail = async (id) => {
    try {
      loading.value = true
      const response = await getArticleDetailAPI(id)
      if (response.code === 200) {
        return {
          success: true,
          data: response.data
        }
      }
      return {
        success: false,
        error: response.message
      }
    } catch (error) {
      console.error('获取帖子详情失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '获取帖子详情失败'
      ElMessage.error(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // 更新帖子
  const updateArticle = async (id, formData) => {
    try {
      loading.value = true
      const response = await updateArticleAPI(id, formData)
      if (response.code === 200) {
        ElMessage.success('帖子更新成功')
        await fetchArticleList()
        return {
          success: true,
          data: response.data
        }
      }
      return {
        success: false,
        error: response.message
      }
    } catch (error) {
      console.error('更新帖子失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '更新帖子失败'
      ElMessage.error(errorMessage)
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  return {
    // 数据
    articleData,
    pagination,
    searchText,
    loading,
    selectedRows,
    typeMap,

    //计算属性
    showBatchActions,

    // 方法
    fetchArticleList,
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

  }





}