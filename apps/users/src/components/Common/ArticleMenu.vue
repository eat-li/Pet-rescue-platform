<script setup>
import { ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'

// 获取用户登录信息
const userStore = useUserStore()

// 使用计算属性来判断登录状态
const isLogin = computed(() => {
  return !!userStore.token // 使用双重否定确保返回布尔值
})

const Props = defineProps({
  title: {
    type: String,
    default: '萌宠分享社区'
  },
  list: {
    type: Array,
    default: () => []
  },
  person: {
    type: Array,
    default: () => []
  }
})

// 定义事件发射
const emit = defineEmits(['menu-click', 'person-click'])

// 用于跟踪选中的菜单项
const activeItem = ref(null)
const activePersonItem = ref(null)

// 处理主菜单项点击事件
const handleItemClick = (item) => {
  activeItem.value = item
  activePersonItem.value = null // 清除个人菜单选中状态
  emit('menu-click', item)

}

// 处理个人菜单项点击事件
const handlePersonClick = (item) => {
  activePersonItem.value = item
  activeItem.value = null // 清除主菜单选中状态
  console.log(item)
  emit('person-click', item)

}
</script>

<template>
  <main class="w-full h-full flex items-center justify-center">
    <div class="menu-card" :class="cardClass">
      <!-- 左侧导航菜单 -->
      <div class="menu-sidebar">
        <!-- 菜单标题插槽 -->
        <div class="menu-title">
          <h3 class="title text-2xl text-gray-950 text-center">
            {{ title }}
          </h3>
        </div>

        <!-- 菜单列表插槽 -->
        <div class="menu-list">
          <!-- 菜单列表 -->
          <ul class="flex flex-col">
            <li
              class="menu-item flex items-center justify-start h-10 w-full px-4 py-2 rounded-2xl"
              :class="{ 'active': activeItem === item }" v-for="item in list" @click="handleItemClick(item)">
              <span class="icon mr-3">
                <component v-if="typeof item.icon === 'object'" :is="item.icon" :size="18" />
                <template v-else>{{ item.icon }}</template>
              </span>
              <span>{{ item.title }}</span>
            </li>
          </ul>

          <!-- 菜单分割线 -->
          <div class="menu-section-title" style="padding: 20px 16px;
    border-bottom: 1px solid #e0e0e0;"></div>

          <!-- 我的互动列表 -->
          <ul class="flex flex-col" v-if="isLogin">
            <li
              class="menu-item flex items-center justify-start h-10 w-full px-4 py-2 rounded-2xl"
              :class="{ 'active': activePersonItem === item }" v-for="item in person" @click="handlePersonClick(item)">
              <span class="icon mr-3">
                <component v-if="typeof item.icon === 'object'" :is="item.icon" :size="18" />
                <template v-else>{{ item.icon }}</template>
              </span>
              <span>{{ item.title }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="menu-content">
        <!-- 内容主体 -->
        <div class="content-body">
          <slot name="body"></slot>
        </div>

        <!-- 内容头部 -->
        <div class="content-bottom">
          <h2 class="content-title">
            <slot name="bottom"></slot>
          </h2>
        </div>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.menu-card {
  margin-top: 40px;
  color: #6b7280;
  display: flex;
  width: 80%;
  max-width: 1200px;
  min-height: 80vh;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #f3f4f6;
  background: #ffffff;

  /* 导航 */
  .menu-sidebar {
    width: 240px;
    background: #ffffff;
    display: flex;
    flex-direction: column;
    padding: 0;
    border-right: 1px solid #f3f4f6;
    flex-shrink: 0;
  }

  .menu-title {
    padding: 28px 20px 20px;

    .title {
      font-size: 20px !important;
      font-weight: 700 !important;
      color: #1a1a2e !important;
      text-align: left !important;
    }
  }

  .menu-list {
    flex: 1;
    padding: 8px 12px;
  }

  .menu-item {
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 4px;
    font-size: 14px;
    color: #6b7280;

    &:hover {
      background: #fff7ed;
      color: #f97316;
    }

    &.active {
      background: linear-gradient(135deg, #fff7ed, #ffedd5);
      color: #ea580c;
      font-weight: 600;
    }
  }

  .menu-section-title {
    padding: 16px 16px !important;
    border-bottom: 1px solid #f3f4f6 !important;
  }

  /* 内容 */
  .menu-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    min-width: 0;
  }

  /* 底部 */
  .content-bottom {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f9fafb;
    border-top: 1px solid #f3f4f6;
    flex-shrink: 0;
  }

  .content-title {
    margin: 0;
    font-size: 16px;
  }

  .content-body {
    flex: 1;
    padding: 20px;
    background: #f9fafb;
    overflow-y: auto;
    overflow-x: hidden;
  }
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .menu-card {
    flex-direction: column;
    width: 95%;
    min-height: auto;
    margin-top: 20px;
    border-radius: 20px;
  }

  .menu-sidebar {
    width: 100% !important;
    border-right: none !important;
    border-bottom: 1px solid #f3f4f6;
  }

  .menu-title {
    padding: 16px 16px 12px;

    .title {
      font-size: 18px !important;
    }
  }

  .menu-list {
    padding: 4px 12px;
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    &::-webkit-scrollbar {
      display: none;
    }

    ul {
      flex-direction: row;
      gap: 6px;
    }

    .menu-item {
      min-width: auto;
      height: 36px;
      padding: 8px 14px;
      font-size: 13px;
      white-space: nowrap;
      margin-top: 0;

      .icon {
        margin-right: 6px;
      }
    }
  }

  .menu-section-title {
    display: none !important;
  }

  .content-body {
    padding: 16px;
  }

  .content-bottom {
    height: 56px;

    .content-title {
      font-size: 14px;
    }
  }
}
</style>