<script setup>
import { reactive, ref } from 'vue'
import Toast from "../../components/Common/Toast.vue"
import { loginAPI } from '../../api/user'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { useToast } from '../../hooks/Common/useToast.js'

// 添加加载状态
const isLoading = ref(false)

const router = useRouter()
const userStore = useUserStore()

// 使用 Toast hook
const { showToast, toastMessage, toastType, duration, showSuccess, showError } = useToast()

// 表单数据
const formData = reactive({
  account: '', // 邮箱或手机号
  password: ''
})

// 验证错误信息
const errors = reactive({
  account: '',
  password: ''
})

// 验证规则
const validateAccount = (account) => {
  if (!account.trim()) {
    return '请输入邮箱或手机号'
  }

  // 检查是否为邮箱格式
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  // 检查是否为手机号格式
  const phoneRegex = /^1[3-9]\d{9}$/

  if (!emailRegex.test(account) && !phoneRegex.test(account)) {
    return '请输入正确的邮箱或11位手机号'
  }
  return ''
}

const validatePassword = (password) => {
  if (!password.trim()) {
    return '密码不能为空'
  }
  if (password.length < 6 || password.length > 16) {
    return '密码长度必须在6-16位之间'
  }
  return ''
}

// 实时验证
const validateField = (field) => {
  switch (field) {
    case 'account':
      errors.account = validateAccount(formData.account)
      break
    case 'password':
      errors.password = validatePassword(formData.password)
      break
  }
}

// 验证整个表单
const validateForm = () => {
  errors.account = validateAccount(formData.account)
  errors.password = validatePassword(formData.password)

  return !errors.account && !errors.password
}

// 提交表单
const handleSubmit = async (event) => {
  event.preventDefault()

  // 验证表单
  if (!validateForm()) {
    showError('请检查表单信息')
    return
  }

  // 开始加载
  isLoading.value = true

  try {
    // 调用登录API
    const result = await loginAPI(formData)

    // 登录成功
    showSuccess(result.message || '登录成功！')

    // 存储用户信息和token
    if (result.data && result.data.token) {
      userStore.setToken(result.data.token)
      userStore.setUserInfo(result.data.user)
    }

    // 跳转到主页或其他页面
    setTimeout(() => {
      router.push('/') // 根据你的路由配置调整
    }, 1500)

  } catch (error) {
    console.error('登录失败:', error)

    // 显示后端返回的具体错误信息
    const errorMessage = error.message || '登录失败，请稍后重试'
    showError(errorMessage)
  } finally {
    // 结束加载
    isLoading.value = false
  }
}
</script>

<template>
  <section class="login flex justify-center">
    <!-- 全屏居中加载动画 -->
    <div v-if="isLoading" class="loading-overlay">
      <span class="loading loading-spinner loading-lg text-primary"></span>
      <p class="loading-text">正在登录中...</p>
    </div>

    <div class="box flex justify-between">
      <div class="left">
      </div>
      <div class="right flex items-center justify-center">
        <form class="flex flex-col gap-4 w-2/3" @submit="handleSubmit">
          <h2 class="text-center text-2xl font-bold mb-6">用户登录</h2>

          <label>
            <div>邮箱/手机号</div>
            <input v-model="formData.account" @blur="validateField('account')" @input="validateField('account')"
              required type="text" placeholder="请输入邮箱或手机号" class="input input-lg validator"
              :class="{ 'input-error': errors.account }" style="outline:none;" />
            <span v-if="errors.account" class="error-message">{{ errors.account }}</span>
          </label>

          <label>
            <div>密码</div>
            <input v-model="formData.password" @blur="validateField('password')" @input="validateField('password')"
              required type="password" placeholder="密码" class="input input-lg validator"
              :class="{ 'input-error': errors.password }" style="outline:none;" maxlength="16" />
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </label>

          <button type="submit" class="btn btn-neutral w-25 login-btn" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner loading-sm mr-2"></span>
            {{ isLoading ? '登录中...' : '立即登录' }}
          </button>

          <p>还没有账号吗？
            <router-link to="/register">前往注册</router-link>
          </p>
        </form>
      </div>
    </div>

    <Toast
      :show-toast="showToast"
      :toast-type="toastType"
      :toast-message="toastMessage"
      :duration="duration"
    />

  </section>
</template>

<style lang="scss" scoped>
/* 全屏加载遮罩层 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;

  .loading {
    width: 3rem;
    height: 3rem;
  }

  .loading-text {
    color: white;
    margin-top: 1rem;
    font-size: 1.1rem;
    font-weight: 500;
  }
}

.login {
  .box {
    height: 100vh;
    width: 100vw;
    background-image: url(../.././assets//register.png);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: left center;
  }

  .left {
    flex: 1;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100%;
      background: linear-gradient(to right,
          rgba(255, 255, 255, 0) 0%,
          rgba(255, 255, 255, 0.3) 50%,
          rgba(255, 255, 255, 0.7) 100%);
      z-index: 1;
    }

    img {
      position: absolute;
      height: 100%;
    }
  }

  .right {
    flex: 1;
    position: relative;
    background: linear-gradient(to right,
        rgba(255, 255, 255, 0.7) 0%,
        rgba(255, 255, 255, 0.9) 30%,
        rgba(255, 255, 255, 1) 60%);

    form {
      h2 {
        color: #333;
        margin-bottom: 2rem;
      }

      label {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-direction: column;
        position: relative;

        div {
          &::after {
            content: '*';
            color: red;
          }

          align-self: start;
          margin-left: 60px;
        }

        input {
          border-radius: 10px;
          width: 400px;

          &.input-error {
            border-color: #ef4444;
            box-shadow: 0 0 0 1px #ef4444;
          }
        }

        .error-message {
          color: #ef4444;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          align-self: start;
          margin-left: 60px;
        }
      }

      .login-btn {
        align-self: center;
        width: 50%;

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      }

      p {
        text-align: center;

        a {
          color: #755FF8;
        }
      }
    }
  }
}

@media (max-width: 768px) {
  .left {
    display: none;
  }

  .right {
    flex: 1;

    form {
      width: 80% !important;

      .login-btn {
        align-self: center;
        width: 80%;
        margin: 0 auto;
      }

      label {
        .error-message {
          margin-left: 0;
          align-self: start;
        }

        div {
          margin-left: 0;
        }
      }
    }
  }
}
</style>