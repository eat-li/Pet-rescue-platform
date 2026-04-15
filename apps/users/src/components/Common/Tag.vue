<script setup>
import { computed } from 'vue'

// 定义组件属性
const props = defineProps({
  tags: {
    type: Array,
    default: () => []
  },
  title: {
    type: String,
    default: '相关标签'
  },
  randomColors: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

// 定义事件
const emit = defineEmits(['tag-click'])

// DaisyUI 主题色系
const themeColors = ['default', 'primary', 'secondary', 'accent', 'info', 'success', 'warning', 'error']

// 为每个标签随机分配颜色或使用预设颜色
const tagsWithColors = computed(() => {
  return props.tags.map(tag => ({
    ...tag,
    color: props.randomColors 
      ? themeColors[Math.floor(Math.random() * themeColors.length)]
      : tag.color || 'default'
  }))
})

// 标签点击处理
const handleTagClick = (tag) => {
  emit('tag-click', tag)
}
</script>

<template>
  <section class="tags">
    <h3 v-if="title" class="tags-title">{{ title }}</h3>
    <div class="tags-container">
      <button 
        v-for="tag in tagsWithColors" 
        :key="tag.id" 
        :class="['tag-btn', `tag-${tag.color}`, `tag-${size}`]"
        @click="handleTagClick(tag)"
      >
        <span class="tag-icon">#</span>
        <span class="tag-name">{{ tag.name }}</span>
      </button>
    </div>
  </section>
</template>

<style lang='scss' scoped>
.tags {
  width: 100%;

  .tags-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
    letter-spacing: -0.025em;
  }

  .tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;

    .tag-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      border: none;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: -0.025em;
      outline: none;
      position: relative;
      overflow: hidden;

      // 现代化的微妙阴影
      box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

      .tag-icon {
        font-weight: 600;
        opacity: 0.8;
      }

      .tag-name {
        white-space: nowrap;
        font-weight: 500;
      }

      // 尺寸变体
      &.tag-small {
        padding: 4px 8px;
        font-size: 11px;

        .tag-icon {
          font-size: 10px;
        }
      }

      &.tag-medium {
        padding: 6px 12px;
        font-size: 12px;

        .tag-icon {
          font-size: 11px;
        }
      }

      &.tag-large {
        padding: 8px 16px;
        font-size: 13px;

        .tag-icon {
          font-size: 12px;
        }
      }

      // 现代化扁平色彩系统
      &.tag-default {
        background-color: #f8fafc;
        color: #475569;

        &:hover {
          background-color: #f1f5f9;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
      }

      &.tag-primary {
        background-color: #eff6ff;
        color: #2563eb;

        &:hover {
          background-color: #dbeafe;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06);
        }
      }

      &.tag-secondary {
        background-color: #f8fafc;
        color: #64748b;

        &:hover {
          background-color: #f1f5f9;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(100, 116, 139, 0.1), 0 2px 4px -1px rgba(100, 116, 139, 0.06);
        }
      }

      &.tag-accent {
        background-color: #fdf2f8;
        color: #db2777;

        &:hover {
          background-color: #fce7f3;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(219, 39, 119, 0.1), 0 2px 4px -1px rgba(219, 39, 119, 0.06);
        }
      }

      &.tag-info {
        background-color: #f0f9ff;
        color: #0284c7;

        &:hover {
          background-color: #e0f2fe;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.1), 0 2px 4px -1px rgba(2, 132, 199, 0.06);
        }
      }

      &.tag-success {
        background-color: #f0fdf4;
        color: #16a34a;

        &:hover {
          background-color: #dcfce7;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(22, 163, 74, 0.1), 0 2px 4px -1px rgba(22, 163, 74, 0.06);
        }
      }

      &.tag-warning {
        background-color: #fffbeb;
        color: #d97706;

        &:hover {
          background-color: #fef3c7;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(217, 119, 6, 0.1), 0 2px 4px -1px rgba(217, 119, 6, 0.06);
        }
      }

      &.tag-error {
        background-color: #fef2f2;
        color: #dc2626;

        &:hover {
          background-color: #fee2e2;
          transform: translateY(-1px);
          box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.1), 0 2px 4px -1px rgba(220, 38, 38, 0.06);
        }
      }

      // 点击效果
      &:active {
        transform: translateY(0);
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      }

      // 焦点状态
      &:focus-visible {
        outline: 2px solid #3b82f6;
        outline-offset: 2px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .tags {
    .tags-title {
      font-size: 14px;
      margin-bottom: 10px;
    }

    .tags-container {
      gap: 6px;

      .tag-btn {
        &.tag-small {
          padding: 3px 6px;
          font-size: 10px;

          .tag-icon {
            font-size: 9px;
          }
        }

        &.tag-medium {
          padding: 4px 8px;
          font-size: 11px;

          .tag-icon {
            font-size: 10px;
          }
        }

        &.tag-large {
          padding: 6px 12px;
          font-size: 12px;

          .tag-icon {
            font-size: 11px;
          }
        }
      }
    }
  }
}

// 暗色模式支持 - 使用更好看的配色
@media (prefers-color-scheme: dark) {
  .tags {
    .tags-title {
      color: #f9fafb;
    }
    
    .tags-container {
      .tag-btn {
        &.tag-default {
          background-color: #1e293b;
          color: #e2e8f0;
          
          &:hover {
            background-color: #334155;
          }
        }
        
        &.tag-primary {
          background-color: #1e3a8a;
          color: #93c5fd;
          
          &:hover {
            background-color: #1d4ed8;
          }
        }
        
        &.tag-secondary {
          background-color: #1e293b;
          color: #94a3b8;
          
          &:hover {
            background-color: #334155;
          }
        }
        
        &.tag-accent {
          background-color: #831843;
          color: #f9a8d4;
          
          &:hover {
            background-color: #be185d;
          }
        }
        
        &.tag-info {
          background-color: #0c4a6e;
          color: #7dd3fc;
          
          &:hover {
            background-color: #0284c7;
          }
        }
        
        &.tag-success {
          background-color: #14532d;
          color: #86efac;
          
          &:hover {
            background-color: #16a34a;
          }
        }
        
        &.tag-warning {
          background-color: #92400e;
          color: #fcd34d;
          
          &:hover {
            background-color: #d97706;
          }
        }
        
        &.tag-error {
          background-color: #991b1b;
          color: #fca5a5;
          
          &:hover {
            background-color: #dc2626;
          }
        }
      }
    }
  }
}
</style>