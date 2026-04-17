<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const activeTab = ref('home')

const navigateTo = (route, tab) => {
  activeTab.value = tab
  router.push(route)
}
</script>

<template>
  <nav class="sample-nav">
    <div class="nav-container">
      <!-- Logo/品牌名 -->
      <div class="nav-brand">
        <h2>Pet Platform</h2>
      </div>

      <!-- 导航菜单 -->
      <div class="nav-menu">
        <button class="nav-item" :class="{ active: activeTab === 'home' }" @click="navigateTo('/', 'home')">
          <i class="icon">🏠</i>
          <span>主页</span>
        </button>

        <button class="nav-item" :class="{ active: activeTab === 'profile' }"
          @click="navigateTo('/profile', 'profile')">
          <i class="icon">👤</i>
          <span>用户信息</span>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.sample-nav {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 60px;
}

.nav-brand h2 {
  margin: 0;
  color: #333;
  font-size: 20px;
  font-weight: 600;
}

.nav-menu {
  display: flex;
  gap: 20px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  background: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #666;
  font-size: 14px;
}

.nav-item:hover {
  background-color: #f5f5f5;
  color: #333;
}

.nav-item.active {
  background-color: #e3f2fd;
  color: #1976d2;
}

.nav-item .icon {
  font-size: 16px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .nav-container {
    padding: 0 15px;
    height: 50px;
  }

  .nav-brand h2 {
    font-size: 18px;
  }

  .nav-menu {
    gap: 10px;
  }

  .nav-item {
    padding: 6px 12px;
    font-size: 12px;
  }

  .nav-item .icon {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .nav-brand h2 {
    font-size: 16px;
  }

  .nav-item span {
    display: none;
  }

  .nav-item {
    padding: 8px;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    justify-content: center;
  }
}
</style>