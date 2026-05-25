<script setup>
import { ref, markRaw } from 'vue'
import PersonMenu from '../../components/Common/PersonMenu.vue'
import SampleNav from '../../components/Common/SampleNav.vue'
import { HomeIcon, CartIcon, ClipboardIcon, PawIcon } from '../../components/Icons'

// 菜单配置
const menuList = ref([
  {
    title: '个人信息',
    icon: markRaw(HomeIcon),
    type: 'account'
  },
  {
    title: '我的购物车',
    icon: markRaw(CartIcon),
    type: 'cart'
  },
  {
    title: '我的订单',
    icon: markRaw(ClipboardIcon),
    type: 'myOrders'
  },
  {
    title: '我的领养',
    icon: markRaw(PawIcon),
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