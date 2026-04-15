<script setup>
import { useRouter } from 'vue-router'
import { computed } from 'vue'
import { useUserStore } from '../../stores/user'

// 获取用户登录信息
const userStore = useUserStore()
// 使用计算属性来判断登录状态
const isLogin = computed(() => {
  return !!userStore.token // 使用双重否定确保返回布尔值
})

const router = useRouter()

const Props = defineProps({
  //跳转页面
  to: {
    type: String,
    default: '/createpost'
  }
})


// 按钮点击事件逻辑
const handleClick = () => {
  if (isLogin) {
    router.push(Props.to)
  } else {
    router.push('/login')
  }

  // 可添加更多逻辑，如显示模态框等
}
</script>

<template>
  <button class="my-button" @click="handleClick">
    +
  </button>
</template>

<style scoped lang="scss">
.my-button {
  /* 基础样式 */
  position: fixed;
  bottom: 20px;
  right: 30px;
  border-radius: 100%;
  border: none;
  color: white;
  font-size: 28px;
  font-weight: bold;
  cursor: pointer;
  z-index: 50;

  /* 自定义渐变背景 - 使用#605DFF和#1447E6 */
  background: linear-gradient(135deg, #605DFF 0%, #1447E6 100%);

  /* 阴影效果 - 匹配渐变色调 */
  box-shadow: 0 4px 15px rgba(96, 93, 255, 0.3);

  /* 过渡动画 */
  transition: all 0.3s ease;

  /* 响应式尺寸 */
  width: clamp(50px, 8vw, 70px);
  height: clamp(50px, 8vw, 70px);

  /* 悬停效果 */
  &:hover {
    /* 加深的渐变效果 */
    background: linear-gradient(135deg, #524FFF 0%, #0A3BC8 100%);

    /* 轻微放大 */
    transform: scale(1.08);

    /* 增强阴影 */
    box-shadow: 0 6px 20px rgba(96, 93, 255, 0.4);
  }

  /* 点击效果 */
  &:active {
    transform: scale(0.95);
  }

  /* 聚焦效果（提升可访问性） */
  &:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(96, 93, 255, 0.5);
  }
}

/* 针对不同屏幕尺寸的微调 */
@media (max-width: 640px) {
  .my-button {
    bottom: 16px;
    right: 16px;
  }
}

@media (min-width: 1280px) {
  .my-button {
    bottom: 24px;
    right: 36px;
  }
}
</style>
