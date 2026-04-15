<script setup>
import Carousel from './components/Carousel.vue'
import SysNotice from './components/SysNotice.vue'
import DataView from './components/DataView.vue'
import PetHot from './components/PetHot.vue'
import PetAdopt from './components/PetAdopt.vue'
import PetService from './components/PetService.vue'
import Question from './components/Question.vue'
import CopyRight from './components/CopyRight.vue'
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