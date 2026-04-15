<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNoticeListAPI } from '@/api/notice'
import { baseURL } from '../../../http/http.js'

const router = useRouter()

// 公告列表数据
const noticeList = ref([])
const loading = ref(false)

// 获取公告列表
const fetchNotices = async () => {
  try {
    loading.value = true
    const res = await getNoticeListAPI({ page: 1, limit: 6, status: 'true' })
    // 后端返回的数据结构: { code, message, data: { notices, pagination } }
    if (res.data?.code === 200) {
      noticeList.value = res.data.data?.notices || []
    } else {
      noticeList.value = []
    }
  } catch (error) {
    console.error('获取公告列表失败:', error)
    noticeList.value = []
  } finally {
    loading.value = false
  }
}

// 获取公告封面图片
const getCoverImage = (notice) => {
  if (notice.cover) {
    // 如果cover已经是完整URL，直接返回
    if (notice.cover.startsWith('http')) {
      return notice.cover
    }
    // 否则拼接baseURL
    return baseURL + notice.cover
  }
  // 默认图片
  const defaultImages = [
    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&h=400&fit=crop',
    'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=600&h=400&fit=crop'
  ]
  return defaultImages[notice.id % defaultImages.length]
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 截取内容摘要
const getSummary = (content) => {
  if (!content) return ''
  // 去除HTML标签
  const plainText = content.replace(/<[^>]+>/g, '')
  // 截取前100个字符
  return plainText.length > 100 ? plainText.slice(0, 100) + '...' : plainText
}

// 跳转到公告详情页
const goToNoticeDetail = (id) => {
  router.push(`/notice/${id}`)
}

// 页面首次加载则，请求数据
onMounted(() => {
  fetchNotices()
})
</script>

<template>
  <!-- System Features Section -->
  <section class="sys-notice-section" id="sys-notice">
    <!-- 加载状态 -->
    <div v-if="loading" class="box-container">
      <div v-for="i in 6" :key="i" class="notice-card skeleton-card">
        <div class="skeleton-bg"></div>
      </div>
    </div>

    <!-- 数据展示 -->
    <div v-else-if="noticeList.length > 0" class="box-container">
      <div class="notice-card" v-for="item in noticeList" :key="item.id" @click="goToNoticeDetail(item.id)">
        <!-- 背景图片 -->
        <div class="card-background">
          <img :src="getCoverImage(item)" alt="公告背景" class="background-img" />
          <!-- 渐变遮罩 -->
          <div class="gradient-overlay"></div>
        </div>

        <!-- 卡片内容 -->
        <div class="card-content">
          <!-- 标题 -->
          <h3 class="card-title">{{ item.title }}</h3>

          <!-- 描述文字 -->
          <p class="card-description">{{ getSummary(item.content) }}</p>

          <!-- 底部信息 -->
          <div class="card-footer">
            <div class="card-meta">
              <span class="date">{{ formatDate(item.createdAt) }}</span>
            </div>
            <button class="view-detail-btn">
              <span class="btn-text">查看详情</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="box-container empty-container">
      <div class="empty-state">
        <span>📢</span>
        <p>暂无系统公告</p>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.sys-notice-section {
  width: 100%;
  background: #fafbfc;
  padding: 60px 20px;
  box-sizing: border-box;
}

.box-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(570px, 1fr));
  gap: 20px;
}

.notice-card {
  position: relative;
  width: 100%;
  height: 200px;
  border-radius: 16px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);

    .background-img {
      transform: scale(1.05);
    }

    .view-detail-btn {
      background: rgba(255, 255, 255, 0.95);
      transform: translateY(-2px);
    }
  }
}

.card-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.background-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.gradient-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg,
      rgba(0, 0, 0, 0.7) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.6) 100%);
  z-index: 2;
}

.card-content {
  position: relative;
  z-index: 3;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 12px 0;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-description {
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 16px;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  opacity: 0.8;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
}

.date {
  font-weight: 400;
}

.view-detail-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.85);
  color: #333;
  border: none;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.btn-text {
  font-size: 12px;
}

// 骨架屏样式
.skeleton-card {
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  cursor: default;

  &:hover {
    transform: none;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }
}

.skeleton-bg {
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #e8e8e8 25%, #f0f0f0 50%, #e8e8e8 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// 空状态样式
.empty-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;

  span {
    font-size: 48px;
    margin-bottom: 16px;
  }

  p {
    font-size: 16px;
    color: #9ca3af;
    margin: 0;
  }
}

// 响应式设计
@media (max-width: 768px) {
  .box-container {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 16px;
  }

  .notice-card {
    height: 180px;

    &:hover {
      transform: translateY(-2px);
    }
  }

  .card-content {
    padding: 16px;
  }

  .card-title {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .card-description {
    font-size: 12px;
    -webkit-line-clamp: 2;
  }

  .card-footer {
    margin-top: 12px;
  }
}

@media (max-width: 480px) {
  .notice-card {
    height: 160px;
  }

  .card-title {
    font-size: 15px;
    -webkit-line-clamp: 1;
  }

  .card-description {
    -webkit-line-clamp: 2;
  }
}
</style>
