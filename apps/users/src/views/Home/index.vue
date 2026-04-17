<script setup>
import { defineAsyncComponent, onMounted, ref, provide, readonly } from 'vue'
import { getArticleListAPI } from '@/api/article'
import { getAdoptionListAPI } from '@/api/adoption'
import { getServiceListAPI } from '@/api/service'
import { getNoticeListAPI } from '@/api/notice'
import { getPetCountAPI } from '@/api/pet'
import { getUserCountAPI } from '@/api/user'

// 首屏立即加载的组件（用户进入页面就能看到）
import Carousel from './components/Carousel.vue'
import SysNotice from './components/SysNotice.vue'

// 非首屏组件懒加载（用户滚动后才能看到）
const DataView = defineAsyncComponent(() => import('./components/DataView.vue'))
const PetHot = defineAsyncComponent(() => import('./components/PetHot.vue'))
const PetAdopt = defineAsyncComponent(() => import('./components/PetAdopt.vue'))
const PetService = defineAsyncComponent(() => import('./components/PetService.vue'))
const Question = defineAsyncComponent(() => import('./components/Question.vue'))
const CopyRight = defineAsyncComponent(() => import('./components/CopyRight.vue'))

// 首页数据状态（用于传递给子组件）
const homeData = ref({
  notices: [],
  articles: [],
  adoptions: [],
  services: [],
  petCount: 0,
  userCount: 0,
  loading: true
})

// 使用 provide 将数据共享给所有子组件
provide('homeData', readonly(homeData))

// 并行请求所有首页数据
const fetchHomeData = async () => {
  homeData.value.loading = true
  try {
    // 使用 Promise.all 并行请求所有API
    const [noticesRes, articlesRes, adoptionsRes, servicesRes, petCountRes, userCountRes] = await Promise.all([
      getNoticeListAPI({ page: 1, limit: 6, status: 'true' }),
      getArticleListAPI({ page: 1, limit: 4 }),
      getAdoptionListAPI({ page: 1, limit: 4, status: 'pending' }),
      getServiceListAPI({ page: 1, limit: 4, status: 'true' }),
      getPetCountAPI(),
      getUserCountAPI()
    ])

    // 处理公告数据
    if (noticesRes.data?.code === 200) {
      homeData.value.notices = noticesRes.data.data?.notices || []
    }

    // 处理文章数据
    homeData.value.articles = (articlesRes?.data?.articles || []).slice(0, 4)

    // 处理领养数据
    homeData.value.adoptions = adoptionsRes?.adoptions || []

    // 处理服务数据
    homeData.value.services = servicesRes?.data?.data?.services || []

    // 处理统计数据
    homeData.value.petCount = petCountRes?.data || 0
    homeData.value.userCount = userCountRes?.data || 0

  } catch (error) {
    console.error('获取首页数据失败:', error)
  } finally {
    homeData.value.loading = false
  }
}

onMounted(() => {
  fetchHomeData()
})
</script>

<template>
  <main class="min-h-screen">
    <!-- 轮播图 -->
    <Carousel />
    <!-- 系统公告 -->
    <SysNotice />
    <!-- 数据展示 -->
    <DataView />
    <!-- 热门帖子 -->
    <PetHot />
    <!-- 宠物领养 -->
    <PetAdopt />
    <!-- 宠物服务 -->
    <PetService />
    <!-- 相关问题 -->
    <Question />
    <!-- 版权信息 -->
    <CopyRight />
  </main>
</template>

<style scoped></style>