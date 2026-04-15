<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

// 定义props
const props = defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  },
  autoPlay: {
    type: Boolean,
    default: true
  },
  interval: {
    type: Number,
    default: 3000
  },
  showProgress: {
    type: Boolean,
    default: true
  },
  showCounter: {
    type: Boolean,
    default: true
  }
})

const currentSlide = ref(0)
let autoPlayInterval = null
let isScrolling = ref(false)
let scrollTimeout = null

// 计算进度条的值
const progressValue = computed(() => {
  if (props.images.length === 0) return 0
  return ((currentSlide.value + 1) / props.images.length) * 100
})

// 切换到指定幻灯片
const goToSlide = (index) => {
  if (index < 0 || index >= props.images.length) return

  currentSlide.value = index
  isScrolling.value = true

  // 获取轮播图容器和目标元素
  const slideElement = document.getElementById(`slide${index}`)
  const carouselContainer = slideElement?.closest('.carousel')
  
  if (slideElement && carouselContainer) {
    // 计算目标位置
    const slideWidth = slideElement.offsetWidth
    const gap = 16 // space-x-4 对应的间距
    const targetScrollLeft = index * (slideWidth + gap)
    
    // 使用容器的scrollTo方法，避免影响页面滚动
    carouselContainer.scrollTo({
      left: targetScrollLeft,
      behavior: 'smooth'
    })
  }

  // 设置一个延时来重置滚动状态
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
  scrollTimeout = setTimeout(() => {
    isScrolling.value = false
  }, 500)
}

// 下一张图片
const nextSlide = () => {
  const nextIndex = (currentSlide.value + 1) % props.images.length
  goToSlide(nextIndex)
}

// 上一张图片
const prevSlide = () => {
  const prevIndex = (currentSlide.value - 1 + props.images.length) % props.images.length
  goToSlide(prevIndex)
}

// 点击图片切换到下一张
const handleImageClick = () => {
  nextSlide()
}

// 自动播放功能
const startAutoPlay = () => {
  if (!props.autoPlay || props.images.length <= 1) return

  autoPlayInterval = setInterval(() => {
    nextSlide()
  }, props.interval)
}

// 停止自动播放
const stopAutoPlay = () => {
  if (autoPlayInterval) {
    clearInterval(autoPlayInterval)
    autoPlayInterval = null
  }
}

// 监听轮播图滚动事件来更新当前索引（用于手动滚动时同步）
const handleScroll = (event) => {
  // 如果正在程序化滚动，则忽略滚动事件
  if (isScrolling.value) return

  const carousel = event.target
  const itemWidth = carousel.scrollWidth / props.images.length
  const newIndex = Math.round(carousel.scrollLeft / itemWidth)
  const clampedIndex = Math.max(0, Math.min(newIndex, props.images.length - 1))

  // 只有在索引真正改变时才更新
  if (clampedIndex !== currentSlide.value) {
    currentSlide.value = clampedIndex
  }
}

// 组件挂载时开始自动播放
onMounted(() => {
  startAutoPlay()
})

// 组件卸载时清理定时器
onUnmounted(() => {
  stopAutoPlay()
  if (scrollTimeout) {
    clearTimeout(scrollTimeout)
  }
})

// 暴露方法给父组件
defineExpose({
  goToSlide,
  nextSlide,
  prevSlide,
  startAutoPlay,
  stopAutoPlay,
  currentSlide: computed(() => currentSlide.value)
})
</script>

<template>
  <div class="carousel-container" v-if="images.length > 0">
    <!-- 轮播图主体 -->
    <div class="carousel-wrapper">
      <div class="carousel carousel-center rounded-box space-x-4 p-4" @scroll="handleScroll" @mouseenter="stopAutoPlay"
        @mouseleave="startAutoPlay">
        <div v-for="(image, index) in images" :key="index" :id="`slide${index}`" class="carousel-item">
          <img :src="image" :alt="`图片 ${index + 1}`" class="carousel-image rounded-lg" @click="handleImageClick" />
        </div>
      </div>
    </div>

    <!-- 底部导航条 -->
    <div class="carousel-navigation" v-if="showProgress || showCounter">
      <div class="flex flex-col items-center space-y-3">
        <!-- 进度条 -->
        <progress v-if="showProgress" class="progress progress-primary w-80" :value="progressValue"
          max="100"></progress>

        <!-- 当前位置指示器 -->
        <div v-if="showCounter" class="flex items-center">
          <span class="text-sm text-gray-600">
            {{ currentSlide + 1 }} / {{ images.length }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.carousel-container {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: white;

  .carousel-wrapper {
    padding: 20px 0;

    .carousel {
      &::-webkit-scrollbar {
        display: none;
      }

      -ms-overflow-style: none;
      scrollbar-width: none;

      .carousel-item {
        flex: 0 0 auto;

        .carousel-image {
          width: 280px;
          height: 200px;
          object-fit: cover;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          cursor: pointer;

          &:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
          }

          &:active {
            transform: scale(0.98);
          }
        }
      }
    }
  }

  .carousel-navigation {
    padding: 20px;
    background: #f8f9fa;
    border-top: 1px solid #e9ecef;

    // 进度条样式自定义
    .progress {
      height: 8px;

      &::-webkit-progress-bar {
        background-color: #e5e7eb;
        border-radius: 4px;
      }

      &::-webkit-progress-value {
        background-color: #A1A1A1;
        border-radius: 4px;
        transition: width 0.3s ease;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .carousel-container {
    .carousel-navigation {
      .progress {
        width: 100% !important;
      }
    }

    .carousel-wrapper {
      .carousel {
        .carousel-item {
          .carousel-image {
            width: 220px;
            height: 160px;
          }
        }
      }
    }
  }
}
</style>