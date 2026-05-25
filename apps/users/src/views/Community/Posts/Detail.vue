<script setup>
import SampleNav from '../../../components/Common/SampleNav.vue'
import Carousel from '../../../components/Common/Carousel.vue'
import Toast from '../../../components/Common/Toast.vue'
import { useToast } from '../../../hooks/Common/useToast.js'
import Tag from '../../../components/Common/Tag.vue'
import { baseURL } from '../../../http/http'

import { onMounted, ref, watch, onUnmounted } from 'vue'
import Loading from '../../../components/Common/Loading.vue'
import { getSafeImageUrl } from '../../../utils/imgformat'
import { useRouter } from 'vue-router'
import { useArticleDetail } from '../../../hooks/Article/useArticleDetail.js'
import { useArticleComment } from '../../../hooks/Article/useArticleComment.js'

const router = useRouter()
const articleId = router.currentRoute.value.params.id


const {
  showToast,
  toastMessage,
  toastType,
  duration,
  showSuccess,
  showError
} = useToast()

// 使用文章详情钩子
const {
  articleDetail,
  isLoading,
  error,
  getArticleDetail,
  carouselImages,
  articleTags,
  formattedDate
} = useArticleDetail(articleId)

// 使用评论钩子
const {
  formattedComments,
  totalComments,
  isLoading: commentLoading,
  error: commentError,
  getCommentList,
  postComment
} = useArticleComment(articleId)

// 轮播图组件引用
const carouselRef = ref(null)

// 图片预览相关
const showImagePreview = ref(false)
const previewImageUrl = ref('')
const previewImageIndex = ref(0)

// 打开图片预览
const openImagePreview = (url, index = 0) => {
  previewImageUrl.value = url
  previewImageIndex.value = index
  showImagePreview.value = true
  // 禁止背景滚动，但保留预览框内的滚动
  document.body.style.overflow = 'hidden'
}

// 关闭图片预览
const closeImagePreview = () => {
  showImagePreview.value = false
  document.body.style.overflow = ''
}

// 切换预览图片
const prevPreviewImage = () => {
  if (carouselImages.value.length > 0) {
    previewImageIndex.value = (previewImageIndex.value - 1 + carouselImages.value.length) % carouselImages.value.length
    previewImageUrl.value = carouselImages.value[previewImageIndex.value]
  }
}

const nextPreviewImage = () => {
  if (carouselImages.value.length > 0) {
    previewImageIndex.value = (previewImageIndex.value + 1) % carouselImages.value.length
    previewImageUrl.value = carouselImages.value[previewImageIndex.value]
  }
}

// 键盘事件处理
const handleKeydown = (e) => {
  if (!showImagePreview.value) return
  if (e.key === 'Escape') {
    closeImagePreview()
  } else if (e.key === 'ArrowLeft') {
    prevPreviewImage()
  } else if (e.key === 'ArrowRight') {
    nextPreviewImage()
  }
}

// 标签点击处理
const handleTagClick = (tag) => {
  console.log('点击标签:', tag)
}

// 返回按钮处理
const handleGoBack = () => {
  router.push('/posts')

}

// 监听错误状态，显示错误提示
watch(() => error.value, (newError) => {
  if (newError) {
    showError(newError)
  }
})

// 监听评论错误状态
watch(() => commentError.value, (newError) => {
  if (newError) {
    showError(newError)
  }
})

// 评论相关数据
const commentText = ref('')
const isSubmitting = ref(false)

// 回复相关数据
const replyText = ref({}) // 存储每条评论的回复内容，键为评论ID
const activeReplyId = ref(null) // 当前正在回复的评论ID
const isReplying = ref(false)

// 切换回复状态
const toggleReply = (commentId) => {
  if (activeReplyId.value === commentId) {
    activeReplyId.value = null
  } else {
    activeReplyId.value = commentId
    if (!replyText.value[commentId]) {
      replyText.value[commentId] = ''
    }
  }
}

// 发送评论
const handleSendComment = async () => {
  if (!commentText.value.trim()) {
    showError('请输入评论内容')
    return
  }

  isSubmitting.value = true
  try {
    const result = await postComment(commentText.value.trim())
    if (result.success) {
      commentText.value = ''
      showSuccess('评论发送成功')
    } else {
      showError(result.error || '评论发送失败')
    }
  } catch (error) {
    showError('评论发送失败')
  } finally {
    isSubmitting.value = false
  }
}

// 回复评论
const handleReplyComment = async (parentId, content) => {
  if (!content.trim()) {
    showError('请输入回复内容')
    return
  }
  
  isReplying.value = true
  try {
    const result = await postComment(content.trim(), parentId)
    if (result.success) {
      replyText.value[parentId] = ''
      activeReplyId.value = null
      showSuccess('回复发送成功')
    } else {
      showError(result.error || '回复发送失败')
    }
  } catch (error) {
    showError('回复发送失败')
  } finally {
    isReplying.value = false
  }
}

onMounted(() => {
  getArticleDetail()
  getCommentList()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<template>
  <SampleNav />

  <!-- Loading 组件 -->
  <Loading :isShow="isLoading" />

  <main class="detail" v-if="!isLoading">
    <div class="container">
      <!-- 顶部返回按钮 -->
      <section class="back-btn">
        <button class="back-button" @click="handleGoBack">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>返回帖子列表</span>
        </button>
      </section>

      <!-- 用户信息和帖子基本信息字段 -->
      <section class="article-info">
        <h2>{{ articleDetail.title || '加载中...' }}</h2>

        <div class="user-info">
          <div class="avatar-wrapper">
            <img :src="getSafeImageUrl(articleDetail.user?.avatar)" :alt="articleDetail.user?.nickname || '用户头像'" />
          </div>
          <div class="user-meta">
            <span class="user-name">{{ articleDetail.user?.nickname || '未知用户' }}</span>
            <span class="meta-dot"></span>
            <span class="publish-time">{{ formattedDate }}</span>
          </div>
        </div>
      </section>

      <!-- 轮播图区域 -->
      <section class="carousel-section" v-if="carouselImages.length > 0">
        <div class="custom-carousel">
          <div
            v-for="(image, index) in carouselImages"
            :key="index"
            class="carousel-image-item"
            @click="openImagePreview(image, index)"
          >
            <img :src="image" :alt="`图片 ${index + 1}`" class="carousel-img">
          </div>
        </div>
      </section>

      <!-- 内容区域 -->
      <section class="content">
        <p v-html="articleDetail.content"></p>
      </section>

      <!-- 统计信息 -->
      <section class="stats">
        <div class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              fill="#ef4444" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ articleDetail.star || 0 }} 点赞</span>
        </div>
        <div class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              fill="#3b82f6" stroke="#3b82f6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ totalComments }} 评论</span>
        </div>
        <div class="stat-item">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
              fill="#f59e0b" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <span>{{ articleDetail.collection || 0 }} 收藏</span>
        </div>
      </section>

      <!-- 标签区域 -->
      <section class="tag-section" v-if="articleTags.length > 0">
        <Tag :tags="articleTags" title="相关标签" :random-colors="true" @tag-click="handleTagClick" />
      </section>
    </div>

    <div class="comment-section">
      <!-- 评论输入区域 -->
      <div class="comment-input-section">
        <h3 class="comment-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              fill="none" stroke="#f97316" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          评论 ({{ totalComments }})
        </h3>
        <div class="comment-input-wrapper">
          <div class="user-avatar">
            <img :src="getSafeImageUrl(articleDetail.user?.avatar)" alt="当前用户头像" class="avatar-img">
          </div>
          <div class="input-area">
            <textarea v-model="commentText" placeholder="写下你的评论..." class="comment-textarea" rows="3"
              :disabled="isSubmitting"></textarea>
            <div class="input-actions">
              <button class="send-btn" :disabled="!commentText.trim() || isSubmitting" @click="handleSendComment">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ isSubmitting ? '发送中...' : '发送评论' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comments-list" v-if="!commentLoading">
        <div v-for="comment in formattedComments" :key="comment.id" class="comment-item">
          <div class="comment-avatar">
            <img :src="comment.user.avatar" :alt="comment.user.nickname" class="avatar-img">
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <span class="user-name">{{ comment.user.nickname }}</span>
              <span class="comment-time">{{ comment.createdAt }}</span>
            </div>
            <div class="comment-text">
              {{ comment.content }}
            </div>
            <div class="comment-actions">
              <button class="reply-btn" @click="toggleReply(comment.id)">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M3 10h10a5 5 0 0 1 5 5v6M3 10l6 6M3 10l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                {{ activeReplyId === comment.id ? '取消回复' : '回复' }}
              </button>
            </div>

            <!-- 回复输入框 -->
            <div v-if="activeReplyId === comment.id" class="reply-input-area">
              <textarea
                v-model="replyText[comment.id]"
                placeholder="写下你的回复..."
                class="reply-textarea"
                rows="2"
                :disabled="isReplying"
              ></textarea>
              <div class="reply-actions-btn">
                <button class="cancel-reply-btn" @click="toggleReply(comment.id)">取消</button>
                <button class="submit-reply-btn"
                  :disabled="!replyText[comment.id]?.trim() || isReplying"
                  @click="handleReplyComment(comment.id, replyText[comment.id])">
                  {{ isReplying ? '发送中...' : '发送回复' }}
                </button>
              </div>
            </div>

            <!-- 回复列表 -->
            <div v-if="comment.replies && comment.replies.length > 0" class="replies-list">
              <div v-for="reply in comment.replies" :key="reply.id" class="reply-item">
                <div class="reply-avatar">
                  <img :src="reply.user.avatar" :alt="reply.user.nickname" class="avatar-img">
                </div>
                <div class="reply-content">
                  <div class="reply-header">
                    <span class="user-name">{{ reply.user.nickname }}</span>
                    <span class="reply-time">{{ reply.createdAt }}</span>
                  </div>
                  <div class="reply-text">{{ reply.content }}</div>
                  <div class="reply-actions">
                    <button class="reply-btn" @click="toggleReply(comment.id)">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M3 10h10a5 5 0 0 1 5 5v6M3 10l6 6M3 10l6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      回复
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 暂无评论提示 -->
        <div v-if="formattedComments.length === 0" class="no-comments">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
              fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <p>暂无评论，快来发表第一条评论吧！</p>
        </div>
      </div>

      <!-- 评论加载中 -->
      <div v-if="commentLoading" class="comment-loading">
        <p>评论加载中...</p>
      </div>
    </div>

  </main>

  <Toast :show-toast="showToast" :toast-type="toastType" :toast-message="toastMessage" :duration="duration" />

  <!-- 图片预览弹窗 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showImagePreview" class="image-preview-overlay" @click="closeImagePreview">
        <div class="image-preview-container" @click.stop>
          <button class="preview-close-btn" @click="closeImagePreview">
            <i class="fas fa-times"></i>
          </button>
          <button
            v-if="carouselImages.length > 1"
            class="preview-nav-btn preview-prev-btn"
            @click="prevPreviewImage"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          <div class="preview-image-wrapper" @wheel.stop>
            <img :src="previewImageUrl" alt="预览图片" class="preview-image">
          </div>
          <button
            v-if="carouselImages.length > 1"
            class="preview-nav-btn preview-next-btn"
            @click="nextPreviewImage"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
          <div v-if="carouselImages.length > 1" class="preview-counter">
            {{ previewImageIndex + 1 }} / {{ carouselImages.length }}
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<!-- 样式部分保持不变，添加新的样式 -->
<style lang='scss' scoped>
.detail {
  margin: 0 auto;
  margin-top: 40px;
  margin-bottom: 40px;
  width: 70%;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  border: 1px solid #f3f4f6;
  overflow: hidden;

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 24px 32px;

    .back-button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 18px;
      background: #fff;
      border: 1.5px solid #e5e7eb;
      border-radius: 25px;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      white-space: nowrap;

      svg {
        transition: transform 0.3s ease;
      }

      &:hover {
        background: #f97316;
        border-color: #f97316;
        color: #fff;
        transform: translateX(-4px);
        box-shadow: 0 6px 20px rgba(249, 115, 22, 0.3);

        svg path { stroke: #fff; }
      }
    }
  }

  .article-info {
    margin: 0 auto;
    width: 90%;
    padding: 20px 0;
    border-bottom: 1px solid #f3f4f6;

    h2 {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 20px;
      line-height: 1.3;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .avatar-wrapper {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .user-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #9ca3af;

        .user-name {
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .meta-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #f97316;
          flex-shrink: 0;
        }
      }
    }
  }

  .content {
    margin: 0 auto;
    width: 90%;
    padding: 24px 0;
    border-bottom: 1px solid #f3f4f6;
    line-height: 1.8;
    color: #374151;
    font-size: 15px;
  }

  .carousel-section {
    margin: 0 auto;
    width: 90%;
    padding: 20px 0;

    .custom-carousel {
      display: flex;
      gap: 16px;
      overflow-x: auto;
      padding: 10px 0;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;

      &::-webkit-scrollbar {
        height: 6px;
      }

      &::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-thumb {
        background: linear-gradient(90deg, #f97316, #fb923c);
        border-radius: 3px;
      }

      .carousel-image-item {
        flex: 0 0 auto;
        scroll-snap-align: start;
        cursor: zoom-in;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        transition: transform 0.3s ease, box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        }

        .carousel-img {
          width: 280px;
          height: 200px;
          object-fit: cover;
          display: block;
        }
      }
    }
  }

  .stats {
    margin: 0 auto;
    width: 90%;
    display: flex;
    gap: 16px;
    padding: 20px 0;
    border-bottom: 1px solid #f3f4f6;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 6px;
      background: #f9fafb;
      border: 1px solid #f3f4f6;
      padding: 8px 16px;
      border-radius: 20px;
      color: #6b7280;
      font-size: 13px;
      font-weight: 500;
    }
  }

  .tag-section {
    margin: 0 auto;
    width: 90%;
    padding: 20px 0 30px;
  }

  .comment-section {
    margin: 0 auto;
    width: 90%;
    background: #f9fafb;
    border-radius: 20px;
    padding: 28px;
    margin-top: 10px;
    margin-bottom: 30px;
    border: 1px solid #f3f4f6;

    .comment-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 18px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0 0 24px;
      padding-bottom: 14px;
      border-bottom: 2px solid #fed7aa;
    }

    .comment-input-section {
      margin-bottom: 28px;

      .comment-input-wrapper {
        display: flex;
        gap: 12px;
        align-items: flex-start;

        .user-avatar {
          flex-shrink: 0;

          .avatar-img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
        }

        .input-area {
          flex: 1;

          .comment-textarea {
            width: 100%;
            border: 2px solid #e5e7eb;
            border-radius: 16px;
            padding: 14px 16px;
            font-size: 14px;
            line-height: 1.5;
            resize: vertical;
            min-height: 80px;
            font-family: inherit;
            background: #fff;
            transition: all 0.3s ease;

            &:focus {
              outline: none;
              border-color: #f97316;
              box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
            }

            &::placeholder {
              color: #9ca3af;
            }
          }

          .input-actions {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;

            .send-btn {
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 10px 20px;
              background: linear-gradient(135deg, #f97316, #ea580c);
              color: white;
              border: none;
              border-radius: 25px;
              font-size: 14px;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.3s ease;
              box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);

              &:hover:not(:disabled) {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(249, 115, 22, 0.4);
              }

              &:disabled {
                background: #d1d5db;
                box-shadow: none;
                cursor: not-allowed;
              }
            }
          }
        }
      }
    }

    .comments-list {
      .comment-item {
        display: flex;
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 20px;
        border-bottom: 1px solid #e5e7eb;

        &:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }

        .comment-avatar {
          flex-shrink: 0;

          .avatar-img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
          }
        }

        .comment-content {
          flex: 1;
          background: #fff;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
          border: 1px solid #f3f4f6;

          .comment-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;

            .user-name {
              font-weight: 600;
              color: #1f2937;
              font-size: 14px;
            }

            .comment-time {
              color: #9ca3af;
              font-size: 12px;
            }
          }

          .comment-text {
            color: #4b5563;
            line-height: 1.7;
            margin-bottom: 10px;
            font-size: 14px;
          }

          .comment-actions {
            display: flex;
            gap: 15px;

            .reply-btn {
              display: flex;
              align-items: center;
              gap: 4px;
              background: none;
              border: none;
              color: #9ca3af;
              font-size: 12px;
              cursor: pointer;
              padding: 4px 10px;
              border-radius: 20px;
              transition: all 0.2s;

              &:hover {
                background: #fff7ed;
                color: #f97316;
              }
            }
          }

          // 回复输入框样式
          .reply-input-area {
            margin-top: 14px;
            padding: 14px;
            background: #f9fafb;
            border-radius: 12px;
            border: 1px solid #e5e7eb;

            .reply-textarea {
              width: 100%;
              border: 2px solid #e5e7eb;
              border-radius: 12px;
              padding: 10px 14px;
              font-size: 13px;
              line-height: 1.5;
              resize: vertical;
              min-height: 60px;
              font-family: inherit;
              background: white;
              transition: all 0.3s ease;

              &:focus {
                outline: none;
                border-color: #f97316;
                box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
              }

              &::placeholder {
                color: #9ca3af;
              }
            }

            .reply-actions-btn {
              display: flex;
              justify-content: flex-end;
              gap: 8px;
              margin-top: 10px;

              .cancel-reply-btn {
                padding: 6px 14px;
                background: #f3f4f6;
                color: #6b7280;
                border: none;
                border-radius: 20px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                  background: #e5e7eb;
                }
              }

              .submit-reply-btn {
                padding: 6px 14px;
                background: linear-gradient(135deg, #f97316, #ea580c);
                color: white;
                border: none;
                border-radius: 20px;
                font-size: 13px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s;

                &:hover:not(:disabled) {
                  box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);
                }

                &:disabled {
                  background: #d1d5db;
                  cursor: not-allowed;
                }
              }
            }
          }

          .replies-list {
            margin-top: 14px;
            padding-left: 16px;
            border-left: 2px solid #fed7aa;

            .reply-item {
              display: flex;
              gap: 10px;
              margin-bottom: 14px;

              &:last-child {
                margin-bottom: 0;
              }

              .reply-avatar {
                flex-shrink: 0;

                .avatar-img {
                  width: 32px;
                  height: 32px;
                  border-radius: 50%;
                  object-fit: cover;
                }
              }

              .reply-content {
                flex: 1;

                .reply-header {
                  display: flex;
                  align-items: center;
                  gap: 8px;
                  margin-bottom: 4px;

                  .user-name {
                    font-weight: 600;
                    color: #1f2937;
                    font-size: 13px;
                  }

                  .reply-time {
                    color: #9ca3af;
                    font-size: 11px;
                  }
                }

                .reply-text {
                  color: #4b5563;
                  line-height: 1.6;
                  margin-bottom: 6px;
                  font-size: 13px;
                }

                .reply-actions {
                  display: flex;
                  gap: 12px;

                  .reply-btn {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    background: none;
                    border: none;
                    color: #9ca3af;
                    font-size: 11px;
                    cursor: pointer;
                    padding: 2px 8px;
                    border-radius: 20px;
                    transition: all 0.2s;

                    &:hover {
                      background: #fff7ed;
                      color: #f97316;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    .no-comments {
      text-align: center;
      padding: 40px 20px;
      color: #9ca3af;

      svg {
        margin-bottom: 12px;
      }

      p {
        margin: 0;
        font-size: 14px;
      }
    }
  }
}

// 响应式设计
@media (max-width: 768px) {
  .detail {
    width: 95%;
    margin-top: 20px;
    border-radius: 16px;

    .back-btn {
      padding: 16px 20px;
    }

    .article-info h2 {
      font-size: 20px;
    }

    .carousel-section .custom-carousel .carousel-image-item .carousel-img {
      width: 220px;
      height: 160px;
    }

    .stats {
      flex-direction: column;
      gap: 8px;

      .stat-item {
        justify-content: center;
      }
    }

    .comment-section {
      padding: 20px 16px;
      border-radius: 16px;

      .comment-content {
        padding: 12px;
      }
    }
  }
}
</style>

<!-- 图片预览弹窗样式（非 scoped，因为 Teleport to="body"） -->
<style lang="scss">
.image-preview-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  background: rgba(0, 0, 0, 0.9) !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  z-index: 99999 !important;
  padding: 20px !important;
  overflow-y: auto !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
  pointer-events: auto !important;
}

.image-preview-overlay::-webkit-scrollbar {
  display: none !important;
}

.image-preview-container {
  position: relative !important;
  max-width: 90vw !important;
  max-height: 90vh !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-height: min-content !important;
  z-index: 100000 !important;
  pointer-events: auto !important;
}

.preview-image-wrapper {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  max-height: 85vh !important;
  overflow-y: auto !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
}

.preview-image-wrapper::-webkit-scrollbar {
  display: none !important;
}

.preview-image {
  max-width: 85vw !important;
  max-height: 85vh !important;
  object-fit: contain !important;
  border-radius: 8px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3) !important;
}

.preview-close-btn {
  position: fixed !important;
  top: 20px !important;
  right: 20px !important;
  width: 44px !important;
  height: 44px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-size: 20px !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.3s ease !important;
  z-index: 100001 !important;
  pointer-events: auto !important;
}

.preview-close-btn:hover {
  background: rgba(255, 255, 255, 0.25) !important;
  transform: rotate(90deg) !important;
}

.preview-nav-btn {
  position: fixed !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  width: 50px !important;
  height: 50px !important;
  border-radius: 50% !important;
  background: rgba(255, 255, 255, 0.15) !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  color: white !important;
  font-size: 20px !important;
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  transition: all 0.3s ease !important;
  z-index: 100001 !important;
  pointer-events: auto !important;
}

.preview-nav-btn:hover {
  background: rgba(255, 255, 255, 0.3) !important;
}

.preview-prev-btn {
  left: 20px !important;
}

.preview-next-btn {
  right: 20px !important;
}

.preview-counter {
  position: fixed !important;
  bottom: 20px !important;
  left: 50% !important;
  transform: translateX(-50%) !important;
  color: white !important;
  font-size: 14px !important;
  background: rgba(255, 255, 255, 0.15) !important;
  padding: 8px 20px !important;
  border-radius: 20px !important;
  backdrop-filter: blur(10px) !important;
  z-index: 100001 !important;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease !important;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0 !important;
}
</style>