<script setup>
import {ref} from  'vue'

const props = defineProps({
  isShow: {
    type: Boolean,
    default: true
  }
})
</script>

<template>
  <section v-if="props.isShow">
    <span class="loading loading-ball loading-xl text-info" v-for="item in 5"></span>
  </section>
</template>

<style scoped>
section{
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>