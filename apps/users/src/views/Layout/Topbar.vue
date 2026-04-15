<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { baseURL } from '../../http/http'
import throttle from '../../utils/throttle'



const router = useRouter()
const userStore = useUserStore()

// 虹吸式导航栏状态
const isNavbarVisible = ref(true)
const lastScrollY = ref(0)
const scrollThreshold = 100 // 滚动阈值

// 滚动处理函数
const handleScroll = () => {
  const currentScrollY = window.scrollY

  // 向下滚动且超过阈值时隐藏导航栏
  if (currentScrollY > lastScrollY.value && currentScrollY > scrollThreshold) {
    isNavbarVisible.value = false
  }
  // 向上滚动时显示导航栏
  else if (currentScrollY < lastScrollY.value) {
    isNavbarVisible.value = true
  }
  // 滚动到顶部时始终显示
  else if (currentScrollY <= 50) {
    isNavbarVisible.value = true
  }

  lastScrollY.value = currentScrollY
}


// 节流后的滚动处理函数
const throttledHandleScroll = throttle(handleScroll, 16) // 约60fps

// 生命周期钩子
onMounted(() => {
  window.addEventListener('scroll', throttledHandleScroll, { passive: true })
  lastScrollY.value = window.scrollY
})

onUnmounted(() => {
  window.removeEventListener('scroll', throttledHandleScroll)
})

// 点击登录按钮跳转登录页
const GoLogin = () => {
  router.push('/login')
}
// 点击注册按钮跳转注册页
const GoRegister = () => {
  router.push('/register')
}

const scrollToNotice = () => {
  const ele = document.getElementById('sys-notice')
  if (ele) {
    ele.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}
const scrollToQuestion = () => {
  const ele = document.getElementById('question')
  if (ele) {
    ele.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }
}


// 优化登录状态判断逻辑
const isLogin = computed(() => {
  return !!(userStore.token && (userStore.userInfo && Object.keys(userStore.userInfo).length > 0))
})

// 获取用户名显示
const userName = computed(() => {
  return userStore.userInfo?.name || userStore.userInfo?.username || '用户'
})

// 模态框状态管理
const showLogoutModal = ref(false)

// 点击退出登录 - 显示确认模态框
const goLoginOut = () => {
  showLogoutModal.value = true
  // 显示模态框
  const modal = document.getElementById('logoutModal')
  if (modal) {
    modal.showModal()
  }
}

// 确认退出登录
const confirmLogout = () => {
  userStore.clearAuth()
  router.push('/login')
  showLogoutModal.value = false
  // 关闭模态框
  const modal = document.getElementById('logoutModal')
  if (modal) {
    modal.close()
  }
}

// 取消退出登录
const cancelLogout = () => {
  showLogoutModal.value = false
  // 关闭模态框
  const modal = document.getElementById('logoutModal')
  if (modal) {
    modal.close()
  }
}

// 跳转到个人中心
const goProfile = () => {
  router.push('/profile')
}

// 跳转到我的宠物
const goMyPets = () => {
  router.push('/pet')
}
</script>

<template>
  <section class="navbar bg-base-100 shadow-sm fixed z-100 transition-transform duration-300 ease-in-out" :class="{
    'navbar-hidden': !isNavbarVisible,
    'navbar-visible': isNavbarVisible
  }">
    <!-- 汉堡菜单和logo -->
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </div>
        <!-- 修改汉堡菜单下拉内容 -->
        <ul tabindex="0"
          class="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-64 max-w-[calc(100vw-2rem)] p-3 shadow-lg border mobile-menu">
          <li><a class="hover:bg-orange-50 hover:text-orange-600 py-3 px-4 text-base" @click="scrollToNotice">最新公告</a>
          </li>
          <li><a class="hover:bg-orange-50 hover:text-orange-600 py-3 px-4 text-base" @click="router.push('/adopt')">宠物领养</a></li>
          <li><a class="hover:bg-orange-50 hover:text-orange-600 py-3 px-4 text-base">寻宠地图</a></li>
          <li><a class="hover:bg-orange-50 hover:text-orange-600 py-3 px-4 text-base" @click="router.push('/service')">宠物服务</a></li>
          <!-- 登录状态下的移动端菜单 -->
          <template v-if="isLogin">
            <div class="divider my-2"></div>
            <li><a class="hover:bg-orange-50 hover:text-orange-600 py-3 px-4 text-base" @click="goMyPets">我的宠物</a></li>
            <li><a class="hover:bg-orange-50 hover:text-orange-600 py-3 px-4 text-base" @click="goProfile">个人中心</a></li>
            <li><a class="hover:bg-red-50 hover:text-red-600 py-3 px-4 text-base" @click="goLoginOut">退出登录</a></li>
          </template>
          <!-- 未登录状态下的移动端登录注册按钮 -->
          <template v-if="!isLogin">
            <div class="divider my-2"></div>
            <li><a class="hover:bg-orange-50 hover:text-orange-600 py-3 px-4 text-base font-medium"
                @click="GoLogin">登录</a></li>
            <li><a class="hover:bg-orange-50 hover:text-orange-600 py-3 px-4 text-base font-medium"
                @click="GoRegister">注册</a></li>
          </template>
        </ul>
      </div>
      <a class="btn btn-ghost text-xl font-bold">
        <span class="text-orange-500">🐾</span>
        <span class="text-gray-800">Pet Service</span>
      </a>
    </div>

    <!-- 中间菜单 -->
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1 gap-5">
        <li><a class="text-gray-900 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
            @click="scrollToNotice">最新公告</a></li>
        <li><router-link to="/adopt"
            class="text-gray-900 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300">宠物领养</router-link>
        </li>
        <li><router-link to="/posts"
            class="text-gray-900 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300">宠物社区</router-link>
        </li>
        <li><router-link to="/service"
            class="text-gray-900 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300">宠物服务</router-link>
        </li>
        <li><a
            class="text-gray-900 hover:text-orange-500 hover:bg-orange-50 transition-all duration-300"
            @click="scrollToQuestion">常见问题</a>
        </li>

      </ul>
    </div>

    <!-- 右侧登录和注册按钮/用户信息 -->
    <div class="navbar-end">
      <section class="flex justify-evenly gap-2 lg:gap-4 items-center">
        <!-- 未登录状态 -->
        <template v-if="!isLogin">
          <button @click="GoLogin"
            class="btn btn-outline btn-sm lg:btn-md text-orange-500 border-orange-500 hover:bg-orange-500 hover:text-white transition-all duration-300 w-20 lg:w-28 hidden sm:flex">
            登录
          </button>
          <button @click="GoRegister"
            class="btn btn-sm lg:btn-md bg-orange-500 text-white hover:bg-orange-600 border-none shadow-md transition-all duration-300 w-20 lg:w-28 hidden sm:flex">
            注册
          </button>
        </template>

        <!-- 登录状态 -->
        <template v-else>
          <!-- 欢迎信息 -->
          <div class="hidden lg:flex items-center gap-2 mr-3">
            <span class="text-sm text-gray-600">欢迎，</span>
            <span class="text-sm font-medium text-orange-600">{{ userName }}</span>
          </div>

          <!-- 用户头像下拉菜单 -->
          <div class="dropdown dropdown-hover dropdown-end">
            <div tabindex="0" role="button"
              class="flex items-center gap-2 hover:bg-orange-50 rounded-lg p-2 transition-all duration-300">
              <div class="avatar">
                <div class="mask mask-squircle w-10">
                  <img :src="baseURL + userStore.userInfo.avatar" alt="用户头像" />
                </div>
              </div>
              <!-- 桌面端显示用户名 -->
              <span class="hidden lg:block text-sm font-medium text-gray-700">{{ userName }}</span>
              <!-- 下拉箭头 -->
              <svg class="w-4 h-4 text-gray-500 hidden lg:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
            <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-40 p-2 shadow-lg border">
              <li><a @click="goProfile" class="hover:bg-orange-50 hover:text-orange-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  个人中心
                </a></li>
              <li><a @click="goMyPets" class="hover:bg-orange-50 hover:text-orange-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z">
                    </path>
                  </svg>
                  我的宠物
                </a></li>
              <div class="divider my-1"></div>
              <li><a @click="goLoginOut" class="hover:bg-red-50 hover:text-red-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1">
                    </path>
                  </svg>
                  退出登录
                </a></li>
            </ul>
          </div>
        </template>
      </section>
    </div>
  </section>

  <!-- 退出登录确认模态框 -->
  <dialog id="logoutModal" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box">
      <h3 class="text-lg font-bold text-gray-800">确认退出</h3>
      <p class="py-4 text-gray-600">您确定要退出登录吗？退出后需要重新登录才能使用相关功能。</p>
      <div class="modal-action">
        <button class="btn btn-ghost" @click="cancelLogout">取消</button>
        <button class="btn btn-error" @click="confirmLogout">确认退出</button>
      </div>
    </div>
    <!-- 点击背景关闭模态框 -->
    <form method="dialog" class="modal-backdrop">
      <button @click="cancelLogout">close</button>
    </form>
  </dialog>

</template>

<style scoped lang="scss">
// 虹吸式导航栏动画
.navbar {
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);

  &.navbar-visible {
    transform: translateY(0);
    opacity: 1;
  }

  &.navbar-hidden {
    transform: translateY(-100%);
    opacity: 0;
  }
}

// 鼠标悬停时强制显示导航栏
.navbar:hover {
  transform: translateY(0) !important;
  opacity: 1 !important;
}

// 移动端汉堡菜单样式优化
.mobile-menu {
  // 确保菜单不会超出屏幕
  left: 0 !important;
  right: auto !important;
  transform: none !important;

  // 在小屏幕上调整菜单位置
  @media (max-width: 640px) {
    width: calc(100vw - 2rem) !important;
    max-width: 280px;
    left: 1rem !important;
  }

  // 菜单项样式
  li a {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-height: 48px;
    display: flex;
    align-items: center;

    // 确保文字不会被截断
    @media (max-width: 640px) {
      font-size: 16px;
      padding: 12px 16px;
    }
  }
}

// 用户头像下拉菜单定位修复
.dropdown-content {
  // 移除之前的居中样式，使用默认的右对齐
  left: auto !important;
  transform: none !important;

  // 确保在移动端不会超出屏幕
  @media (max-width: 640px) {
    right: 0;
    width: auto;
    min-width: 160px;
    max-width: calc(100vw - 2rem);
  }
}

// 用户头像悬停效果
.dropdown:hover .avatar {
  transform: scale(1.05);
  transition: transform 0.2s ease;
}

// 下拉菜单项图标样式
.dropdown-content li a {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;

  svg {
    flex-shrink: 0;
  }
}

// 移动端按钮优化
@media (max-width: 640px) {
  .navbar-end {
    .btn {
      font-size: 14px;
      padding: 0.5rem 0.75rem;
    }
  }
}

// 平滑滚动优化
@media (prefers-reduced-motion: reduce) {
  .navbar {
    transition: none;
  }
}

// 高对比度模式支持
@media (prefers-contrast: high) {
  .navbar {
    background-color: white;
    border-bottom: 2px solid black;
  }
}
</style>
