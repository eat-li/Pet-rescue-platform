<script setup>
import { useAdminStore } from '../../stores/admin'
import PageContainer from '../../components/Common/PageContainer.vue'
import { formatImageUrl } from '../../utils/imgformat.js'
import { computed, ref, reactive } from 'vue'
import { User, Phone, Message, Calendar, Edit, Upload, Lock } from '@element-plus/icons-vue'
import { updateAdminInfoAPI, uploadAdminAvatarAPI } from '../../api/admin.js'
import { ElMessage, ElMessageBox } from 'element-plus'

// 获取管理员信息
const adminStore = useAdminStore()
const adminInfo = computed(() => adminStore.adminInfo)

// 格式化头像URL
const avatarUrl = computed(() => {
  return adminInfo.value?.avatar ? formatImageUrl(adminInfo.value.avatar) : '/default-avatar.jpg'
})

// 格式化性别显示
const sexDisplay = computed(() => {
  return adminInfo.value?.sex ? '男' : '女'
})

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return '未知'
  return new Date(dateString).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 弹窗控制
const showEditDialog = ref(false)
const showPasswordDialog = ref(false)
const loading = ref(false)

// 编辑表单数据
const editForm = reactive({
  username: '',
  phone: '',
  email: '',
  sex: true, // 默认为男性
  avatar: ''
})

// 密码修改表单
const passwordForm = reactive({
  oldPassword: '',
  password: '',
  confirmPassword: ''
})

// 头像上传相关
const avatarPreview = ref('')
const uploadRef = ref()

// 打开编辑弹窗
const handleEditInfo = () => {
  // 初始化表单数据
  editForm.username = adminInfo.value?.username || ''
  editForm.phone = adminInfo.value?.phone || ''
  editForm.email = adminInfo.value?.email || ''
  editForm.sex = Boolean(adminInfo.value?.sex) // 确保为布尔值
  editForm.avatar = adminInfo.value?.avatar || ''
  avatarPreview.value = avatarUrl.value
  showEditDialog.value = true
}

// 打开密码修改弹窗
const handleChangePassword = () => {
  passwordForm.oldPassword = ''
  passwordForm.password = ''
  passwordForm.confirmPassword = ''
  showPasswordDialog.value = true
}

// 头像上传前的验证
const beforeAvatarUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isJPG) {
    ElMessage.error('头像只能是 JPG/PNG 格式!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 头像上传处理
const handleAvatarUpload = async (options) => {
  try {
    loading.value = true
    const response = await uploadAdminAvatarAPI(adminInfo.value.id, options.file)
    
    if (response.code === 200) {
      const newAvatar = response.data.avatar
      editForm.avatar = newAvatar
      avatarPreview.value = formatImageUrl(newAvatar)
      ElMessage.success('头像上传成功')
      // 更新 store 中的头像 - 直接修改属性保持响应式
      if (adminStore.adminInfo) {
        adminStore.adminInfo.avatar = newAvatar
      }
      console.log('Store updated with avatar:', newAvatar)
      console.log('avatarUrl computed:', avatarUrl.value)
      options.onSuccess && options.onSuccess(response)
    } else {
      ElMessage.error(response.message || '头像上传失败')
      options.onError && options.onError(new Error(response.message || '头像上传失败'))
    }
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败')
    options.onError && options.onError(error)
  } finally {
    loading.value = false
  }
}

// 表单验证规则
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/
  return phoneRegex.test(phone)
}

// 保存信息修改
const handleSaveInfo = async () => {
  // 表单验证
  if (!editForm.username?.trim()) {
    ElMessage.error('用户名不能为空')
    return
  }

  if (editForm.email && !validateEmail(editForm.email)) {
    ElMessage.error('请输入正确的邮箱格式')
    return
  }

  if (editForm.phone && !validatePhone(editForm.phone)) {
    ElMessage.error('请输入正确的手机号格式')
    return
  }

  try {
    loading.value = true

    const updateData = {
      username: editForm.username.trim(),
      phone: editForm.phone?.trim() || null,
      email: editForm.email?.trim() || null,
      sex: editForm.sex === true, // 确保为布尔值
      avatar: editForm.avatar
    }

    const response = await updateAdminInfoAPI(adminInfo.value.id, updateData)

    if (response.code === 200) {
      // 更新 store 中的管理员信息
      if (adminStore.adminInfo && response.data) {
        Object.assign(adminStore.adminInfo, response.data)
      }
      ElMessage.success('信息修改成功')
      showEditDialog.value = false
    } else {
      ElMessage.error(response.message || '修改失败')
    }
  } catch (error) {
    console.error('信息修改失败:', error)
    ElMessage.error(error.message || '信息修改失败')
  } finally {
    loading.value = false
  }
}

// 保存密码修改
const handleSavePassword = async () => {
  // 密码验证
  if (!passwordForm.oldPassword) {
    ElMessage.error('请输入原密码')
    return
  }

  if (!passwordForm.password) {
    ElMessage.error('请输入新密码')
    return
  }

  if (passwordForm.password.length < 6) {
    ElMessage.error('新密码长度不能少于6位')
    return
  }

  if (passwordForm.password !== passwordForm.confirmPassword) {
    ElMessage.error('两次输入的密码不一致')
    return
  }

  try {
    loading.value = true

    const updateData = {
      oldPassword: passwordForm.oldPassword,
      password: passwordForm.password
    }

    const response = await updateAdminInfoAPI(adminInfo.value.id, updateData)

    if (response.code === 200) {
      ElMessage.success('密码修改成功')
      showPasswordDialog.value = false
      // 清空密码表单
      passwordForm.oldPassword = ''
      passwordForm.password = ''
      passwordForm.confirmPassword = ''
    } else {
      ElMessage.error(response.message || '密码修改失败')
    }
  } catch (error) {
    console.error('密码修改失败:', error)
    ElMessage.error(error.message || '密码修改失败')
  } finally {
    loading.value = false
  }
}

// 取消操作
const handleCancel = () => {
  showEditDialog.value = false
  showPasswordDialog.value = false
}
</script>

<template>
  <PageContainer title="个人信息">
    <template #content>
      <div class="person-center">
        <!-- 个人信息卡片 -->
        <div class="info-card">
          <!-- 头像和基本信息 -->
          <div class="profile-header">
            <div class="avatar-section">
              <el-avatar :size="120" :src="avatarUrl" class="profile-avatar">
                <el-icon size="60">
                  <User />
                </el-icon>
              </el-avatar>
              <div class="avatar-info">
                <h2 class="username">{{ adminInfo?.username || '未知用户' }}</h2>
                <div class="role-badge">
                  <el-tag type="success" size="large">
                    <el-icon>
                      <Edit />
                    </el-icon>
                    管理员
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <!-- 详细信息 -->
          <div class="info-details">
            <div class="info-grid">
              <!-- 账号信息 -->
              <div class="info-item">
                <div class="info-label">
                  <el-icon>
                    <User />
                  </el-icon>
                  <span>账号</span>
                </div>
                <div class="info-value">{{ adminInfo?.account || '未设置' }}</div>
              </div>

              <!-- 手机号 -->
              <div class="info-item">
                <div class="info-label">
                  <el-icon>
                    <Phone />
                  </el-icon>
                  <span>手机号</span>
                </div>
                <div class="info-value">{{ adminInfo?.phone || '未设置' }}</div>
              </div>

              <!-- 邮箱 -->
              <div class="info-item">
                <div class="info-label">
                  <el-icon>
                    <Message />
                  </el-icon>
                  <span>邮箱</span>
                </div>
                <div class="info-value">{{ adminInfo?.email || '未设置' }}</div>
              </div>

              <!-- 性别 -->
              <div class="info-item">
                <div class="info-label">
                  <el-icon>
                    <User />
                  </el-icon>
                  <span>性别</span>
                </div>
                <div class="info-value">{{ sexDisplay }}</div>
              </div>

              <!-- 创建时间 -->
              <div class="info-item">
                <div class="info-label">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  <span>创建时间</span>
                </div>
                <div class="info-value">{{ formatDate(adminInfo?.createdAt) }}</div>
              </div>

              <!-- 更新时间 -->
              <div class="info-item">
                <div class="info-label">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  <span>更新时间</span>
                </div>
                <div class="info-value">{{ formatDate(adminInfo?.updatedAt) }}</div>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <el-button type="primary" :icon="Edit" @click="handleEditInfo" size="large">
              编辑信息
            </el-button>
            <el-button type="warning" :icon="Lock" @click="handleChangePassword" size="large">
              修改密码
            </el-button>
          </div>
        </div>
      </div>

      <!-- 编辑信息弹窗 -->
      <el-dialog v-model="showEditDialog" title="编辑个人信息" width="500px" :close-on-click-modal="false">
        <el-form :model="editForm" label-width="80px" label-position="left">
          <!-- 头像上传 -->
          <el-form-item label="头像">
            <div class="avatar-upload">
              <el-upload ref="uploadRef" class="avatar-uploader" :show-file-list="false"
                :before-upload="beforeAvatarUpload" :http-request="handleAvatarUpload" accept=".jpg,.jpeg,.png">
                <img v-if="avatarPreview" :src="avatarPreview" class="avatar-preview" />
                <el-icon v-else class="avatar-uploader-icon">
                  <Upload />
                </el-icon>
              </el-upload>
              <div class="upload-tip">点击上传头像，支持 JPG/PNG 格式，大小不超过 2MB</div>
            </div>
          </el-form-item>

          <!-- 用户名 -->
          <el-form-item label="用户名" required>
            <el-input v-model="editForm.username" placeholder="请输入用户名" />
          </el-form-item>

          <!-- 手机号 -->
          <el-form-item label="手机号">
            <el-input v-model="editForm.phone" placeholder="请输入手机号" />
          </el-form-item>

          <!-- 邮箱 -->
          <el-form-item label="邮箱">
            <el-input v-model="editForm.email" placeholder="请输入邮箱" />
          </el-form-item>

          <!-- 性别 -->
          <el-form-item label="性别">
            <el-radio-group v-model="editForm.sex">
              <el-radio :value="true">男</el-radio>
              <el-radio :value="false">女</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSaveInfo" :loading="loading">保存</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 修改密码弹窗 -->
      <el-dialog v-model="showPasswordDialog" title="修改密码" width="400px" :close-on-click-modal="false">
        <el-form :model="passwordForm" label-width="80px" label-position="left">
          <!-- 原密码 -->
          <el-form-item label="原密码" required>
            <el-input v-model="passwordForm.oldPassword" type="password" placeholder="请输入原密码" show-password />
          </el-form-item>

          <!-- 新密码 -->
          <el-form-item label="新密码" required>
            <el-input v-model="passwordForm.password" type="password" placeholder="请输入新密码（至少6位）" show-password />
          </el-form-item>

          <!-- 确认密码 -->
          <el-form-item label="确认密码" required>
            <el-input v-model="passwordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
          </el-form-item>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleSavePassword" :loading="loading">保存</el-button>
          </div>
        </template>
      </el-dialog>
    </template>
  </PageContainer>
</template>

<style scoped lang="scss">
.person-center {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.info-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  color: white;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 30px;

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 20px;
  }
}

.profile-avatar {
  border: 4px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.avatar-info {
  flex: 1;
}

.username {
  font-size: 28px;
  font-weight: 600;
  margin: 0 0 15px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.role-badge {
  :deep(.el-tag) {
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    font-weight: 500;
    padding: 8px 16px;

    .el-icon {
      margin-right: 6px;
    }
  }
}

.info-details {
  padding: 40px 30px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 25px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #667eea;
  transition: all 0.3s ease;

  &:hover {
    background: #e9ecef;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
}

.info-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  .el-icon {
    color: #667eea;
    font-size: 16px;
  }
}

.info-value {
  font-size: 16px;
  color: #212529;
  font-weight: 500;
  word-break: break-all;
}

.action-buttons {
  padding: 30px;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  gap: 15px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }

  .el-button {
    min-width: 120px;
    height: 44px;
    font-weight: 500;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }
  }
}

// 头像上传样式
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.avatar-uploader {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;

  &:hover {
    border-color: #409eff;
  }
}

.avatar-preview {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  display: block;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 120px;
  height: 120px;
  text-align: center;
  line-height: 120px;
}

.upload-tip {
  font-size: 12px;
  color: #999;
  text-align: center;
  max-width: 200px;
}

// 弹窗样式
.dialog-footer {
  text-align: right;

  .el-button {
    margin-left: 12px;
  }
}

// 表单样式优化
:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input) {
  width: 100%;
}

:deep(.el-radio-group) {
  display: flex;
  gap: 20px;
}

// 响应式设计
@media (max-width: 768px) {
  .person-center {
    padding: 10px;
  }

  .profile-header {
    padding: 30px 20px;
  }

  .info-details {
    padding: 30px 20px;
  }

  .info-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .username {
    font-size: 24px;
  }

  :deep(.el-dialog) {
    width: 90% !important;
    margin: 0 auto;
  }
}
</style>