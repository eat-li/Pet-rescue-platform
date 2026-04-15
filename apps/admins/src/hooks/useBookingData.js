import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getBookingListAPI,
  getBookingDetailAPI,
  updateBookingStatusAPI,
  deleteBookingAPI,
  batchDeleteBookingAPI,
  getBookingStatsAPI
} from '@/api/booking'
import convertToChinaLocalDate from '@/utils/dateCover.js'

export const useBookingData = () => {
  const bookingData = ref([])
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })
  const loading = ref(false)
  const selectedRows = ref([])
  const searchText = ref('')
  const filterStatus = ref('')
  const stats = ref({
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    total: 0
  })

  // 预约状态映射
  const bookingStatusMap = {
    pending: { label: '待确认', type: 'warning' },
    confirmed: { label: '已确认', type: 'primary' },
    completed: { label: '已完成', type: 'success' },
    cancelled: { label: '已取消', type: 'danger' }
  }

  // 获取预约列表
  const fetchBookingList = async () => {
    try {
      loading.value = true
      const params = {
        page: pagination.value.currentPage,
        limit: pagination.value.pageSize,
        search: searchText.value,
        status: filterStatus.value
      }
      const response = await getBookingListAPI(params)
      
      if (response.code === 200) {
        bookingData.value = response.data.bookings.map(booking => ({
          ...booking,
          createdAt: convertToChinaLocalDate(booking.createdAt),
          updatedAt: convertToChinaLocalDate(booking.updatedAt),
          appointmentDate: booking.appointmentDate,
          appointmentTime: booking.appointmentTime,
          statusText: bookingStatusMap[booking.status]?.label || booking.status
        }))
        
        pagination.value = {
          currentPage: response.data.pagination.currentPage,
          pageSize: response.data.pagination.pageSize,
          totalItems: response.data.pagination.totalItems,
          totalPages: response.data.pagination.totalPages
        }
      }
    } catch (err) {
      console.error('获取预约列表失败:', err)
      ElMessage.error('获取预约列表失败')
    } finally {
      loading.value = false
    }
  }

  // 获取预约详情
  const fetchBookingDetail = async (id) => {
    try {
      loading.value = true
      const response = await getBookingDetailAPI(id)
      if (response.code === 200) {
        return response.data
      } else {
        ElMessage.error(response.message || '获取详情失败')
        return null
      }
    } catch (err) {
      console.error('获取预约详情失败:', err)
      ElMessage.error('获取预约详情失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 获取预约统计
  const fetchBookingStats = async () => {
    try {
      const response = await getBookingStatsAPI()
      if (response.code === 200) {
        const statsData = response.data.stats
        stats.value = {
          pending: statsData.find(s => s.status === 'pending')?.count || 0,
          confirmed: statsData.find(s => s.status === 'confirmed')?.count || 0,
          completed: statsData.find(s => s.status === 'completed')?.count || 0,
          cancelled: statsData.find(s => s.status === 'cancelled')?.count || 0,
          total: response.data.total
        }
      }
    } catch (err) {
      console.error('获取预约统计失败:', err)
    }
  }

  // 更新预约状态
  const handleStatusChange = async (row, newStatus, cancelReason = '') => {
    const originalStatus = row.status
    
    try {
      const response = await updateBookingStatusAPI(row.id, newStatus, cancelReason)
      if (response.code === 200) {
        ElMessage.success('预约状态更新成功')
        await fetchBookingList()
        await fetchBookingStats()
        return true
      } else {
        row.status = originalStatus
        ElMessage.error(response.message || '状态更新失败')
        return false
      }
    } catch (err) {
      row.status = originalStatus
      console.error('更新预约状态失败:', err)
      ElMessage.error('状态更新失败')
      return false
    }
  }

  // 删除预约
  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除这条预约记录吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      const response = await deleteBookingAPI(row.id)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        await fetchBookingList()
        await fetchBookingStats()
      }
    } catch (err) {
      if (err !== 'cancel') {
        console.error('删除预约失败:', err)
        ElMessage.error('删除失败')
      }
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的预约')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 条预约记录吗？`,
        '批量删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      const ids = selectedRows.value.map(row => row.id)
      const response = await batchDeleteBookingAPI(ids)
      
      if (response.code === 200) {
        ElMessage.success('批量删除成功')
        selectedRows.value = []
        await fetchBookingList()
        await fetchBookingStats()
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
    fetchBookingList()
  }

  // 重置搜索
  const handleReset = () => {
    searchText.value = ''
    filterStatus.value = ''
    pagination.value.currentPage = 1
    fetchBookingList()
  }

  // 分页变化
  const handlePageChange = (page) => {
    pagination.value.currentPage = page
    fetchBookingList()
  }

  // 计算是否显示批量操作
  const showBatchActions = computed(() => selectedRows.value.length > 0)

  return {
    bookingData,
    pagination,
    loading,
    selectedRows,
    searchText,
    filterStatus,
    stats,
    bookingStatusMap,
    showBatchActions,
    fetchBookingList,
    fetchBookingDetail,
    fetchBookingStats,
    handleStatusChange,
    handleDelete,
    handleBatchDelete,
    handleSelectionChange,
    handleClearSelection,
    handleSearch,
    handleReset,
    handlePageChange
  }
}
