<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  showToast: {
    type: Boolean,
    default: false
  },
  toastMessage: {
    type: String,
    default: ''
  },
  toastType: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 2000 // 自动消失时间，单位ms
  }
})

// 添加emit事件
const emit = defineEmits(['hide-toast'])

// 控制动画状态，避免直接依赖props导致的动画问题
const isVisible = ref(props.showToast)

// 监听showToast变化，控制动画显示
watch(() => props.showToast, (newVal) => {
  isVisible.value = newVal

  // 如果显示，则设置自动消失
  if (newVal) {
    setTimeout(() => {
      isVisible.value = false
      // 通知父组件隐藏Toast
      emit('hide-toast')
    }, props.duration)
  }
})
</script>

<template>
  <transition name="toast-transition">
    <div class="toast toast-top toast-end" v-if="isVisible">
      <div class="alert" :class="{
          'alert-success': props.toastType === 'success',
          'alert-error': props.toastType === 'error',
          'alert-warning': props.toastType === 'warning'
        }">
        <span>{{ props.toastMessage }}</span>
      </div>
    </div>
  </transition>
</template>

<style scoped>
/* 基础Toast样式 */
.toast {
  position: fixed;
  padding: 1rem;
  z-index: 1000;
}

.toast-top.toast-end {
  top: 3rem;
  right: 1rem;
}

.alert {
  padding: 0.75rem 1.25rem;
  border-radius: 0.375rem;
  color: white;
  min-width: 200px;
}

/* 不同类型的提示样式 */
.alert-success {
  background-color: #10b981; /* 绿色 */
}

.alert-error {
  background-color: #ef4444; /* 红色 */
}

.alert-warning {
  background-color: #f59e0b; /* 黄色 */
}

/* 动画效果 */
.toast-transition-enter-from,
.toast-transition-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

.toast-transition-enter-active,
.toast-transition-leave-active {
  transition: all 0.3s ease-out;
}

.toast-transition-enter-to,
.toast-transition-leave-from {
  transform: translateX(0);
  opacity: 1;
}
</style>
