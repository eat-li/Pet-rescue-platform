<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()


const Props = defineProps({
  title: {
    type: String,
    default: '个人中心'
  },
  list: {
    type: Array,
    default: () => []
  }
})
const activeItem = ref(null)

const handleItemClick = (item) => {
  activeItem.value = item
  // 路由跳转
  router.push({ name: item.type })

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
              class="menu-item flex items-center justify-start h-10 w-full px-4 py-2 rounded-2xl hover:bg-gradient-to-l from-white to-purple-200"
              :class="{ 'active': activeItem === item }" v-for="item in list" @click="handleItemClick(item)">
              <i class="icon mr-3">{{ item.icon }}</i>
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

<style scoped>
.menu-card {
  transform: translateY(10%);
  color: #989CA4;

  display: flex;
  width: 80%;
  height: 80vh;
  border-radius: 40px;
  overflow: hidden;

  /* 导航 */
  .menu-sidebar {
    width: 250px;
    background-color: #F7F7F7;
    display: flex;
    flex-direction: column;
    padding: 0;
    border-top-left-radius: 40px;
    border-bottom-left-radius: 40px;
  }

  .menu-title {
    padding: 20px 16px;
    border-bottom: 1px solid #e0e0e001;
  }

  .menu-list {
    flex: 1;
    padding: 8px 0;
  }

  .menu-item {
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 12px;
  }

  /* 确保子元素不会超出圆角边界 */
  .menu-item.active {
    background: linear-gradient(to left, white, #d8b4fe);
    color: #7c3aed;
    font-weight: 500;
  }

  /* 内容 */
  .menu-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-top-right-radius: 40px;
    border-bottom-right-radius: 40px;
    overflow: hidden;
  }

  /* 头部 */
  .content-bottom {
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #F7F7F7;
  }

  .content-title {
    margin: 0;
    font-size: 18px;
  }

  .content-body {
    flex: 1;
    padding: 20px;
    background-color: #F7F7F7;
    overflow-y: auto;
    /* 添加垂直滚动 */
    overflow-x: hidden;
    /* 隐藏水平滚动条 */
  }
}

/* 移动端响应式设计 */
@media (max-width: 768px) {
  .menu-card {
    flex-direction: column;
    width: 95%;
    height: 90vh;
    transform: translateY(5%);
    border-radius: 20px;
  }

  .menu-sidebar {
    width: 100% !important;
    height: 200px;
    border-radius: 20px 20px 0 0 !important;
    border-bottom: 1px solid #e0e0e0;
  }

  .menu-content {
    border-radius: 0 0 20px 20px !important;
  }

  .menu-title {
    padding: 15px 16px;

    .title {
      font-size: 1.25rem !important;
    }
  }

  .menu-list {
    padding: 4px 0;
    display: flex;
    flex-direction: row;
    overflow-x: auto;

    ul {
      flex-direction: row;
      gap: 8px;
      padding: 0 16px;
    }

    .menu-item {
      min-width: 120px;
      height: 36px;
      padding: 8px 12px;
      font-size: 14px;

      .icon {
        margin-right: 8px;
      }
    }
  }

  .menu-section-title {
    display: none;
  }

  .content-body {
    padding: 15px;
    overflow-y: auto;
    /* 移动端也支持滚动 */
    overflow-x: hidden;
  }

  .content-bottom {
    height: 60px;

    .content-title {
      font-size: 16px;
    }
  }
}
</style>