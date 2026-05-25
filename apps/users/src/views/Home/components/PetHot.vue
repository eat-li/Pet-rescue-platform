<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getArticleListAPI } from '@/api/article'
import { baseURL } from '../../../http/http.js'
import { formatImageUrl } from '../../../utils/imgformat.js'
import { FireIcon, HeartIcon } from '../../../components/Icons'

const router = useRouter()

// 尝试从父组件获取共享数据
const homeData = inject('homeData', null)

const activeIndex = ref(0)
const articleList = ref([])
const loading = ref(false)

// 桌面端才使用鼠标悬停效果
const handleMouseEnter = (index) => {
  if (window.innerWidth > 768) {
    activeIndex.value = index
  }
}

// 跳转到帖子页面
const goToPosts = () => {
  router.push('/posts')
}

// 获取文章列表（按点赞数排序取前4条）
const fetchArticles = async () => {
  // 如果父组件已提供数据，直接使用
  if (homeData && homeData.articles && homeData.articles.length > 0) {
    articleList.value = homeData.articles
    return
  }
  
  // 兼容独立使用的情况，自己请求数据
  try {
    loading.value = true
    const res = await getArticleListAPI({ page: 1, limit: 4 })
    articleList.value = (res?.data?.articles || []).slice(0, 4)
  } catch {
    articleList.value = []
  } finally {
    loading.value = false
  }
}

// 监听父组件数据变化
watch(
  () => homeData?.articles,
  (newArticles) => {
    if (newArticles && newArticles.length > 0) {
      articleList.value = newArticles
      loading.value = false
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 如果父组件没有提供数据，自己请求
  if (!homeData || !homeData.articles || homeData.articles.length === 0) {
    fetchArticles()
  }
})

// 安全获取文章封面图
const getCoverImage = (article) => {
  if (article.images && article.images.length > 0) {
    return formatImageUrl(article.images[0])
  }
  return ''
}

// 安全获取用户头像
const getAvatarUrl = (avatar) => {
  return formatImageUrl(avatar)
}

// 去除 HTML 标签，截取纯文本摘要
const stripHtml = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]+>/g, '').slice(0, 60)
}
</script>

<template>
  <!-- Hot Posts Section -->
  <section class="hot-section">
    <!-- 区块标题 -->
    <div class="section-header">
      <div class="header-left">
        <span class="section-badge">
          <FireIcon :size="16" color="#f97316" />
          热门
        </span>
        <h2 class="section-title">热门帖子</h2>
        <p class="section-sub">发现社区最受欢迎的宠物故事</p>
      </div>
      <button class="view-more-btn" @click="goToPosts">
        <span>查看更多</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <!-- 骨架屏 -->
    <div v-if="loading" class="pet-container">
      <ul class="petlist">
        <li v-for="i in 4" :key="i" class="petitem skeleton-item"></li>
      </ul>
    </div>

    <!-- 内容 -->
    <div v-else-if="articleList.length > 0" class="pet-container">
      <ul class="petlist">
        <li
          v-for="(item, index) in articleList"
          :key="item.id"
          class="petitem"
          :class="{ active: activeIndex === index }"
          @mouseenter="handleMouseEnter(index)"
          @click="router.push(`/posts/${item.id}`)"
        >
          <!-- 背景图片 -->
          <img
            v-if="getCoverImage(item)"
            :src="getCoverImage(item)"
            :alt="item.title"
            loading="lazy"
            class="petitem-bg-img"
          />
          <div v-else class="petitem-bg-gradient"></div>
          <!-- 用户信息 -->
          <div class="myinfo">
            <img
              class="myinfo-avatar"
              :src="getAvatarUrl(item.user?.avatar)"
              :alt="item.user?.nickname"
              loading="lazy"
              @error="(e) => e.target.style.display = 'none'"
            />
            <span class="myinfo-name">{{ item.user?.nickname || '匿名用户' }}</span>
          </div>

          <!-- 热度标签 -->
          <div class="hot-badge">
            <HeartIcon :size="12" color="#fff" />
            <span>{{ item.star || 0 }}</span>
          </div>

          <!-- 底部内容区域 -->
          <div class="content-bottom">
            <div class="content-overlay">
              <h3 class="post-title">{{ item.title }}</h3>
              <p class="post-content">{{ stripHtml(item.content) }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <p>暂无热门帖子</p>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.hot-section {
  width: 100%;
  background: #ffffff;
  padding: 60px 20px;
  box-sizing: border-box;

  // 区块标题
  .section-header {
    max-width: 1200px;
    margin: 0 auto 24px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;

    .header-left {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .section-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #fff7ed, #ffedd5);
      color: #f97316;
      border: 1px solid #fed7aa;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 13px;
      font-weight: 600;
      width: fit-content;
    }

    .section-title {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0;
      line-height: 1.2;
    }

    .section-sub {
      font-size: 14px;
      color: #9ca3af;
      margin: 0;
    }

    .view-more-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      background: #fff;
      border: 1.5px solid #e5e7eb;
      border-radius: 25px;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;
      flex-shrink: 0;

      svg { transition: transform 0.3s ease; }

      &:hover {
        background: #f97316;
        border-color: #f97316;
        color: #fff;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(249, 115, 22, 0.3);
        svg path { stroke: #fff; }
      }
    }
  }

  // 手风琴列表
  .pet-container {
    max-width: 1200px;
    margin: 0 auto;

    ul.petlist {
      display: flex;
      align-items: stretch;
      gap: 12px;
      height: 420px;

      li.petitem {
        flex: 1;
        border-radius: 20px;
        transition: flex 0.4s ease-in-out, box-shadow 0.3s ease;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

        // 背景图片样式
        .petitem-bg-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease-in-out;
        }

        // 渐变背景（无图片时）
        .petitem-bg-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #f97316 0%, #fb923c 100%);
        }

        // 渐变遮罩
        &::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(0,0,0,0.1) 0%,
            transparent 30%,
            transparent 55%,
            rgba(0,0,0,0.65) 100%
          );
          border-radius: 20px;
          transition: opacity 0.3s ease;
        }

        &:hover {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          .petitem-bg-img {
            transform: scale(1.05);
          }
        }

        &.active {
          flex: 2.5;
        }

        // 用户信息
        .myinfo {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 2;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.85);
          backdrop-filter: blur(8px);
          border-radius: 20px;
          padding: 5px 10px 5px 6px;

          .myinfo-avatar {
            width: 26px;
            height: 26px;
            border-radius: 50%;
            object-fit: cover;
            background: #e5e7eb;
          }

          .myinfo-name {
            font-size: 12px;
            font-weight: 600;
            color: #374151;
            white-space: nowrap;
            max-width: 70px;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        // 热度标签
        .hot-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 2;
          background: rgba(249, 115, 22, 0.9);
          backdrop-filter: blur(4px);
          border-radius: 12px;
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #fff;
        }

        // 底部内容
        .content-bottom {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 24px 16px 16px;
          z-index: 2;

          .content-overlay {
            .post-title {
              font-size: 15px;
              font-weight: 700;
              color: #fff;
              margin: 0 0 6px;
              line-height: 1.3;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            }

            .post-content {
              font-size: 13px;
              color: rgba(255,255,255,0.85);
              margin: 0;
              line-height: 1.4;
              overflow: hidden;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
              opacity: 0;
              transform: translateY(8px);
              transition: opacity 0.3s ease, transform 0.3s ease;
            }
          }
        }

        // 展开时显示内容摘要
        &.active .content-bottom .content-overlay .post-content {
          opacity: 1;
          transform: translateY(0);
        }
      }

      // 骨架屏
      li.skeleton-item {
        flex: 1;
        border-radius: 20px;
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
      }
    }
  }

  .empty-state {
    height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 15px;
    background: #f9fafb;
    border-radius: 20px;
  }
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@media screen and (max-width: 768px) {
  .hot-section {
    width: 100%;
    padding: 24px 16px 16px;
    box-sizing: border-box;

    .section-header {
      .section-title { font-size: 20px; }
      .section-sub { display: none; }
      .view-more-btn { padding: 8px 14px; font-size: 13px; }
    }

    .pet-container ul.petlist {
      flex-direction: column;
      height: auto;
      gap: 12px;

      li.petitem {
        flex: none !important;
        height: 200px;
        border-radius: 16px;

        .content-bottom .content-overlay .post-content {
          opacity: 1;
          transform: translateY(0);
          -webkit-line-clamp: 1;
        }
      }
    }
  }
}
</style>