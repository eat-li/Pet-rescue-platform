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
          <i class="fas fa-arrow-left"></i>
          <span>返回帖子列表</span>
        </button>
      </section>

      <!-- 顶部封面图片卡片（已隐藏，图片在轮播区域展示） -->
      <!-- <section class="cover-card" v-if="articleDetail.images && articleDetail.images.length > 0">
        <img
          :src="getSafeImageUrl(articleDetail.images, 0)"
          :alt="articleDetail.title || '文章封面'"
          @click="openImagePreview(getSafeImageUrl(articleDetail.images, 0), 0)"
          class="clickable-image"
        >
      </section> -->

      <!-- 用户信息和帖子基本信息字段 -->
      <section class="article-info">
        <h2>{{ articleDetail.title || '加载中...' }}</h2>

        <div class="user-info">
          <div class="avatar">
            <div class="ring-primary w-6 rounded-full">
              <img :src="getSafeImageUrl(articleDetail.user?.avatar)" :alt="articleDetail.user?.nickname || '用户头像'" />
            </div>
          </div>
          <div class="user-name">
            <p>{{ articleDetail.user?.nickname || '未知用户' }}</p>
          </div>
          <div class="publish-time ml-2">
            <p>{{ formattedDate }}</p>
          </div>
          <div class="location ml-2">
            <p>自贡市</p>
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
          <i class="fas fa-star"></i>
          <span>{{ articleDetail.star || 0 }} 点赞</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-comment"></i>
          <span>{{ totalComments }} 评论</span>
        </div>
        <div class="stat-item">
          <i class="fas fa-bookmark"></i>
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
        <h3 class="comment-title">评论 ({{ totalComments }})</h3>
        <div class="comment-input-wrapper">
          <div class="user-avatar">
            <img :src="getSafeImageUrl(articleDetail.user?.avatar)" alt="当前用户头像" class="avatar-img">

          </div>
          <div class="input-area">
            <textarea v-model="commentText" placeholder="写下你的评论..." class="comment-textarea" rows="3"
              :disabled="isSubmitting"></textarea>
            <div class="input-actions">
              <button class="send-btn" :disabled="!commentText.trim() || isSubmitting" @click="handleSendComment">
                <i class="fas fa-paper-plane"></i>
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
              <button class="action-btn reply-btn" @click="toggleReply(comment.id)">
                <i class="fas fa-reply"></i>
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
                <button
                  class="cancel-reply-btn"
                  @click="toggleReply(comment.id)"
                >
                  取消
                </button>
                <button
                  class="submit-reply-btn"
                  :disabled="!replyText[comment.id]?.trim() || isReplying"
                  @click="handleReplyComment(comment.id, replyText[comment.id])"
                >
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
                  <div class="reply-text">
                    {{ reply.content }}
                  </div>
                  <div class="reply-actions">
                    <button class="action-btn reply-btn" @click="toggleReply(comment.id)">
                      <i class="fas fa-reply"></i>
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
          <!-- 关闭按钮 -->
          <button class="preview-close-btn" @click="closeImagePreview">
            <i class="fas fa-times"></i>
          </button>
          
          <!-- 上一张按钮 -->
          <button 
            v-if="carouselImages.length > 1" 
            class="preview-nav-btn preview-prev-btn" 
            @click="prevPreviewImage"
          >
            <i class="fas fa-chevron-left"></i>
          </button>
          
          <!-- 图片 -->
          <div class="preview-image-wrapper" @wheel.stop>
            <img :src="previewImageUrl" alt="预览图片" class="preview-image">
          </div>
          
          <!-- 下一张按钮 -->
          <button 
            v-if="carouselImages.length > 1" 
            class="preview-nav-btn preview-next-btn" 
            @click="nextPreviewImage"
          >
            <i class="fas fa-chevron-right"></i>
          </button>
          
          <!-- 图片计数器 -->
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
  transform: translateY(30px);
  width: 70%;
  background-color: #F7F7F7;
  border-radius: 10px;

  .back-btn {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 20px 30px;
    margin-top: 20px;

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
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }

      i {
        font-size: 12px;
        color: #6b7280;
      }

      span {
        color: #374151;
      }
    }
  }

  .cover-card {
    margin: 0 auto;
    margin-top: 20px;
    width: 90%;
    border-radius: 10px;
    overflow: hidden;
    background: #f8f9fa;

    .clickable-image {
      width: 100%;
      height: auto;
      max-height: 400px;
      object-fit: contain;
      cursor: zoom-in;
      transition: transform 0.3s ease;
      display: block;

      &:hover {
        transform: scale(1.02);
      }
    }
  }

  .article-info {
    margin: 0 auto;
    margin-top: 20px;
    width: 90%;
    min-height: 100px;
    border-radius: 10px;

    h2 {
      font-size: 25px;
      font-weight: 500;
      color: #333;
      font-weight: bold;
      margin-bottom: 15px;
    }

    .user-info {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      height: 40px;

      .avatar {
        margin-right: 10px;

        img {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
        }
      }

      .user-name,
      .publish-time,
      .location {
        color: #979899;
        font-size: 14px;
      }
    }
  }

  .content {
    margin: 0 auto;
    margin-top: 20px;
    width: 90%;
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e5e7eb;
    line-height: 1.6;
    color: #333;
  }

  .carousel-section {
    margin: 0 auto;
    margin-top: 20px;
    width: 90%;

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
        background: #c1c1c1;
        border-radius: 3px;
      }

      .carousel-image-item {
        flex: 0 0 auto;
        scroll-snap-align: start;
        cursor: zoom-in;
        border-radius: 8px;
        overflow: hidden;
        background: #f8f9fa;
        transition: transform 0.3s ease, box-shadow 0.3s ease;

        &:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
        }

        .carousel-img {
          width: 280px;
          height: 200px;
          object-fit: contain;
          display: block;
        }
      }
    }
  }

  // 图片预览弹窗样式已移至非 scoped style 块
  // 因为 Teleport to="body" 元素在 scoped 外部

  .stats {
    margin: 0 auto;
    margin-top: 20px;
    width: 90%;
    display: flex;
    gap: 20px;
    padding: 15px 0;
    border-bottom: 1px solid #e5e7eb;

    .stat-item {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #6b7280;
      font-size: 14px;

      i {
        font-size: 16px;
      }
    }
  }

  .tag-section {
    margin: 0 auto;
    width: 90%;
    padding-bottom: 30px;
  }

  .comment-section {
    margin: 0 auto;
    width: 90%;
    background: white;
    border-radius: 10px;
    padding: 20px;
    margin-top: 20px;

    .comment-title {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 20px;
      padding-bottom: 10px;
      border-bottom: 1px solid #f0f0f0;
    }

    .comment-input-section {
      margin-bottom: 30px;

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
          }
        }

        .input-area {
          flex: 1;

          .comment-textarea {
            width: 100%;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 12px;
            font-size: 14px;
            line-height: 1.5;
            resize: vertical;
            min-height: 80px;
            font-family: inherit;

            &:focus {
              outline: none;
              border-color: #3b82f6;
              box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
              padding: 8px 16px;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 6px;
              font-size: 14px;
              cursor: pointer;
              transition: all 0.2s;

              &:hover:not(:disabled) {
                background: #2563eb;
              }

              &:disabled {
                background: #d1d5db;
                cursor: not-allowed;
              }

              i {
                font-size: 12px;
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
        border-bottom: 1px solid #f5f5f5;

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
          }
        }

        .comment-content {
          flex: 1;

          .comment-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;

            .user-name {
              font-weight: 600;
              color: #333;
              font-size: 14px;
            }

            .comment-time {
              color: #9ca3af;
              font-size: 12px;
            }
          }

          .comment-text {
            color: #374151;
            line-height: 1.6;
            margin-bottom: 10px;
            font-size: 14px;
          }

          .comment-actions {
            display: flex;
            gap: 15px;

            .action-btn {
              display: flex;
              align-items: center;
              gap: 4px;
              background: none;
              border: none;
              color: #6b7280;
              font-size: 12px;
              cursor: pointer;
              padding: 4px 8px;
              border-radius: 4px;
              transition: all 0.2s;

              &:hover {
                background: #f3f4f6;
                color: #374151;
              }

              &.like-btn:hover {
                color: #ef4444;
              }

              i {
                font-size: 12px;
              }
            }
          }

          // 回复输入框样式
          .reply-input-area {
            margin-top: 15px;
            padding: 12px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #e5e7eb;

            .reply-textarea {
              width: 100%;
              border: 1px solid #e5e7eb;
              border-radius: 6px;
              padding: 10px;
              font-size: 13px;
              line-height: 1.5;
              resize: vertical;
              min-height: 60px;
              font-family: inherit;
              background: white;

              &:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
                padding: 6px 12px;
                background: #f3f4f6;
                color: #6b7280;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;

                &:hover {
                  background: #e5e7eb;
                }
              }

              .submit-reply-btn {
                padding: 6px 12px;
                background: #3b82f6;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 13px;
                cursor: pointer;
                transition: all 0.2s;

                &:hover:not(:disabled) {
                  background: #2563eb;
                }

                &:disabled {
                  background: #d1d5db;
                  cursor: not-allowed;
                }
              }
            }
          }

          .replies-list {
            margin-top: 15px;
            padding-left: 20px;
            border-left: 2px solid #f3f4f6;

            .reply-item {
              display: flex;
              gap: 10px;
              margin-bottom: 15px;

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
                  margin-bottom: 6px;

                  .user-name {
                    font-weight: 600;
                    color: #333;
                    font-size: 13px;
                  }

                  .reply-target {
                    color: #3b82f6;
                    font-size: 12px;
                  }

                  .reply-time {
                    color: #9ca3af;
                    font-size: 11px;
                  }
                }

                .reply-text {
                  color: #374151;
                  line-height: 1.5;
                  margin-bottom: 8px;
                  font-size: 13px;
                }

                .reply-actions {
                  display: flex;
                  gap: 12px;

                  .action-btn {
                    display: flex;
                    align-items: center;
                    gap: 3px;
                    background: none;
                    border: none;
                    color: #6b7280;
                    font-size: 11px;
                    cursor: pointer;
                    padding: 2px 6px;
                    border-radius: 3px;
                    transition: all 0.2s;

                    &:hover {
                      background: #f3f4f6;
                      color: #374151;
                    }

                    &.like-btn:hover {
                      color: #ef4444;
                    }

                    i {
                      font-size: 10px;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }

}

// 响应式设计
@media (max-width: 768px) {
  .detail {
    width: 95%;

    .back-btn {
      padding: 15px 20px;

      .back-button {
        padding: 8px 12px;
        font-size: 13px;
      }
    }

    .stats {
      flex-direction: column;
      gap: 10px;
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