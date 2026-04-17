<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../../stores/user'
import { getSafeImageUrl } from '../../../utils/imgformat'
import { updateUserInfoAPI, uploadAvatarAPI } from '../../../api/user'
import Myselect from '../../../components/Common/MySelect.vue'
import Toast from '../../../components/Common/Toast.vue'
import { useToast } from '../../../hooks/Common/useToast.js'
import throttle from '../../../utils/throttle'
import Loading from '../../../components/Common/Loading.vue'

const userStore = useUserStore()
const {
  toastType,
  toastMessage,
  showToast,
  duration,
  showSuccess,
  showError,
  showWarning,
  hideToast
} = useToast()

const isLoading = ref(false)


const currentUserId = userStore.userInfo.id

// 性别选项
const sexOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 2 }
]

// 计算性别
const sex = computed(() => {
  if (userStore.userInfo.sex === 1) {
    return '男'
  } else if (userStore.userInfo.sex === 2) {
    return '女'
  } else {
    return '未知'
  }
})

// 用户信息数据
const userInfo = ref({
  account: userStore.userInfo.account,
  nickname: userStore.userInfo.nickname,
  sex: userStore.userInfo.sex,
  username: userStore.userInfo.username,
  email: userStore.userInfo.email,
  phone: userStore.userInfo.phone,
  avatar: getSafeImageUrl(userStore.userInfo.avatar),
  oldPassword: '',
  password: ''
})

// 编辑状态
const isEditing = ref(false)

// 文件上传引用
const fileInput = ref(null)

// 保存原始头像用于取消时恢复
const originalAvatar = ref(getSafeImageUrl(userStore.userInfo.avatar))

// 开始编辑
const startEdit = () => {
  isEditing.value = true
  // 保存当前头像状态
  originalAvatar.value = userInfo.value.avatar
}

// 保存编辑 - 原始函数
const _saveEdit = async () => {
  try {
    // 验证密码字段（只有当两个密码字段都有值时才进行密码更新）
    const hasOldPassword = userInfo.value.oldPassword && userInfo.value.oldPassword.trim() !== ''
    const hasNewPassword = userInfo.value.password && userInfo.value.password.trim() !== ''
    
    if (hasOldPassword || hasNewPassword) {
      // 只填了其中一个，提示错误
      if (!hasOldPassword) {
        showError('请输入旧密码')
        return
      }
      if (!hasNewPassword) {
        showError('请输入新密码')
        return
      }
      if (userInfo.value.password.length < 6) {
        showError('新密码长度不能少于6位')
        return
      }
    }

    const postData = {}

    // 先上传图片
    if (fileInput.value && fileInput.value.files[0]) {
      isLoading.value = true

      const formData = new FormData()
      formData.append('avatar', fileInput.value.files[0])
      const res = await uploadAvatarAPI(currentUserId, formData)
      // 得到头像信息
      const postAvatar = res.data.avatar
      postData.avatar = postAvatar
    }

    // 合并数据
    postData.account = userInfo.value.account
    postData.nickname = userInfo.value.nickname
    postData.sex = userInfo.value.sex
    postData.username = userInfo.value.username
    postData.email = userInfo.value.email
    postData.phone = userInfo.value.phone

    // 如果有密码更新，添加密码字段
    if (userInfo.value.oldPassword && userInfo.value.password) {
      postData.oldPassword = userInfo.value.oldPassword
      postData.password = userInfo.value.password
    }

    // 更新用户信息
    const res2 = await updateUserInfoAPI(currentUserId, postData)
    console.log(res2)

    if (res2.code === 200) {
      showSuccess('修改成功')
      // 刷新用户信息
      userStore.userInfo = {
        ...userStore.userInfo,
        ...postData
      }

      // 清空密码字段
      userInfo.value.oldPassword = ''
      userInfo.value.password = ''

      // 更新原始头像
      originalAvatar.value = userInfo.value.avatar

      isEditing.value = false
      isLoading.value = false

    }

  } catch (err) {
    console.log(err.message || '修改失败')
    showError(err.message)
  } finally {
    isLoading.value = false
  }
}

// 使用节流函数包装保存编辑函数，防止多次点击
const saveEdit = throttle(_saveEdit, 2000)

// 取消编辑
const cancelEdit = () => {
  isEditing.value = false
  // 重置密码字段
  userInfo.value.oldPassword = ''
  userInfo.value.password = ''
  // 恢复原始头像
  userInfo.value.avatar = originalAvatar.value
  // 清空文件输入
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

// 处理头像点击 - 原始函数
const _handleAvatarClick = () => {
  if (isEditing.value && fileInput.value) {
    fileInput.value.click()
  }
}

// 使用节流函数包装头像点击，防止多次点击
const handleAvatarClick = throttle(_handleAvatarClick, 500)

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      showError('请选择图片文件')
      return
    }

    // 验证文件大小 (限制为5MB)
    if (file.size > 5 * 1024 * 1024) {
      showError('图片大小不能超过5MB')
      return
    }

    // 创建预览
    const reader = new FileReader()
    reader.onload = (e) => {
      // 直接更新userInfo中的avatar，这样img会立即显示新图片
      userInfo.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <div class="account-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <button v-if="!isEditing" @click="startEdit" class="edit-btn">
        编辑信息
      </button>
      <div v-else class="edit-actions">
        <button @click="saveEdit" class="save-btn">保存</button>
        <button @click="cancelEdit" class="cancel-btn">取消</button>
      </div>
    </div>

    <!-- 用户信息卡片 -->
    <div class="user-info-card">
      <!-- 头像区域 -->
      <div class="avatar-section">
        <div class="avatar-container" @click="handleAvatarClick">
          <!-- 直接使用userInfo.avatar，这样可以显示预览图片 -->
          <img :src="userInfo.avatar" alt="用户头像" class="avatar" />

          <div v-if="isEditing" class="avatar-overlay">
            <span class="change-avatar-text">更换头像</span>
          </div>
          <!-- 隐藏的文件输入框 -->
          <input ref="fileInput" type="file" accept="image/*" @change="handleFileChange" style="display: none;" />
        </div>
      </div>

      <!-- 信息列表 -->
      <div class="info-list">
        <!-- 昵称 -->
        <div class="info-item">
          <label class="info-label">昵称：</label>
          <div class="info-value">
            <input v-if="isEditing" v-model="userInfo.nickname" type="text" class="edit-input" placeholder="请输入昵称" />
            <span v-else class="value-text">{{ userInfo.nickname }}</span>
          </div>
        </div>

        <!-- 邮箱 -->
        <div class="info-item">
          <label class="info-label">邮箱：</label>
          <div class="info-value">
            <input v-if="isEditing" v-model="userInfo.email" type="email" class="edit-input" placeholder="请输入邮箱" />
            <span v-else class="value-text">{{ userInfo.email }}</span>
          </div>
        </div>

        <!-- 手机 -->
        <div class="info-item">
          <label class="info-label">手机：</label>
          <div class="info-value">
            <input v-if="isEditing" v-model="userInfo.phone" type="tel" class="edit-input" placeholder="请输入手机号" />
            <span v-else class="value-text">{{ userInfo.phone }}</span>
          </div>
        </div>

        <!-- 性别 -->
        <div class="info-item">
          <label class="info-label">性别：</label>
          <div class="info-value">
            <Myselect v-if="isEditing" v-model="userInfo.sex" :options="sexOptions" placeholder="请选择性别"
              class="edit-select" />
            <span v-else class="value-text">{{ sex }}</span>
          </div>
        </div>

        <!-- 用户名 -->
        <div class="info-item">
          <label class="info-label">用户名：</label>
          <div class="info-value">
            <input v-if="isEditing" v-model="userInfo.username" type="text" class="edit-input" placeholder="请输入用户名" />
            <span v-else class="value-text">{{ userInfo.username }}</span>
          </div>
        </div>

        <!-- 账号 -->
        <div class="info-item">
          <label class="info-label">账号：</label>
          <div class="info-value">
            <span class="value-text readonly">{{ userInfo.account }}</span>
            <span class="readonly-tip">（账号不可修改）</span>
          </div>
        </div>

        <!-- 旧密码 -->
        <div class="info-item" v-if="isEditing">
          <label class="info-label">旧密码：</label>
          <div class="info-value">
            <input v-model="userInfo.oldPassword" type="password" class="edit-input" placeholder="请输入旧密码" />
          </div>
        </div>

        <!-- 新密码 -->
        <div class="info-item" v-if="isEditing">
          <label class="info-label">新密码：</label>
          <div class="info-value">
            <input v-model="userInfo.password" type="password" class="edit-input" placeholder="请输入新密码" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast组件 -->
  <Toast :toast-type="toastType" :toast-message="toastMessage" :show-toast="showToast" :toast-duration="duration"
    @hide-toast="hideToast" />

  <!-- loading -->
  <loading :is-show="isLoading" />


</template>

<style scoped lang='scss'>
.account-container {
  max-width: 100%;
  margin: 0;
  padding: 0;
  min-height: auto;
}

.page-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;

  .edit-btn {
    border: none;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    padding: 6px 12px;
    background: #FCB700;
    color: #fff;

    &:hover {
      background: #e6a600;
      transform: translateY(-1px);
    }
  }

  .edit-actions {
    display: flex;
    gap: 6px;

    .save-btn {
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 6px 12px;
      background: #FCB700;
      color: #fff;

      &:hover {
        background: #e6a600;
      }
    }

    .cancel-btn {
      border: none;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      padding: 6px 12px;
      background: #fd79a8;
      color: #fff;

      &:hover {
        background: #fc5185;
      }
    }
  }
}

.user-info-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f3f4;

  .avatar-container {
    position: relative;
    cursor: pointer;

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      object-fit: cover;
      transition: all 0.3s ease;
    }

    .avatar-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.6);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;

      .change-avatar-text {
        color: #fff;
        font-size: 10px;
        font-weight: 500;
        text-align: center;
      }
    }

    &:hover .avatar-overlay {
      opacity: 1;
    }
  }
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  .info-item {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 16px;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    min-height: 60px;

    &:hover {
      border-color: #d1d5db;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .info-label {
      width: 80px;
      font-size: 14px;
      font-weight: 500;
      color: #374151;
      flex-shrink: 0;
      margin-right: 12px;
    }

    .info-value {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 6px;

      .value-text {
        font-size: 14px;
        color: #333;
        font-weight: 500;

        &.readonly {
          color: #999;
        }
      }

      .readonly-tip {
        font-size: 12px;
        color: #999;
        font-style: italic;
      }

      .edit-input {
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s ease;
        background: #fff;
        padding: 8px 12px;
        flex: 1;

        &:focus {
          outline: none;
          border-color: #FCB700;
          box-shadow: 0 0 0 2px rgba(252, 183, 0, 0.1);
        }
      }

      .edit-select {
        border: 1px solid #d1d5db;
        border-radius: 6px;
        font-size: 14px;
        transition: border-color 0.2s ease;
        padding: 8px 12px;
        cursor: pointer;
        flex: 1;

        &:focus {
          outline: none;
          border-color: #FCB700;
          box-shadow: 0 0 0 2px rgba(252, 183, 0, 0.1);
        }
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .account-container {
    padding: 0;
  }

  .page-header {
    margin-bottom: 12px;
    padding-bottom: 6px;
  }

  .user-info-card {
    padding: 16px;
  }

  .avatar-section {
    margin-bottom: 16px;

    .avatar-container .avatar {
      width: 70px;
      height: 70px;
    }
  }

  .info-list {
    gap: 12px;

    .info-item {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
      padding: 12px;
      min-height: auto;

      .info-label {
        width: auto;
        font-size: 13px;
        margin-right: 0;
      }

      .info-value {
        width: 100%;

        .edit-input {
          width: 100%;
          font-size: 13px;
        }

        .edit-select {
          font-size: 13px;
          width: 100%;
        }

        .value-text {
          font-size: 13px;
        }
      }
    }
  }
}
</style>