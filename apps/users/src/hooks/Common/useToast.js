import { ref } from 'vue'

// 全局 Toast 状态
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('')
const duration = ref(2000)

// 定时器引用
let hideTimer = null

export const useToast = () => {
  // 清除之前的定时器
  const clearTimer = () => {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
  }

  // 显示成功提示
  const showSuccess = (message, customDuration = 2000) => {
    clearTimer()
    toastMessage.value = message
    toastType.value = 'success'
    duration.value = customDuration
    showToast.value = true
    
    // 设置自动隐藏
    hideTimer = setTimeout(() => {
      hideToast()
    }, customDuration)
  }

  // 显示错误提示
  const showError = (message, customDuration = 2000) => {
    clearTimer()
    toastMessage.value = message
    toastType.value = 'error'
    duration.value = customDuration
    showToast.value = true
    
    // 设置自动隐藏
    hideTimer = setTimeout(() => {
      hideToast()
    }, customDuration)
  }

  // 显示警告提示
  const showWarning = (message, customDuration = 2000) => {
    clearTimer()
    toastMessage.value = message
    toastType.value = 'warning'
    duration.value = customDuration
    showToast.value = true
    
    // 设置自动隐藏
    hideTimer = setTimeout(() => {
      hideToast()
    }, customDuration)
  }

  // 隐藏提示
  const hideToast = () => {
    clearTimer()
    showToast.value = false
  }

  // 通用显示方法
  const showToastMessage = (message, type = 'success', customDuration = 2000) => {
    clearTimer()
    toastMessage.value = message
    toastType.value = type
    duration.value = customDuration
    showToast.value = true
    
    // 设置自动隐藏
    hideTimer = setTimeout(() => {
      hideToast()
    }, customDuration)
  }

  return {
    // 状态
    showToast,
    toastMessage,
    toastType,
    duration,
    // 方法
    showSuccess,
    showError,
    showWarning,
    hideToast,
    showToastMessage
  }
}