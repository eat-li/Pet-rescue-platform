<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getNoticeDetailAPI } from '@/api/notice'
import { baseURL } from '../../http/http.js'
import SampleNav from '../../components/Common/SampleNav.vue'
import Loading from '../../components/Common/Loading.vue'

const router = useRouter()
const route = useRoute()
const noticeId = route.params.id

// 公告详情数据
const noticeDetail = ref(null)
const loading = ref(false)
const error = ref(null)

// 获取公告详情
const fetchNoticeDetail = async () => {
  try {
    loading.value = true
    error.value = null
    const res = await getNoticeDetailAPI(noticeId)
    
    if (res.data?.code === 200) {
      noticeDetail.value = res.data.data
    } else {
      error.value = res.data?.message || '获取公告详情失败'
    }
  } catch (err) {
    console.error('获取公告详情失败:', err)
    error.value = '获取公告详情失败，请稍后重试'
  } finally {
    loading.value = false
  }
}

// 获取公告封面图片
const getCoverImage = (notice) => {
  if (!notice) return ''
  if (notice.cover) {
    if (notice.cover.startsWith('http')) {
      return notice.cover
    }
    return baseURL + notice.cover
  }
  // 默认图片
  return 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=1200&h=400&fit=crop'
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

// 返回按钮处理
const handleGoBack = () => {
  router.push('/')
}

onMounted(() => {
  fetchNoticeDetail()
})
</script>

<template>
  <SampleNav />

  <!-- Loading 组件 -->
  <Loading :isShow="loading" />

  <main class="notice-detail" v-if="!loading">
    <!-- 错误提示 -->
    <div v-if="error" class="error-container">
      <div class="error-content">
        <span class="error-icon">⚠️</span>
        <p class="error-message">{{ error }}</p>
        <button class="back-btn" @click="handleGoBack">返回首页</button>
      </div>
    </div>

    <!-- 公告内容 -->
    <div v-else-if="noticeDetail" class="container">
      <!-- 顶部返回按钮 -->
      <section class="back-section">
        <button class="back-button" @click="handleGoBack">
          <i class="fas fa-arrow-left"></i>
          <span>返回首页</span>
        </button>
      </section>

      <!-- 封面图片 -->
      <section class="cover-section">
        <img :src="getCoverImage(noticeDetail)" :alt="noticeDetail.title || '公告封面'" class="cover-image">
        <div class="cover-overlay"></div>
        <div class="cover-content">
          <span class="notice-badge">📢 系统公告</span>
          <h1 class="notice-title">{{ noticeDetail.title }}</h1>
          <div class="notice-meta">
            <span class="publish-time">发布时间：{{ formatDate(noticeDetail.createdAt) }}</span>
          </div>
        </div>
      </section>

      <!-- 公告正文 -->
      <section class="content-section">
        <div class="content-wrapper">
          <div class="notice-content" v-html="noticeDetail.content"></div>
        </div>
      </section>

      <!-- 底部信息 -->
      <section class="footer-section">
        <div class="footer-content">
          <div class="footer-divider"></div>
          <p class="footer-text">感谢您的阅读</p>
          <button class="back-home-btn" @click="handleGoBack">
            <i class="fas fa-home"></i>
            返回首页
          </button>
        </div>
      </section>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-container">
      <div class="empty-content">
        <span class="empty-icon">📭</span>
        <p class="empty-text">公告不存在或已被删除</p>
        <button class="back-btn" @click="handleGoBack">返回首页</button>
      </div>
    </div>
  </main>
</template>

<style lang="scss" scoped>
.notice-detail {
  min-height: 100vh;
  background-color: #f8fafc;
  padding-bottom: 60px;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

// 返回按钮区域
.back-section {
  margin-bottom: 20px;

  .back-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    &:hover {
      background-color: #f9fafb;
      border-color: #d1d5db;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(1px);
    }

    i {
      font-size: 12px;
      color: #6b7280;
    }
  }
}

// 封面区域
.cover-section {
  position: relative;
  width: 100%;
  height: 320px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  .cover-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .cover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      to bottom,
      rgba(0, 0, 0, 0.3) 0%,
      rgba(0, 0, 0, 0.5) 50%,
      rgba(0, 0, 0, 0.7) 100%
    );
  }

  .cover-content {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 30px;
    color: white;
    z-index: 2;

    .notice-badge {
      display: inline-block;
      padding: 4px 12px;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(4px);
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 12px;
    }

    .notice-title {
      font-size: 28px;
      font-weight: 700;
      margin: 0 0 12px 0;
      line-height: 1.3;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .notice-meta {
      font-size: 14px;
      opacity: 0.9;

      .publish-time {
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      }
    }
  }
}

// 内容区域
.content-section {
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;

  .content-wrapper {
    .notice-content {
      font-size: 16px;
      line-height: 1.8;
      color: #374151;

      // 富文本内容样式
      ::v-deep p {
        margin-bottom: 16px;
      }

      ::v-deep h1,
      ::v-deep h2,
      ::v-deep h3,
      ::v-deep h4 {
        margin-top: 24px;
        margin-bottom: 16px;
        color: #1f2937;
      }

      ::v-deep ul,
      ::v-deep ol {
        margin-bottom: 16px;
        padding-left: 24px;
      }

      ::v-deep li {
        margin-bottom: 8px;
      }

      ::v-deep img {
        max-width: 100%;
        border-radius: 8px;
        margin: 16px 0;
      }

      ::v-deep a {
        color: #3b82f6;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }

      ::v-deep blockquote {
        border-left: 4px solid #e5e7eb;
        padding-left: 16px;
        margin: 16px 0;
        color: #6b7280;
      }
    }
  }
}

// 底部区域
.footer-section {
  .footer-content {
    text-align: center;
    padding: 20px 0;

    .footer-divider {
      width: 60px;
      height: 2px;
      background: linear-gradient(90deg, #e5e7eb, #9ca3af, #e5e7eb);
      margin: 0 auto 20px;
    }

    .footer-text {
      color: #9ca3af;
      font-size: 14px;
      margin-bottom: 20px;
    }

    .back-home-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 12px 24px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

      &:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
      }

      i {
        font-size: 14px;
      }
    }
  }
}

// 错误和空状态
.error-container,
.empty-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;

  .error-content,
  .empty-content {
    text-align: center;
    padding: 40px;

    .error-icon,
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
      display: block;
    }

    .error-message,
    .empty-text {
      font-size: 18px;
      color: #6b7280;
      margin-bottom: 24px;
    }

    .back-btn {
      padding: 12px 24px;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        background: #2563eb;
        transform: translateY(-2px);
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .cover-section {
    height: 240px;
    margin-bottom: 20px;

    .cover-content {
      padding: 20px;

      .notice-title {
        font-size: 22px;
      }

      .notice-meta {
        font-size: 12px;
      }
    }
  }

  .content-section {
    padding: 24px;

    .content-wrapper {
      .notice-content {
        font-size: 15px;
      }
    }
  }
}
</style>
