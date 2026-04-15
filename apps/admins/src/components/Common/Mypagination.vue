<template>
  <div class="my-pagination">
    <!-- 左侧：显示总条数信息 -->
    <div class="pagination-info">
      <span class="info-text">
        Showing {{ startItem }} to {{ endItem }} of {{ totalItems }} results
      </span>
    </div>
    
    <!-- 右侧：翻页按钮 -->
    <div class="pagination-controls">
      <button 
        class="pagination-btn prev-btn"
        :class="{ disabled: isFirstPage }"
        :disabled="isFirstPage"
        @click="handlePrevious"
      >
        <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
        </svg>
        Previous
      </button>
      
      <button 
        class="pagination-btn next-btn"
        :class="{ disabled: isLastPage }"
        :disabled="isLastPage"
        @click="handleNext"
      >
        Next
        <svg class="btn-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props 定义
const props = defineProps({
  // 当前页码
  currentPage: {
    type: Number,
    default: 1
  },
  // 每页条数
  pageSize: {
    type: Number,
    default: 10
  },
  // 总条数
  totalItems: {
    type: Number,
    default: 0
  }
})

// Events 定义
const emit = defineEmits(['page-change'])

// 计算属性
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.pageSize)
})

const isFirstPage = computed(() => {
  return props.currentPage <= 1
})

const isLastPage = computed(() => {
  return props.currentPage >= totalPages.value
})

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.pageSize + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.pageSize
  return end > props.totalItems ? props.totalItems : end
})

// 方法
const handlePrevious = () => {
  if (!isFirstPage.value) {
    emit('page-change', props.currentPage - 1)
  }
}

const handleNext = () => {
  if (!isLastPage.value) {
    emit('page-change', props.currentPage + 1)
  }
}
</script>

<style scoped lang="scss">
.my-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-top: 1px solid #e5e7eb;
  margin-top: 20px;
}

.pagination-info {
  .info-text {
    font-size: 14px;
    color: #6b7280;
    font-weight: 400;
  }
}

.pagination-controls {
  display: flex;
  gap: 8px;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover:not(.disabled) {
    background-color: #f9fafb;
    border-color: #9ca3af;
    color: #111827;
  }
  
  &:active:not(.disabled) {
    background-color: #f3f4f6;
    transform: translateY(1px);
  }
  
  &.disabled {
    color: #9ca3af;
    background-color: #f9fafb;
    border-color: #e5e7eb;
    cursor: not-allowed;
    
    .btn-icon {
      opacity: 0.5;
    }
  }
  
  .btn-icon {
    width: 16px;
    height: 16px;
    transition: opacity 0.2s ease;
  }
}

.prev-btn {
  .btn-icon {
    margin-right: 2px;
  }
}

.next-btn {
  .btn-icon {
    margin-left: 2px;
  }
}

// 响应式设计
@media (max-width: 640px) {
  .my-pagination {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .pagination-controls {
    justify-content: center;
  }
  
  .pagination-info {
    text-align: center;
  }
}
</style>