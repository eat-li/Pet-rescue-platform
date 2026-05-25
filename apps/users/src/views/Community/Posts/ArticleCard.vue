<script setup>
import { baseURL } from "../../../http/http.js"
import dateCover from "../../../utils/dateCover.js"
import { formatImageUrl } from "../../../utils/imgformat.js"
import { useRouter } from "vue-router"
import { ref, watch, onMounted } from 'vue'
import { articleLikeAPI, articleCollectAPI, getUserArticleStatusAPI } from "../../../api/article.js"
import Toast from "../../../components/Common/Toast.vue"
import { useToast } from "../../../hooks/Common/useToast.js"

const Props = defineProps({
  articleList: {
    type: Array,
    default: () => [],
  }
})

// 使用 Toast hook
const { showToast, toastMessage, toastType, duration, showSuccess, showError } = useToast()

// 复制文章列表用于本地修改（维护数量变化）
const articles = ref([...Props.articleList])

// 服务类型映射
const articleTypeMap = {
  'pet_daily': '宠物日常',
  'help_question': '求助问题',
  'experience_share': '经验分享'
}

const router = useRouter()

// 为每个文章存储独立的状态（键：文章ID，值：状态）
const articleStates = ref({})

// 初始化文章状态
const initializeArticleStates = async (articleList) => {
  if (!articleList || articleList.length === 0) return;

  try {
    // 获取所有文章ID
    const articleIds = articleList.map(article => article.id);

    // 调用API获取用户状态
    const response = await getUserArticleStatusAPI(articleIds);

    // 更新状态
    articleStates.value = { ...articleStates.value, ...response.data };

  } catch (err) {
    console.error('获取用户状态失败:', err);
    // 如果获取失败，使用默认状态
    articleList.forEach(article => {
      if (!articleStates.value[article.id]) {
        articleStates.value[article.id] = {
          isLiked: false,
          isCollected: false
        };
      }
    });
  }
};

// 监听文章列表变化，初始化状态
watch(() => Props.articleList, async (newList) => {
  // 更新本地文章列表
  articles.value = [...newList];
  // 异步初始化状态
  await initializeArticleStates(newList);
}, { immediate: true });

// 点赞功能
const handleStar = async (id) => {
  // 确保状态对象存在
  if (!articleStates.value[id]) {
    articleStates.value[id] = { isLiked: false, isCollected: false }
  }

  const prevState = articleStates.value[id].isLiked
  articleStates.value[id].isLiked = !prevState

  try {
    const res = await articleLikeAPI(id)

    // 找到对应的文章并更新点赞数
    const articleIndex = articles.value.findIndex(item => item.id === id)
    if (articleIndex !== -1) {
      articles.value[articleIndex].star = prevState
        ? articles.value[articleIndex].star - 1
        : articles.value[articleIndex].star + 1
    }

    showSuccess(res.message || (prevState ? '取消点赞成功' : '点赞成功'))
  } catch (err) {
    // 出错时回滚状态
    articleStates.value[id].isLiked = prevState

    const errMsg = err.message || '操作失败，请重试'
    showError(errMsg)
  }
}

// 收藏功能
const handleCollection = async (id) => {
  // 确保状态对象存在
  if (!articleStates.value[id]) {
    articleStates.value[id] = { isLiked: false, isCollected: false }
  }

  const prevState = articleStates.value[id].isCollected
  articleStates.value[id].isCollected = !prevState

  try {
    const res = await articleCollectAPI(id)

    // 找到对应的文章并更新收藏数
    const articleIndex = articles.value.findIndex(item => item.id === id)
    if (articleIndex !== -1) {
      articles.value[articleIndex].collection = prevState
        ? articles.value[articleIndex].collection - 1
        : articles.value[articleIndex].collection + 1
    }

    showSuccess(res.message || (prevState ? '取消收藏成功' : '收藏成功'))
  } catch (err) {
    // 出错时回滚状态
    articleStates.value[id].isCollected = prevState

    const errMsg = err.message || '操作失败，请重试'
    showError(errMsg)
  }
}

const handleComment = () => {
  // 处理评论逻辑
}

const handleShare = () => {
  // 处理分享逻辑
}
</script>

<template>
  <div class="article-card" v-for="article in articles" :key="article.id">
    <!-- 用户信息头部 -->
    <div class="article-header">
      <div class="user-info">
        <div class="avatar">
          <img :src="formatImageUrl(article.user.avatar)" :alt="article.user.nickname" />
        </div>
        <div class="user-details">
          <div class="username">{{ article.user.nickname }}</div>
          <div class="publish-time">
            <span class="time-dot"></span>
            <span>{{ dateCover(article.createdAt) }}</span>
          </div>
        </div>
      </div>
      <span class="type-badge" :class="article.type">
        {{ articleTypeMap[article.type] }}
      </span>
    </div>

    <!-- 文章标题 -->
    <div class="article-title" @click="router.push(`/posts/${article.id}`)">
      {{ article.title }}
    </div>

    <!-- 文章内容 -->
    <div class="article-content" v-html="article.content"></div>

    <!-- 文章图片 -->
    <div class="article-image" v-if="article.images?.[0]" @click="router.push(`/posts/${article.id}`)">
      <img :src="formatImageUrl(article.images[0])" :alt="article.title || '文章配图'" loading="lazy" />
      <div class="image-overlay">
        <span class="view-detail-btn">查看详情</span>
      </div>
    </div>

    <!-- 互动按钮 -->
    <div class="article-actions">
      <button class="action-btn" :class="{ active: articleStates[article.id]?.isLiked }"
        @click="handleStar(article.id)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
            :fill="articleStates[article.id]?.isLiked ? '#ef4444' : 'none'"
            :stroke="articleStates[article.id]?.isLiked ? '#ef4444' : 'currentColor'"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ article.star || 0 }}</span>
      </button>

      <button class="action-btn" :class="{ active: articleStates[article.id]?.isCollected }"
        @click="handleCollection(article.id)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
            :fill="articleStates[article.id]?.isCollected ? '#f59e0b' : 'none'"
            :stroke="articleStates[article.id]?.isCollected ? '#f59e0b' : 'currentColor'"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ article.collection || 0 }}</span>
      </button>

      <button class="action-btn" @click="router.push(`/posts/${article.id}`)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
            fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <span>{{ article.comment || 0 }}</span>
      </button>

      <button class="view-btn" @click="router.push(`/posts/${article.id}`)">
        查看详情
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>

  <Toast :show-toast="showToast" :toast-type="toastType" :toast-message="toastMessage" :duration="duration" />
</template>

<style lang="scss" scoped>
.article-card {
  background: #ffffff;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid #f3f4f6;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
    transform: translateY(-2px);
  }
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.username {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
}

.publish-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #9ca3af;

  .time-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #f97316;
    flex-shrink: 0;
  }
}

// 文章类型标签
.type-badge {
  padding: 5px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;

  &.pet_daily {
    background: linear-gradient(135deg, #dbeafe, #bfdbfe);
    color: #2563eb;
    border: 1px solid #93c5fd;
  }

  &.help_question {
    background: linear-gradient(135deg, #fee2e2, #fecaca);
    color: #dc2626;
    border: 1px solid #fca5a5;
  }

  &.experience_share {
    background: linear-gradient(135deg, #dcfce7, #bbf7d0);
    color: #16a34a;
    border: 1px solid #86efac;
  }
}

.article-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  line-height: 1.4;
  margin-bottom: 10px;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #f97316;
  }
}

.article-content {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.7;
  margin-bottom: 16px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-image {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 16px;
  cursor: pointer;
  background: #f9fafb;

  img {
    width: 100%;
    max-height: 360px;
    object-fit: cover;
    display: block;
    transition: transform 0.4s ease;
  }

  &:hover img {
    transform: scale(1.03);
  }

  .image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.5) 0%,
      transparent 50%
    );
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    padding: 16px;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover .image-overlay {
    opacity: 1;
  }

  .view-detail-btn {
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(8px);
    color: #374151;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
}

.article-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  padding: 8px 14px;
  border-radius: 20px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 500;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover {
    background: #fff7ed;
    border-color: #fed7aa;
    color: #f97316;

    svg { transform: scale(1.1); }
  }

  &.active {
    background: #fff7ed;
    border-color: #fed7aa;
    color: #f97316;
  }
}

.view-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: #fff;
  border: none;
  padding: 8px 18px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
  white-space: nowrap;

  svg {
    transition: transform 0.3s ease;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);

    svg { transform: translateX(3px); }
  }
}

// 移动端适配
@media (max-width: 768px) {
  .article-card {
    padding: 16px;
    border-radius: 16px;
    margin-bottom: 14px;
  }

  .avatar {
    width: 38px;
    height: 38px;
  }

  .username { font-size: 14px; }

  .type-badge {
    padding: 4px 10px;
    font-size: 11px;
  }

  .article-title {
    font-size: 16px;
  }

  .article-content {
    font-size: 13px;
    -webkit-line-clamp: 2;
  }

  .article-image img {
    max-height: 240px;
  }

  .article-actions {
    gap: 6px;
    flex-wrap: wrap;
  }

  .action-btn {
    padding: 6px 10px;
    font-size: 12px;
  }

  .view-btn {
    padding: 6px 14px;
    font-size: 12px;
  }
}
</style>