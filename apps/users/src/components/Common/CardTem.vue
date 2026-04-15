<script setup>
const Props = defineProps({
  title: {
    type: String,
    default: '默认标题'
  },

})


</script>


<template>
  <div class="card">
    <div class="card-header">
      <h3 class="card-title">{{ title }}</h3>
    </div>
    <div class="card-content">
      <!-- 提交表单内容 -->
      <slot name="form"></slot>
    </div>
  </div>
</template>

<style scoped>
.card {
  width: 80%;
  transform: translateY(20px);
  height: 2000px;
  margin: 0 auto;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);

  .card-header {
    height: 60px;
    background-color: #fff;
    border-radius: 10px 10px 0 0;

    .card-title {
      font-size: 24px;
      font-weight: bold;
      color: #333;
      padding: 20px;

    }
  }
}
</style>
