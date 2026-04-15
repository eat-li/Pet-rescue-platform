import {
  getNoticeListAPI,
  deleteNoticeAPI,
  batchDeleteNoticeAPI,
  updateNoticeStatusAPI,
  createNoticeAPI,
  getNoticeDetailAPI,
  updateNoticeAPI,
  uploadNoticeImageAPI
} from '@/api/notice'
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import convertToChinaLocalDate from '@/utils/dateCover.js'
import { formatImageUrl } from '@/utils/imgformat.js'

export const useNoticeData = () => {
  const noticeData = ref([])
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })
  const searchText = ref('')
  const titleSearchText = ref('')
  const loading = ref(false)
  const selectedRows = ref([])

  // 获取公告列表
  const fetchNoticeList = async () => {
    try {
      loading.value = true
      const params = {
        page: pagination.value.currentPage,
        limit: pagination.value.pageSize,
        search: titleSearchText.value
      }
      const response = await getNoticeListAPI(params)
      
      if (response.code === 200) {
        // 处理公告数据
        noticeData.value = response.data.notices.map(notice => ({
          ...notice,
          createdAt: convertToChinaLocalDate(notice.createdAt),
          updatedAt: convertToChinaLocalDate(notice.updatedAt),
          cover: notice.cover ? formatImageUrl(notice.cover) : ''
        }))
        
        // 更新分页信息
        pagination.value = {
          currentPage: response.data.pagination.currentPage,
          pageSize: response.data.pagination.pageSize,
          totalItems: response.data.pagination.totalItems,
          totalPages: response.data.pagination.totalPages
        }
      }
    } catch (err) {
      console.error('获取公告列表失败:', err)
      ElMessage.error('获取公告列表失败')
    } finally {
      loading.value = false
    }
  }

  // 状态切换处理
  const handleStatusChange = async (row) => {
    const originalStatus = !row.status // 保存原始状态（切换前的状态）
    
    try {
      const response = await updateNoticeStatusAPI(row.id, row.status)
      if (response.code === 200) {
        ElMessage.success(`公告状态已${row.status ? '启用' : '禁用'}`)
        // 重新获取列表以确保数据同步
        await fetchNoticeList()
      } else {
        // 如果更新失败，恢复原状态
        row.status = originalStatus
        ElMessage.error(response.message || '状态更新失败')
      }
    } catch (err) {
      // 如果更新失败，恢复原状态
      row.status = originalStatus
      console.error('更新公告状态失败:', err)
      ElMessage.error('状态更新失败')
    }
  }

  // 删除单个公告
  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除公告"${row.title}"吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      const response = await deleteNoticeAPI(row.id)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        await fetchNoticeList()
      }
    } catch (err) {
      if (err !== 'cancel') {
        console.error('删除公告失败:', err)
        ElMessage.error('删除失败')
      }
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的公告')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 条公告吗？`,
        '批量删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      const ids = selectedRows.value.map(row => row.id)
      const response = await batchDeleteNoticeAPI(ids)
      
      if (response.code === 200) {
        ElMessage.success('批量删除成功')
        selectedRows.value = []
        await fetchNoticeList()
      }
    } catch (err) {
      if (err !== 'cancel') {
        console.error('批量删除失败:', err)
        ElMessage.error('批量删除失败')
      }
    }
  }

  // 处理选择变化
  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
  }

  // 清除选择
  const handleClearSelection = () => {
    selectedRows.value = []
  }

  // 搜索
  const handleSearch = () => {
    pagination.value.currentPage = 1
    fetchNoticeList()
  }

  // 重置搜索
  const handleReset = () => {
    titleSearchText.value = ''
    pagination.value.currentPage = 1
    fetchNoticeList()
  }

  // 分页变化
  const handlePageChange = (page) => {
    pagination.value.currentPage = page
    fetchNoticeList()
  }

  // 创建公告
  const handleCreateNotice = async (noticeData) => {
    try {
      loading.value = true
      const response = await createNoticeAPI(noticeData)
      if (response.code === 201) {
        ElMessage.success('公告创建成功')
        await fetchNoticeList()
        return true
      } else {
        ElMessage.error(response.message || '创建失败')
        return false
      }
    } catch (err) {
      console.error('创建公告失败:', err)
      ElMessage.error('创建公告失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 获取公告详情
  const fetchNoticeDetail = async (id) => {
    try {
      loading.value = true
      const response = await getNoticeDetailAPI(id)
      if (response.code === 200) {
        return response.data
      } else {
        ElMessage.error(response.message || '获取详情失败')
        return null
      }
    } catch (err) {
      console.error('获取公告详情失败:', err)
      ElMessage.error('获取公告详情失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 更新公告
  const handleUpdateNotice = async (id, noticeData) => {
    try {
      loading.value = true
      const response = await updateNoticeAPI(id, noticeData)
      if (response.code === 200) {
        ElMessage.success('公告更新成功')
        await fetchNoticeList()
        return true
      } else {
        ElMessage.error(response.message || '更新失败')
        return false
      }
    } catch (err) {
      console.error('更新公告失败:', err)
      ElMessage.error('更新公告失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 上传公告图片
  const uploadNoticeImage = async (file) => {
    try {
      const response = await uploadNoticeImageAPI(file)
      if (response.code === 200) {
        ElMessage.success('图片上传成功')
        return {
          success: true,
          url: formatImageUrl(response.data.fileUrl)
        }
      } else {
        ElMessage.error(response.message || '上传失败')
        return { success: false }
      }
    } catch (err) {
      console.error('上传图片失败:', err)
      ElMessage.error('上传图片失败')
      return { success: false }
    }
  }

  // 计算是否显示批量操作
  const showBatchActions = computed(() => selectedRows.value.length > 0)

  return {
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
  }
}

