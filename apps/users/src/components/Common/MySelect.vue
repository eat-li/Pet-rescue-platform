<template>
  <div class="my-select" ref="selectRef">
    <div 
      class="select-display" 
      :class="{ 'focused': isOpen, 'disabled': disabled }"
      @click="toggleDropdown"
    >
      <span class="select-text">{{ displayText }}</span>
      <span class="dropdown-arrow" :class="{ 'open': isOpen }">▼</span>
    </div>
    
    <transition name="dropdown">
      <div v-if="isOpen" class="dropdown-options">
        <div 
          v-for="option in options" 
          :key="option.value"
          class="dropdown-option"
          :class="{ 
            'selected': modelValue === option.value,
            'highlighted': highlightedIndex === options.indexOf(option)
          }"
          @click="selectOption(option)"
          @mouseenter="highlightedIndex = options.indexOf(option)"
        >
          {{ option.label }}
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'

// Props定义
const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  options: {
    type: Array,
    required: true,
    default: () => []
  },
  placeholder: {
    type: String,
    default: '请选择'
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

// Emits定义
const emit = defineEmits(['update:modelValue', 'change'])

// 响应式数据
const isOpen = ref(false)
const selectRef = ref(null)
const highlightedIndex = ref(-1)

// 计算属性
const displayText = computed(() => {
  const selectedOption = props.options.find(option => option.value === props.modelValue)
  return selectedOption ? selectedOption.label : props.placeholder
})

// 方法
const toggleDropdown = () => {
  if (props.disabled) return
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    highlightedIndex.value = props.options.findIndex(option => option.value === props.modelValue)
  }
}

const selectOption = (option) => {
  emit('update:modelValue', option.value)
  emit('change', option)
  isOpen.value = false
  highlightedIndex.value = -1
}

const closeDropdown = () => {
  isOpen.value = false
  highlightedIndex.value = -1
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (!isOpen.value) {
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
      event.preventDefault()
      toggleDropdown()
    }
    return
  }

  switch (event.key) {
    case 'Escape':
      event.preventDefault()
      closeDropdown()
      break
    case 'ArrowDown':
      event.preventDefault()
      highlightedIndex.value = Math.min(highlightedIndex.value + 1, props.options.length - 1)
      break
    case 'ArrowUp':
      event.preventDefault()
      highlightedIndex.value = Math.max(highlightedIndex.value - 1, 0)
      break
    case 'Enter':
      event.preventDefault()
      if (highlightedIndex.value >= 0) {
        selectOption(props.options[highlightedIndex.value])
      }
      break
  }
}

// 点击外部关闭下拉框
const handleClickOutside = (event) => {
  if (selectRef.value && !selectRef.value.contains(event.target)) {
    closeDropdown()
  }
}

// 生命周期
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleKeydown)
})

// 监听modelValue变化
watch(() => props.modelValue, () => {
  highlightedIndex.value = -1
})
</script>

<style scoped>
.my-select {
  position: relative;
  width: 100%;
}

.select-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 20px;

  &:hover:not(.disabled) {
    border-color: #FCB700;
  }

  &.focused {
    border-color: #FCB700;
    box-shadow: 0 0 0 2px rgba(252, 183, 0, 0.1);
  }

  &.disabled {
    background-color: #f9fafb;
    color: #9ca3af;
    cursor: not-allowed;
    border-color: #e5e7eb;
  }

  .select-text {
    flex: 1;
    text-align: left;
    color: #374151;
  }

  .dropdown-arrow {
    margin-left: 8px;
    transition: transform 0.2s ease;
    color: #6b7280;
    font-size: 12px;

    &.open {
      transform: rotate(180deg);
    }
  }
}

.dropdown-options {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  border-radius: 0 0 6px 6px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;

  .dropdown-option {
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    color: #374151;

    &:hover,
    &.highlighted {
      background-color: #f3f4f6;
    }

    &.selected {
      background-color: #FCB700;
      color: white;

      &:hover,
      &.highlighted {
        background-color: #e6a600;
      }
    }

    &:last-child {
      border-radius: 0 0 6px 6px;
    }
  }
}

/* 下拉动画 */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 滚动条样式 */
.dropdown-options::-webkit-scrollbar {
  width: 6px;
}

.dropdown-options::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.dropdown-options::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.dropdown-options::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>