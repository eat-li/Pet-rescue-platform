import { getUserListAPI, registerAPI, deleteUserAPI, batchDeleteUserAPI, toggleUserStatusAPI, updateUserInfoAPI } from '@/api/user.js'
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import convertToChinaLocalDate from '@/utils/dateCover.js'
import { formatImageUrl } from '@/utils/imgformat.js'

export const useUserData = () => {
  const userData = ref([])
  const RegisterForm = ref({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
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

  // 表单验证规则
  const validateUsername = (username) => {
    if (!username) {
      return '用户名不能为空'
    }
    if (username.length < 6 || username.length > 16) {
      return '用户名长度必须在6-16位之间'
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return '用户名只能包含字母、数字和下划线'
    }
    return ''
  }

  const validateEmail = (email) => {
    if (!email) {
      return '邮箱不能为空'
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return '请输入有效的邮箱地址'
    }
    return ''
  }

  const validatePhone = (phone) => {
    if (!phone) {
      return '手机号不能为空'
    }
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return '请输入有效的11位手机号'
    }
    return ''
  }

  const validatePassword = (password) => {
    if (!password) {
      return '密码不能为空'
    }
    if (password.length < 6 || password.length > 16) {
      return '密码长度必须在6-16位之间'
    }
    if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]+$/.test(password)) {
      return '密码必须包含至少一个字母和一个数字'
    }
    return ''
  }

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) {
      return '确认密码不能为空'
    }
    if (password !== confirmPassword) {
      return '两次输入的密码不一致'
    }
    return ''
  }

  // 编辑表单验证规则（不包含密码）
  const validateEditForm = (form) => {
    const errors = {}

    const usernameError = validateUsername(form.username)
    if (usernameError) errors.username = usernameError

    const emailError = validateEmail(form.email)
    if (emailError) errors.email = emailError

    const phoneError = validatePhone(form.phone)
    if (phoneError) errors.phone = phoneError

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // 表单验证
  const validateRegisterForm = (form) => {
    const errors = {}
    
    const usernameError = validateUsername(form.username)
    if (usernameError) errors.username = usernameError
    
    const emailError = validateEmail(form.email)
    if (emailError) errors.email = emailError
    
    const phoneError = validatePhone(form.phone)
    if (phoneError) errors.phone = phoneError
    
    const passwordError = validatePassword(form.password)
    if (passwordError) errors.password = passwordError
    
    const confirmPasswordError = validateConfirmPassword(form.password, form.confirmPassword)
    if (confirmPasswordError) errors.confirmPassword = confirmPasswordError
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    }
  }

  // 获取用户列表数据
  const fetchUserList = async () => {
    try {
      loading.value = true
      const params = {
        page: pagination.value.currentPage,
        limit: pagination.value.pageSize,
        search: searchText.value
      }

      const response = await getUserListAPI(params)

      if (response && response.data) {
        // 处理用户数据，转换字段格式
        userData.value = response.data.users.map(user => ({
          ...user,
          status: user.status ? 1 : 0,
          create_time: convertToChinaLocalDate(user.createdAt),
          avatar: formatImageUrl(user.avatar)
        }))

        // 只更新必要的分页信息，保持当前页码不变
        pagination.value = {
          ...pagination.value, // 保持当前的 currentPage
          pageSize: response.data.pagination.pageSize,
          totalItems: response.data.pagination.totalItems,
          totalPages: response.data.pagination.totalPages
        }
      }
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
    fetchUserList()
  }

  // 重置搜索
  const handleReset = () => {
    searchText.value = ''
    fetchUserList()
  }

  // 分页变化处理
  const handlePageChange = (page) => {
    // 先检查页码是否有效
    if (page < 1 || (pagination.value.totalPages > 0 && page > pagination.value.totalPages)) {
      return
    }

    pagination.value.currentPage = page
    fetchUserList()
  }

  // 状态切换
  const handleStatusChange = async (row) => {
    try {
      loading.value = true

      // 调用API切换状态，传入字符串格式的布尔值
      const statusString = row.status === 1 ? 'true' : 'false'
      await toggleUserStatusAPI(row.id, statusString)

      ElMessage.success(`用户 "${row.username}" 状态已${row.status === 1 ? '启用' : '禁用'}`)

    } catch (error) {
      console.error('切换用户状态失败:', error)
      ElMessage.error('切换用户状态失败')

      // 状态切换失败时，恢复原状态
      row.status = row.status === 1 ? 0 : 1
    } finally {
      loading.value = false
    }
  }

  // 删除用户
  const handleDelete = async (row) => {
    try {
      await ElMessageBox.confirm(
        `确定要删除用户 "${row.username}" 吗？`,
        '删除确认',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      )

      loading.value = true
      await deleteUserAPI(row.id)

      ElMessage.success('删除成功')

      // 如果当前页只有一条数据且不是第一页，则跳转到上一页
      if (userData.value.length === 1 && pagination.value.currentPage > 1) {
        pagination.value.currentPage -= 1
      }

      await fetchUserList() // 重新获取列表
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除用户失败:', error)
        ElMessage.error('删除用户失败')
      } else {
        ElMessage.info('已取消删除')
      }
    } finally {
      loading.value = false
    }
  }

  // 选择变化处理
  const handleSelectionChange = (selection) => {
    selectedRows.value = selection
  }

  // 批量删除
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

      // 提取选中用户的ID
      const ids = selectedRows.value.map(user => user.id)

      await batchDeleteUserAPI(ids)

      ElMessage.success(`成功删除 ${selectedRows.value.length} 个用户`)

      // 清空选择
      selectedRows.value = []

      // 如果当前页的所有数据都被删除且不是第一页，则跳转到上一页
      if (userData.value.length === selectedRows.value.length && pagination.value.currentPage > 1) {
        pagination.value.currentPage -= 1
      }

      await fetchUserList() // 重新获取列表
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除用户失败:', error)
        ElMessage.error('批量删除用户失败')
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

  // 重置注册表单
  const resetRegisterForm = () => {
    RegisterForm.value = {
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    }
  }

  // 注册用户
  const handleRegister = async (formData = RegisterForm.value) => {
    try {
      loading.value = true
      
      // 表单验证
      const validation = validateRegisterForm(formData)
      if (!validation.isValid) {
        // 显示第一个错误信息
        const firstError = Object.values(validation.errors)[0]
        ElMessage.error(firstError)
        return {
          success: false,
          errors: validation.errors
        }
      }

      // 准备提交的数据（不包含确认密码）
      const submitData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      }

      const response = await registerAPI(submitData)
      
      ElMessage.success('用户注册成功')
      resetRegisterForm() // 重置表单
      
      // 刷新用户列表
      await fetchUserList()
      
      return {
        success: true,
        data: response.data
      }
      
    } catch (error) {
      console.error('注册失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '注册失败'
      ElMessage.error(errorMessage)
      
      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // 编辑用户
  const handleEdit = async (id, formData) => {
    try {
      loading.value = true

      // 表单验证
      const validation = validateEditForm(formData)
      if (!validation.isValid) {
        // 显示第一个错误信息
        const firstError = Object.values(validation.errors)[0]
        ElMessage.error(firstError)
        return {
          success: false,
          errors: validation.errors
        }
      }

      // 准备提交的数据
      const submitData = {
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        nickname: formData.nickname
      }

      const response = await updateUserInfoAPI(id, submitData)

      ElMessage.success('用户信息更新成功')

      // 刷新用户列表
      await fetchUserList()

      return {
        success: true,
        data: response.data
      }

    } catch (error) {
      console.error('更新用户失败:', error)
      const errorMessage = error.response?.data?.message || error.message || '更新用户失败'
      ElMessage.error(errorMessage)

      return {
        success: false,
        error: errorMessage
      }
    } finally {
      loading.value = false
    }
  }

  // 返回所有需要的数据和方法
  return {
    // 响应式数据
    userData,
    RegisterForm,
    pagination,
    searchText,
    loading,
    selectedRows,

    // 计算属性
    showBatchActions,

    // 验证方法
    validateUsername,
    validateEmail,
    validatePhone,
    validatePassword,
    validateConfirmPassword,
    validateRegisterForm,
    validateEditForm,

    // 方法
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
    resetRegisterForm,
    handleEdit
  }
}
