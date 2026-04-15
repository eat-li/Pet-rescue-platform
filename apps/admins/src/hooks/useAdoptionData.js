import { 
  getAllAdoptionAPI, 
  updateAdoptionStatusAPI, 
  deleteAdoptionAPI, 
  batchDeleteAdoptionAPI,
  createAdoptionAPI,
  uploadAdoptionImageAPI
} from '../api/adoption'
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import convertToChinaLocalDate from '@/utils/dateCover.js'
import { formatImageUrl } from '@/utils/imgformat.js'

export const useAdoptionData = () => {
  // 响应式数据
  const adoptionData = ref([])
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })
  const searchText = ref('')
  const filterStatus = ref('')  // '' | 'pending' | 'approved' | 'rejected'
  const filterType = ref('')    // '' | '猫' | '狗' | ...
  const loading = ref(false)
  const selectedRows = ref([])

  // 计算属性
  const showBatchActions = computed(() => selectedRows.value.length > 0)

  // ── 获取领养列表 ──────────────────────────────────────
  const fetchAdoptionList = async () => {
    try {
      loading.value = true

      const params = {
        page: pagination.value.currentPage,
        limit: pagination.value.pageSize,
      }
      if (searchText.value)  params.search = searchText.value
      if (filterStatus.value) params.status = filterStatus.value
      if (filterType.value)   params.type = filterType.value

      const response = await getAllAdoptionAPI(params)

      if (response && response.data && response.data.adoptions) {
        adoptionData.value = response.data.adoptions.map(item => ({
          id: item.id,
          fee: item.fee,
          status: item.status,
          money: item.money,
          other_msg: item.other_msg,
          request: item.request || {},
          create_time: convertToChinaLocalDate(item.createdAt),
          createdAt: item.createdAt,
          // 发布人
          publisherName: item.user?.nickname || item.user?.username || '未知用户',
          publisherAvatar: formatImageUrl(item.user?.avatar),
          userId: item.user?.id,
          // 宠物信息
          petName: item.pet?.nickName || '未知宠物',
          petType: item.pet?.type || '-',
          petBreed: item.pet?.breed || '-',
          petSex: item.pet?.sex,
          petBirthday: item.pet?.birthday,
          petImage: formatImageUrl(item.pet?.image),
          petVaccine: item.pet?.vaccineStatus,
          petId: item.pet?.id,
          // 联系信息
          location: item.request?.location || '-',
          contact: item.request?.contact || '-',
        }))

        if (response.data.pagination) {
          pagination.value = {
            ...pagination.value,
            pageSize: response.data.pagination.pageSize || pagination.value.pageSize,
            totalItems: response.data.pagination.totalItems || 0,
            totalPages: response.data.pagination.totalPages || 0
          }
        }
      }
    } catch (error) {
      console.error('获取领养列表失败:', error)
      ElMessage.error('获取领养列表失败')
    } finally {
      loading.value = false
    }
  }

  // ── 搜索 / 重置 ────────────────────────────────────────
  const handleSearch = () => {
    pagination.value.currentPage = 1
    fetchAdoptionList()
  }

  const handleReset = () => {
    searchText.value = ''
    filterStatus.value = ''
    filterType.value = ''
    pagination.value.currentPage = 1
    fetchAdoptionList()
  }

  // ── 分页 ───────────────────────────────────────────────
  const handlePageChange = (page) => {
    if (page < 1 || (pagination.value.totalPages > 0 && page > pagination.value.totalPages)) return
    pagination.value.currentPage = page
    fetchAdoptionList()
  }

  // ── 状态更新 ───────────────────────────────────────────
  const handleStatusChange = async (row, newStatus) => {
    const oldStatus = row.status
    const statusLabelMap = { pending: '待领养', approved: '已领养', rejected: '已取消' }

    try {
      await ElMessageBox.confirm(
        `确定将该领养信息状态改为「${statusLabelMap[newStatus]}」吗？`,
        '状态变更',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      )

      row.status = newStatus
      await updateAdoptionStatusAPI(row.id, newStatus)
      ElMessage.success(`状态已更新为「${statusLabelMap[newStatus]}」`)
    } catch (error) {
      row.status = oldStatus // 恢复原状态
      if (error !== 'cancel') {
        console.error('更新状态失败:', error)
        ElMessage.error('更新状态失败，请稍后重试')
      } else {
        ElMessage.info('已取消操作')
      }
    }
  }

  // ── 删除 ───────────────────────────────────────────────
  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除「${row.petName}」的领养信息吗？此操作不可撤销。`,
        '删除确认',
        { confirmButtonText: '确定删除', cancelButtonText: '取消', type: 'warning' }
      )

      loading.value = true
      await deleteAdoptionAPI(row.id)
      ElMessage.success('删除成功')

      if (adoptionData.value.length === 1 && pagination.value.currentPage > 1) {
        pagination.value.currentPage -= 1
      }
      await fetchAdoptionList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除领养信息失败:', error)
        ElMessage.error('删除失败，请稍后重试')
      } else {
        ElMessage.info('已取消删除')
      }
    } finally {
      loading.value = false
    }
  }

  // ── 批量删除 ────────────────────────────────────────────
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请先选择要删除的记录')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 条领养信息吗？`,
        '批量删除',
        { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
      )

      loading.value = true
      const selectedCount = selectedRows.value.length
      const ids = selectedRows.value.map(item => item.id)

      await batchDeleteAdoptionAPI(ids)

      ElMessage.success(`成功删除 ${selectedCount} 条记录`)
      selectedRows.value = []

      if (adoptionData.value.length <= selectedCount && pagination.value.currentPage > 1) {
        pagination.value.currentPage -= 1
      }
      await fetchAdoptionList()
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除失败:', error)
        ElMessage.error('批量删除失败，请稍后重试')
      } else {
        ElMessage.info('已取消删除')
      }
    } finally {
      loading.value = false
    }
  }

  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
  }

  const handleClearSelection = () => {
    selectedRows.value = []
  }

  // 上传领养宠物图片
  const uploadAdoptionImage = async (file) => {
    try {
      loading.value = true
      const response = await uploadAdoptionImageAPI(file)
      if (response.code === 200) {
        return {
          success: true,
          url: response.data.fileUrl
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

  // 创建领养信息
  const createAdoption = async (formData) => {
    try {
      loading.value = true
      const response = await createAdoptionAPI(formData)
      if (response.code === 201) {
        ElMessage.success('领养信息发布成功')
        await fetchAdoptionList()
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
      console.error('发布领养信息失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '发布领养信息失败'
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
    adoptionData,
    pagination,
    searchText,
    filterStatus,
    filterType,
    loading,
    selectedRows,
    showBatchActions,
    fetchAdoptionList,
    handleSearch,
    handleReset,
    handlePageChange,
    handleStatusChange,
    handleDelete,
    handleBatchDelete,
    handleSelectionChange,
    handleClearSelection,
    uploadAdoptionImage,
    createAdoption
  }
}
