<script setup>
import { baseURL } from "../../../http/http.js"
import dateCover from "../../../utils/dateCover.js"
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
          <img :src="baseURL + article.user.avatar" :alt="article.user.nickname" />
        </div>
        <div class="user-details">
          <div class="username">{{ article.user.nickname }}</div>
          <div class="publish-time">
            <span class="time-dot">●</span>
            <span>{{ dateCover(article.createdAt) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 文章标题 -->
    <div class="article-title">
      {{ article.title }}
    </div>

    <!-- 文章内容 -->
    <div class="article-content" v-html="article.content">
    </div>

    <!-- 文章图片 -->
    <div class="article-image">
      <img :src="baseURL + article.images[0]" alt="文章图片" />

      <div class="image-overlay">
        <button class="comment-btn" @click="router.push(`/posts/${article.id}`)">
          查看详情 ●
        </button>
      </div>
    </div>

    <!-- 互动按钮 -->
    <div class="article-actions">
      <button class="action-btn star-btn" :class="{ active: articleStates[article.id]?.isLiked }"
        @click="handleStar(article.id)">
        <i class="icon">❤️</i>
        <span>{{ article.star }}</span>
      </button>

      <button class="action-btn like-btn" :class="{ active: articleStates[article.id]?.isCollected }"
        @click="handleCollection(article.id)">
        <i class="icon">⭐</i>
        <span>{{ article.collection }}</span>
      </button>

      <button class="action-btn comment-btn" @click="handleComment">
        <i class="icon">💬</i>
        <span>{{ article.comment }}</span>
      </button>

      <button class="action-btn share-btn" :class="article.type" @click="handleShare">
        {{ articleTypeMap[article.type] }}
      </button>
    </div>
  </div>

  <Toast :show-toast="showToast" :toast-type="toastType" :toast-message="toastMessage" :duration="duration" />
</template>

<style scoped>
.article-card {
  background: #F7F7F7;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
}

.article-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  background-color: #F7F7F7;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 16px;
  font-weight: bold;
  color: #666;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.username {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.publish-time {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #999;
}

.time-dot {
  color: #ffa500;
  font-size: 8px;
}

.time-badge {
  background-color: #f5f5f5;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  color: #666;
}

.article-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
  margin-bottom: 8px;
}

.article-content {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  margin-bottom: 12px;
}

.article-image {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 12px;

}

.article-image img {
  width: 100%;
  height: 300px;
  /* 从200px增加到300px */
  object-fit: cover;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  right: 0;
  padding: 12px;
}

.comment-btn {
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.comment-btn:hover {
  background: rgba(0, 0, 0, 0.8);
}


.article-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-top: 12px;
  border-top: 1px solid #F7F7F7;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  background: none;
  border: none;
  padding: 8px 12px;
  border-radius: 20px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  font-size: 16px;
}

.action-btn:hover {
  background-color: #F7F7F7;
}

.action-btn.active {
  color: #ff6b6b;
}

.like-btn.active .icon {
  color: #ff6b6b;
}

.star-btn.active .icon {
  color: #ffd700;
}

.share-btn {
  color: white;
  margin-left: auto;
}

.share-btn:hover {}

.icon {
  font-size: 14px;
}

/*直接给不同按钮添加不同的hover色*/
.pet_daily {
  background: #2B7FFF;
}

.pet_daily:hover {
  background: #155DFC;
}

.help_question {
  background: #FB2C36;
}

.help_question:hover {
  background: #E7000B;
}

.experience_share {
  background: #00C950;
}

.experience_share:hover {
  background: #00A63E;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .article-card {
    padding: 12px;
    border-radius: 8px;
  }

  .article-title {
    font-size: 15px;
  }

  .article-content {
    font-size: 13px;
  }

  .article-actions {
    gap: 12px;
  }

  .action-btn {
    padding: 6px 10px;
    font-size: 11px;
  }
}
</style>