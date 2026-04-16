<script setup>
import { ref } from 'vue'
import PersonMenu from '../../components/Common/PersonMenu.vue'
import SampleNav from '../../components/Common/SampleNav.vue'

// 菜单配置
const menuList = ref([
  {
    title: '个人信息',
    icon: '🏠',
    type: 'account'
  },
  {
    title: '我的购物车',
    icon: '🛒',
    type: 'cart'
  },
  {
    title: '我的订单',
    icon: '📋',
    type: 'myOrders'
  },
  {
    title: '我的领养',
    icon: '🐾',
    type: 'myAdoptions'
  },
])

</script>

<template>
  <SampleNav />
  <PersonMenu title="个人中心" :list="menuList">
    <template #body>
      <router-view></router-view>
    </template>

  </PersonMenu>
</template>

<style scoped></style>