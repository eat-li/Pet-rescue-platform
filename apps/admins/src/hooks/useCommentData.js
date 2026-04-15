import { getAllCommentAPI, batchDeleteCommentAPI, deleteCommentAPI, updateCommentStatusAPI } from "../api/comment"
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import convertToChinaLocalDate from '@/utils/dateCover.js'
import { formatImageUrl } from '@/utils/imgformat.js'

export const useCommentData = () => {
  // 响应式数据
  const commentData = ref([])
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })
  const searchText = ref('')
  const loading = ref(false)
  const selectedRows = ref([])

  // 计算属性
  const showBatchActions = computed(() => selectedRows.value.length > 0)

  // 获取评论列表
  const fetchCommentList = async () => {
    try {
      loading.value = true
      const params = {
        page: pagination.value.currentPage,
        limit: pagination.value.pageSize,
        search: searchText.value
      }
      const response = await getAllCommentAPI(params)
      console.log('API响应:', response)

      if (response && response.data && response.data.comments) {
        // 处理评论数据，根据实际API返回结构映射字段
        commentData.value = response.data.comments.map(comment => ({
          id: comment.id,
          content: comment.content,
          parentId: comment.parentId,
          status: comment.status,
          userId: comment.userId,
          articleId: comment.articleId,
          // 格式化时间
          create_time: convertToChinaLocalDate(comment.createdAt),
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
          // 用户信息
          username: comment.user?.username || '未知用户',
          avatar: formatImageUrl(comment.user?.avatar),
          nickname: comment.user?.nickname || comment.user?.username || '未知用户',
          // 文章信息
          article: {
            id: comment.article?.id,
            title: comment.article?.title || '未知文章',
          },
          // 保留原始用户和文章对象
          user: comment.user,
          originalArticle: comment.article
        }))

        // 更新分页信息
        if (response.data.pagination) {
          pagination.value = {
            ...pagination.value,
            pageSize: response.data.pagination.pageSize || pagination.value.pageSize,
            totalItems: response.data.pagination.totalItems || 0,
            totalPages: response.data.pagination.totalPages || 0
          }
        }
      }

      console.log('处理后的评论数据:', commentData.value)

    } catch (error) {
      console.error('获取评论列表失败:', error)
      ElMessage.error('获取评论列表失败')
    } finally {
      loading.value = false
    }
  }

  // 搜索功能
  const handleSearch = () => {
    pagination.value.currentPage = 1 // 重置到第一页
    fetchCommentList()
  }

  // 重置搜索
  const handleReset = () => {
    searchText.value = ''
    pagination.value.currentPage = 1
    fetchCommentList()
  }

  // 分页变化处理
  const handlePageChange = (page) => {
    // 先检查页码是否有效
    if (page < 1 || (pagination.value.totalPages > 0 && page > pagination.value.totalPages)) {
      return
    }
    pagination.value.currentPage = page
    fetchCommentList()
  }

  // 评论状态切换
  const handleStatusChange = async (row) => {
    try {
      const originalStatus = !row.status // 保存切换前的状态

      await updateCommentStatusAPI(row.id, row.status)
      ElMessage.success(`评论状态已${row.status ? '启用' : '禁用'}`)

      // 可选：重新获取列表以确保数据同步
      // await fetchCommentList()

    } catch (error) {
      console.error('更新评论状态失败:', error)
      ElMessage.error('更新评论状态失败，请稍后重试')
      // 恢复原状态
      row.status = !row.status
    }
  }

  // 删除评论
  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除评论 "${row.content.substring(0, 20)}..." 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )

      loading.value = true
      await deleteCommentAPI(row.id)

      ElMessage.success('删除成功')

      // 如果当前页只有一条数据且不是第一页，则跳转到上一页
      if (commentData.value.length === 1 && pagination.value.currentPage > 1) {
        pagination.value.currentPage -= 1
      }

      await fetchCommentList() // 重新获取列表
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除评论失败:', error)
        ElMessage.error('删除评论失败，请稍后重试')
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

  // 批量删除评论
  // 批量删除评论
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要删除的评论')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 条评论吗？`,
        '批量删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )

      loading.value = true

      // 提取选中评论的ID，确保转换为数字类型
      const ids = selectedRows.value.map(comment => {
        const id = parseInt(comment.id, 10)  // 明确指定基数10
        if (isNaN(id)) {
          throw new Error(`无效的评论ID: ${comment.id}`)
        }
        return id
      })


      const selectedCount = selectedRows.value.length  // 保存删除数量

      await batchDeleteCommentAPI(ids)

      ElMessage.success(`成功删除 ${selectedCount} 条评论`)  // 使用保存的数量

      // 清空选择
      selectedRows.value = []

      // 如果当前页的所有数据都被删除且不是第一页，则跳转到上一页
      if (commentData.value.length <= selectedCount && pagination.value.currentPage > 1) {  // 使用保存的数量
        pagination.value.currentPage -= 1
      }

      await fetchCommentList() // 重新获取列表
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除评论失败:', error)
        ElMessage.error(`批量删除评论失败：${error.message || '请稍后重试'}`)
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

  return {
    // 数据
    commentData,
    pagination,
    searchText,
    loading,
    selectedRows,
    //计算属性
    showBatchActions,

    // 方法
    fetchCommentList,
    handleSearch,
    handleReset,
    handlePageChange,
    handleStatusChange,
    handleDelete,
    handleSelectionChange,
    handleBatchDelete,
    handleClearSelection,
  }
}