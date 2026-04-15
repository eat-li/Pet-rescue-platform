<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const carouselImages = [
  'https://img.daisyui.com/images/stock/photo-1625726411847-8cbb60cc71e6.webp',
  'https://img.daisyui.com/images/stock/photo-1609621838510-5ad474b7d25d.webp',
  'https://img.daisyui.com/images/stock/photo-1414694762283-acccc27bca85.webp',
  'https://img.daisyui.com/images/stock/photo-1665553365602-b2fb8e5d1707.webp'
]

const currentSlide = ref(0)
const isTransitioning = ref(false)
let autoPlayTimer = null
const autoPlayInterval = 8000 // 8秒切换一次


const getNextIndex = (currentIndex) => {
  return currentIndex === carouselImages.length - 1 ? 0 : currentIndex + 1
}

// 切换到指定幻灯片
const goToSlide = (index) => {
  if (isTransitioning.value || index === currentSlide.value) return

  isTransitioning.value = true
  currentSlide.value = index

  setTimeout(() => {
    isTransitioning.value = false
  }, 800) // 过渡时间

  resetAutoPlay()
}

// 下一张
const nextSlide = () => {
  if (isTransitioning.value) return

  isTransitioning.value = true
  currentSlide.value = getNextIndex(currentSlide.value)

  setTimeout(() => {
    isTransitioning.value = false
  }, 800)

  resetAutoPlay()
}



// 自动播放
const startAutoPlay = () => {
  autoPlayTimer = setInterval(() => {
    if (!isTransitioning.value) {
      nextSlide()
    }
  }, autoPlayInterval)
}

// 停止自动播放
const stopAutoPlay = () => {
  if (autoPlayTimer) {
    clearInterval(autoPlayTimer)
    autoPlayTimer = null
  }
}

// 重置自动播放
const resetAutoPlay = () => {
  stopAutoPlay()
  startAutoPlay()
}

// 组件挂载时开始自动播放
onMounted(() => {
  startAutoPlay()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoPlay()
})
</script>

<template>
  <section class="relative overflow-hidden" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
    <div class="carousel w-full relative">
      <!-- 轮播容器 - 所有图片叠加显示 -->
      <div class="carousel-container">
        <div v-for="(item, index) in carouselImages" :key="index" class="carousel-slide absolute inset-0" :class="{
          'active': index === currentSlide,
          'fade-out': isTransitioning && index === currentSlide,
          'fade-in': isTransitioning && index === currentSlide
        }">
          <div class="image-container w-full h-full overflow-hidden">
            <img :src="item" class="carousel-image w-full h-full object-cover"
              :class="{ 'zoom-active': index === currentSlide }" />
            <!-- 添加遮罩层 -->
            <div class="image-overlay"></div>
          </div>
        </div>
      </div>

      <!-- 中心内容层 -->
      <div class="carousel-content absolute inset-0 flex items-center justify-center z-10">
        <div class="text-center text-white px-4">
          <h1 class="carousel-title text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
            宠物养护，轻松掌握
          </h1>
          <p class="carousel-subtitle text-lg md:text-xl lg:text-2xl mb-8 opacity-90">
            我们提供先进的宠物管理系统，帮助您管理宠物的每个部分，让您的宠物过上更健康的生活。
          </p>
          <div class="carousel-buttons flex flex-col sm:flex-row gap-4 justify-center">
            <button
              class="carousel-btn carousel-btn-primary px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300">
              联系我们
            </button>
            <button
              class="carousel-btn carousel-btn-secondary px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300">
              立即体验
            </button>
          </div>
        </div>
      </div>


    </div>

    <!-- 圆点导航 -->
    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-30">
      <button v-for="(item, index) in carouselImages" :key="index" @click="goToSlide(index)" :disabled="isTransitioning"
        class="carousel-dot transition-all duration-300 ease-in-out" :class="{
          'active': index === currentSlide,
          'opacity-50 cursor-not-allowed': isTransitioning
        }">
      </button>
    </div>
  </section>
</template>

<style scoped>
/* 轮播图容器 */
.carousel {
  height: 500px;
  background-color: #464343;
  margin-bottom: 0;
  /* 确保没有额外的底部间距 */
}

/* 为整个轮播图section添加底部间距 */
section {
  margin-bottom: 20px;
}

/* 轮播容器 */
.carousel-container {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: #1a1a1a;
  /* 确保容器也有深色背景 */
}

/* 单个轮播项 */
.carousel-slide {
  opacity: 0;
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  background-color: #1a1a1a;
  /* 每个幻灯片也设置深色背景 */
}

/* 当前活动的幻灯片 */
.carousel-slide.active {
  opacity: 1;
  z-index: 2;
}

/* 淡出效果 - 增加暗化 */
.carousel-slide.fade-out {
  opacity: 0;
  transition: all 3s ease-out;
}

/* 淡出时的额外遮罩 */
.carousel-slide.fade-out .image-overlay {
  background-color: rgba(0, 0, 0, 0.8);
  /* 切换时更暗 */
}

/* 淡入效果 */
.carousel-slide.fade-in {
  opacity: 1;
  transition: all 3s ease-in;
}

/* 淡入时的遮罩 */
.carousel-slide.fade-in .image-overlay {
  background-color: rgba(0, 0, 0, 0.7);
  /* 淡入时稍微暗一些 */
}

/* 图片容器 */
.image-container {
  position: relative;
  overflow: hidden;
}

/* 图片遮罩层 */
.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  /* 增加到60%透明度 */
  z-index: 1;
  pointer-events: none;
  transition: background-color 0.8s ease;
  /* 添加平滑过渡 */
}

/* 淡出时的额外遮罩 */
.carousel-slide.fade-out .image-overlay {
  background-color: rgba(0, 0, 0, 0.9);
  /* 淡出时更暗 */
}

/* 淡入时的遮罩 */
.carousel-slide.fade-in .image-overlay {
  background-color: rgba(0, 0, 0, 0.8);
  /* 淡入时也比较暗 */
}

/* 图片基础样式 */
.carousel-image {
  transition: transform 6s ease-in-out;
  transform: scale(1);
}

/* 当前活动图片的缩放效果 */
.carousel-image.zoom-active {
  transform: scale(1.05);
}

/* 悬停效果 */
.carousel-slide:hover .carousel-image {
  transform: scale(1.08) !important;
  transition: transform 3s ease-in-out;
}

/* 圆点基础样式 */
.carousel-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  border: 2px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 圆点悬停效果 */
.carousel-dot:hover:not(:disabled) {
  background-color: rgba(255, 255, 255, 0.8);
  transform: scale(1.1);
}

/* 活动状态的圆点样式 */
.carousel-dot.active {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #fff;
  border-color: #fff;
}


/* 交叉淡入淡出动画 */
@keyframes crossFade {
  0% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

/* 平滑的透明度过渡 */
.carousel-slide {
  will-change: opacity;
  backface-visibility: hidden;
}

/* 中心内容层 */
.carousel-content {
  pointer-events: none;
  /* 允许点击穿透到下层元素 */
}

.carousel-content>div {
  pointer-events: auto;
  /* 恢复内容区域的点击事件 */
}

/* 标题样式 */
.carousel-title {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  line-height: 1.2;
}

/* 副标题样式 */
.carousel-subtitle {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
  max-width: 600px;
  margin: 0 auto 2rem;
  line-height: 1.5;
}

/* 按钮容器 */
.carousel-buttons {
  gap: 1rem;
}

/* 按钮基础样式 */
.carousel-btn {
  min-width: 140px;
  cursor: pointer;
  border: 2px solid transparent;
  text-shadow: none;
  font-weight: 600;
}

/* 主要按钮样式 */
.carousel-btn-primary {
  background: linear-gradient(135deg, #ff6b35, #f7931e);
  color: white;
  border-color: #ff6b35;
}

.carousel-btn-primary:hover {
  background: linear-gradient(135deg, #e55a2b, #e8851a);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 107, 53, 0.4);
}

/* 次要按钮样式 */
.carousel-btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.carousel-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.2);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .carousel {
    height: 300px;
  }

  .carousel-dot {
    width: 10px;
    height: 10px;
  }

  .carousel-dot.active {
    width: 20px;
    height: 20px;
    border-radius: 10px;
  }



  .carousel-title {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }

  .carousel-subtitle {
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
    padding: 0 1rem;
  }

  .carousel-btn {
    min-width: 120px;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .carousel {
    height: 250px;
  }

  .absolute.left-5 {
    left: 0.75rem;
  }

  .absolute.right-5 {
    right: 0.75rem;
  }

  .carousel-title {
    font-size: 2rem;
  }

  .carousel-subtitle {
    font-size: 1rem;
  }

  .carousel-buttons {
    flex-direction: column;
    align-items: center;
  }

  .carousel-btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>