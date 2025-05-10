<script setup>
import topbar from '@/views/layout/components/topbar.vue';
import footerbar from '@/views/layout/components/footerbar.vue';
</script>


<template>
  <!-- todo1 顶部导航 -->
  <topbar />
  <!-- 主要逻辑出口 -->
  <router-view></router-view>
  <!-- todo2 底部介绍 -->
  <footerbar />
</template>

<style lang="scss" scoped></style>