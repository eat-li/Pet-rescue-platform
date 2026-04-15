import {
  getPetListAPI,
  getPetDetailAPI,
  createPetAPI,
  updatePetAPI,
  deletePetAPI,
  batchDeletePetAPI,
  uploadPetImageAPI
} from '../api/pet'
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import convertToChinaLocalDate from '@/utils/dateCover.js'
import { formatImageUrl } from '@/utils/imgformat.js'

export const usePetData = () => {
  const petData = ref([])
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })
  const searchText = ref({
    breed: '',
    type: '',
    vaccineStatus: '',
    search: ''
  })
  const loading = ref(false)
  const selectedRows = ref([])

  const showBatchActions = computed(() => selectedRows.value.length > 0)

  // 获取宠物列表
  const fetchPetList = async () => {
    try {
      loading.value = true
      const params = {
        page: pagination.value.currentPage,
        limit: pagination.value.pageSize,
        breed: searchText.value.breed,
        type: searchText.value.type,
        vaccieStatus: searchText.value.vaccieStatus,
        search: searchText.value.search
      }

      const response = await getPetListAPI(params)

      if (response && response.data) {
        petData.value = response.data.pets?.map(pet => ({
          ...pet,
          create_time: convertToChinaLocalDate(pet.createdAt),
          cover: formatImageUrl(pet.image), // 修正：使用 image 而不是 images[0]
          username: pet.user.username,
          nickname: pet.user.nickname,
          avatar: formatImageUrl(pet.user.avatar),
          // 添加性别显示
          sexDisplay: pet.sex ? '雄性' : '雌性',
          // 添加疫苗状态显示
          vaccineStatusDisplay: getVaccineStatusText(pet.vaccineStatus),
          // 添加年龄计算
          age: calculateAge(pet.birthday)
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
      console.error('获取宠物列表失败:', err)
      ElMessage.error('获取宠物列表失败')
    } finally {
      loading.value = false
    }
  }

  // 删除单个宠物
  const handleDelete = async (id) => {
    try {
      await ElMessageBox.confirm(
        '确定要删除这个宠物吗？此操作不可撤销。',
        '确认删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      await deletePetAPI(id)
      ElMessage.success('删除成功')
      await fetchPetList()
    } catch (err) {
      if (err !== 'cancel') {
        console.error('删除宠物失败:', err)
        ElMessage.error('删除失败')
      }
    }
  }

  // 批量删除宠物
  const handleBatchDelete = async () => {
    if (selectedRows.value.length === 0) {
      ElMessage.warning('请选择要删除的宠物')
      return
    }

    try {
      await ElMessageBox.confirm(
        `确定要删除选中的 ${selectedRows.value.length} 个宠物吗？此操作不可撤销。`,
        '确认批量删除',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      )

      const ids = selectedRows.value.map(row => row.id)
      await batchDeletePetAPI(ids)
      ElMessage.success(`成功删除 ${selectedRows.value.length} 个宠物`)
      selectedRows.value = []
      await fetchPetList()
    } catch (err) {
      if (err !== 'cancel') {
        console.error('批量删除宠物失败:', err)
        ElMessage.error('批量删除失败')
      }
    }
  }

  // 处理选择变化
  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
  }

  // 搜索功能
  const handleSearch = () => {
    pagination.value.currentPage = 1
    fetchPetList()
  }

  // 重置搜索
  const handleReset = () => {
    searchText.value = {
      breed: '',
      type: '',
      vaccieStatus: '',
      search: ''
    }
    pagination.value.currentPage = 1
    fetchPetList()
  }

  // 分页处理
  const handlePageChange = (page) => {
    pagination.value.currentPage = page
    fetchPetList()
  }

  const handleSizeChange = (size) => {
    pagination.value.pageSize = size
    pagination.value.currentPage = 1
    fetchPetList()
  }

  // 辅助函数：获取疫苗状态文本
  const getVaccineStatusText = (status) => {
    const statusMap = {
      'unvaccinated': '未接种',
      'one_dose': '一针',
      'two_doses': '两针', 
      'three_doses': '三针',
      'completed': '已完成'
    }
    return statusMap[status] || '未知'
  }

  // 辅助函数：计算年龄
  const calculateAge = (birthday) => {
    if (!birthday) return '未知'
    const birth = new Date(birthday)
    const now = new Date()
    const diffTime = Math.abs(now - birth)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 30) {
      return `${diffDays}天`
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30)
      return `${months}个月`
    } else {
      const years = Math.floor(diffDays / 365)
      const months = Math.floor((diffDays % 365) / 30)
      return months > 0 ? `${years}岁${months}个月` : `${years}岁`
    }
  }

  // 获取宠物详情
  const fetchPetDetail = async (id) => {
    try {
      const response = await getPetDetailAPI(id)
      if (response.code === 200) return response.data
      ElMessage.error(response.message || '获取详情失败')
      return null
    } catch (err) {
      console.error('获取宠物详情失败:', err)
      ElMessage.error('获取宠物详情失败')
      return null
    }
  }

  // 创建宠物
  const handleCreatePet = async (data) => {
    try {
      loading.value = true
      const response = await createPetAPI(data)
      if (response.code === 201) {
        ElMessage.success('宠物创建成功')
        await fetchPetList()
        return true
      }
      ElMessage.error(response.message || '创建失败')
      return false
    } catch (err) {
      console.error('创建宠物失败:', err)
      ElMessage.error('创建宠物失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 更新宠物
  const handleUpdatePet = async (id, data) => {
    try {
      loading.value = true
      const response = await updatePetAPI(id, data)
      if (response.code === 200) {
        ElMessage.success('宠物信息更新成功')
        await fetchPetList()
        return true
      }
      ElMessage.error(response.message || '更新失败')
      return false
    } catch (err) {
      console.error('更新宠物失败:', err)
      ElMessage.error('更新宠物失败')
      return false
    } finally {
      loading.value = false
    }
  }

  // 上传宠物图片
  const uploadPetImage = async (file) => {
    try {
      const response = await uploadPetImageAPI(file)
      if (response.code === 200) {
        ElMessage.success('图片上传成功')
        return { success: true, url: formatImageUrl(response.data.fileUrl) }
      }
      ElMessage.error(response.message || '上传失败')
      return { success: false }
    } catch (err) {
      console.error('上传宠物图片失败:', err)
      ElMessage.error('上传图片失败')
      return { success: false }
    }
  }

  return {
    petData,
    pagination,
    searchText,
    loading,
    selectedRows,
    showBatchActions,
    fetchPetList,
    fetchPetDetail,
    handleCreatePet,
    handleUpdatePet,
    uploadPetImage,
    handleDelete,
    handleBatchDelete,
    handleSelectionChange,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange
  }
}
