import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getServiceListAPI,
  getServiceDetailAPI,
  createServiceAPI,
  updateServiceAPI,
  deleteServiceAPI,
  batchDeleteServiceAPI,
  updateServiceStatusAPI,
  uploadServiceImageAPI
} from '@/api/service'
import convertToChinaLocalDate from '@/utils/dateCover.js'
import { formatImageUrl } from '@/utils/imgformat.js'

export const useServiceData = () => {
  const serviceData = ref([])
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })
  const loading = ref(false)
  const selectedRows = ref([])
  const searchText = ref('')
  const filterType = ref('')
  const filterStatus = ref('')

  // 服务类型映射
  const serviceTypeMap = {
    basic_care: '基础护理',
    beauty_styling: '美容造型',
    health_medical: '健康医疗',
    training_service: '训练服务',
    special_experience: '特色体验'
  }

  // 获取服务列表
  const fetchServiceList = async () => {
    try {
      loading.value = true
      const params = {
        page: pagination.value.currentPage,
        limit: pagination.value.pageSize,
        search: searchText.value,
        type: filterType.value,
        status: filterStatus.value
      }
      const response = await getServiceListAPI(params)
      
      if (response.code === 200) {
        serviceData.value = response.data.services.map(service => ({
          ...service,
          image: service.image ? formatImageUrl(service.image) : '',
          createdAt: convertToChinaLocalDate(service.createdAt),
          updatedAt: convertToChinaLocalDate(service.updatedAt),
          typeText: serviceTypeMap[service.type] || service.type
        }))
        
        pagination.value = {
          currentPage: response.data.pagination.currentPage,
          pageSize: response.data.pagination.pageSize,
          totalItems: response.data.pagination.totalItems,
          totalPages: response.data.pagination.totalPages
        }
      }
    } catch (err) {
      console.error('获取服务列表失败:', err)
      ElMessage.error('获取服务列表失败')
    } finally {
      loading.value = false
    }
  }

  // 获取服务详情
  const fetchServiceDetail = async (id) => {
    try {
      loading.value = true
      const response = await getServiceDetailAPI(id)
      if (response.code === 200) {
        return response.data
      } else {
        ElMessage.error(response.message || '获取详情失败')
        return null
      }
    } catch (err) {
      console.error('获取服务详情失败:', err)
      ElMessage.error('获取服务详情失败')
      return null
    } finally {
      loading.value = false
    }
  }

  // 创建服务
  const handleCreateService = async (serviceData) => {
    try {
      loading.value = true
      const response = await createServiceAPI(serviceData)
      if (response.code === 201) {
        ElMessage.success('服务创建成功')
        await fetchServiceList()
        return true
      } else {
        ElMessage.error(response.message || '创建失败')
        return false
      }
    } catch (err) {
      console.error('创建服务失败:', err)
      ElMessage.error('创建服务失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 更新服务
  const handleUpdateService = async (id, serviceData) => {
    try {
      loading.value = true
      const response = await updateServiceAPI(id, serviceData)
      if (response.code === 200) {
        ElMessage.success('服务更新成功')
        await fetchServiceList()
        return true
      } else {
        ElMessage.error(response.message || '更新失败')
        return false
      }
    } catch (err) {
      console.error('更新服务失败:', err)
      ElMessage.error('更新服务失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 删除服务
  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除服务"${row.name}"吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )
      
      const response = await deleteServiceAPI(row.id)
      if (response.code === 200) {
        ElMessage.success('删除成功')
        await fetchServiceList()
      }
    } catch (err) {
      if (err !== 'cancel') {
        console.error('删除服务失败:', err)
        ElMessage.error('删除失败')
      }
    }
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的服务')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个服务吗？`,
        '批量删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      const ids = selectedRows.value.map(row => row.id)
      const response = await batchDeleteServiceAPI(ids)
      
      if (response.code === 200) {
        ElMessage.success('批量删除成功')
        selectedRows.value = []
        await fetchServiceList()
      }
    } catch (err) {
      if (err !== 'cancel') {
        console.error('批量删除失败:', err)
        ElMessage.error('批量删除失败')
      }
    }
  }

  // 更新服务状态（上下架）
  const handleStatusChange = async (row) => {
    const originalStatus = row.status
    
    try {
      const response = await updateServiceStatusAPI(row.id, row.status)
      if (response.code === 200) {
        ElMessage.success(row.status ? '服务已上架' : '服务已下架')
        await fetchServiceList()
      } else {
        row.status = originalStatus
        ElMessage.error(response.message || '状态更新失败')
      }
    } catch (err) {
      row.status = originalStatus
      console.error('更新服务状态失败:', err)
      ElMessage.error('状态更新失败')
    }
  }

  // 上传服务图片
  const uploadServiceImage = async (file) => {
    try {
      const response = await uploadServiceImageAPI(file)
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
    fetchServiceList()
  }

  // 重置搜索
  const handleReset = () => {
    searchText.value = ''
    filterType.value = ''
    filterStatus.value = ''
    pagination.value.currentPage = 1
    fetchServiceList()
  }

  // 分页变化
  const handlePageChange = (page) => {
    pagination.value.currentPage = page
    fetchServiceList()
  }

  // 计算是否显示批量操作
  const showBatchActions = computed(() => selectedRows.value.length > 0)

  return {
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
  }
}
