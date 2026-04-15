<script setup>
import { reactive, ref } from 'vue'
import { registerAPI } from '../../api/user'
import { useRouter } from 'vue-router'
import Toast from "../../components/Common/Toast.vue"
import { useToast } from '../../hooks/Common/useToast.js'

// 添加加载状态
const isLoading = ref(false)

const router = useRouter()

// 使用 Toast hook
const { showToast, toastMessage, toastType, duration, showSuccess, showError } = useToast()

// 表单数据
const formData = reactive({
  username: '',
  email: '',
  phone: '',
  password: ''
})

// 验证错误信息
const errors = reactive({
  username: '',
  email: '',
  phone: '',
  password: ''
})

// 验证规则
const validateUsername = (username) => {
  if (!username.trim()) {
    return '用户名不能为空'
  }
  if (username.length > 10) {
    return '用户名不能超过10个字符'
  }
  return ''
}

const validateEmail = (email) => {
  if (!email.trim()) {
    return '邮箱不能为空'
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return '请输入正确的邮箱格式'
  }
  return ''
}

const validatePhone = (phone) => {
  if (!phone.trim()) {
    return '手机号不能为空'
  }
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    return '请输入正确的11位中国手机号'
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
    case 'username':
      errors.username = validateUsername(formData.username)
      break
    case 'email':
      errors.email = validateEmail(formData.email)
      break
    case 'phone':
      errors.phone = validatePhone(formData.phone)
      break
    case 'password':
      errors.password = validatePassword(formData.password)
      break
  }
}

// 验证整个表单
const validateForm = () => {
  errors.username = validateUsername(formData.username)
  errors.email = validateEmail(formData.email)
  errors.phone = validatePhone(formData.phone)
  errors.password = validatePassword(formData.password)

  return !errors.username && !errors.email && !errors.phone && !errors.password
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
    // 调用注册API
    const result = await registerAPI(formData)

    // 注册成功
    showSuccess(result.message || '注册成功！')

    // 可以跳转到登录页面
    setTimeout(() => {
      router.push('/login')
    }, 2000)

  } catch (error) {
    console.error('注册失败:', error)

    // 显示后端返回的具体错误信息
    const errorMessage = error.message || '注册失败，请稍后重试'
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
      <p class="loading-text">正在注册中...</p>
    </div>

    <div class="box flex justify-between">
      <div class="left">
      </div>
      <div class="right flex items-center justify-center">
        <form class="flex flex-col gap-4 w-2/3" @submit="handleSubmit">
          <h2 class="text-center text-2xl font-bold mb-6">用户注册</h2>

          <label>
            <div>用户名</div>
            <input v-model="formData.username" @blur="validateField('username')" @input="validateField('username')"
              required type="text" placeholder="用户名（最多10个字符）" class="input input-lg validator"
              :class="{ 'input-error': errors.username }" style="outline:none;" />
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </label>

          <label>
            <div>邮箱</div>
            <input v-model="formData.email" @blur="validateField('email')" @input="validateField('email')" required
              type="email" placeholder="请输入邮箱地址" class="input input-lg validator"
              :class="{ 'input-error': errors.email }" style="outline:none;" />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </label>

          <label>
            <div>手机号</div>
            <input v-model="formData.phone" @blur="validateField('phone')" @input="validateField('phone')" required
              type="tel" placeholder="请输入11位手机号" class="input input-lg validator"
              :class="{ 'input-error': errors.phone }" style="outline:none;" maxlength="11" />
            <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
          </label>

          <label>
            <div>密码</div>
            <input v-model="formData.password" @blur="validateField('password')" @input="validateField('password')"
              required type="password" placeholder="密码（6-16位）" class="input input-lg validator"
              :class="{ 'input-error': errors.password }" style="outline:none;" maxlength="16" />
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </label>

          <button type="submit" class="btn btn-neutral w-25 register" :disabled="isLoading">
            <span v-if="isLoading" class="loading loading-spinner loading-sm mr-2"></span>
            {{ isLoading ? '注册中...' : '点击注册' }}
          </button>

          <p>已经有账号了吗？
            <router-link to="login">前往登录</router-link>
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

      .register {
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

      .register {
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