import { ref, computed } from 'vue'
import { getArticleCommentsAPI, postCommentAPI } from '../../api/article.js'
import { getSafeImageUrl } from '../../utils/imgformat.js'
import convertToChinaLocalDate from '../../utils/dateCover.js'

export const useArticleComment = (articleId) => {
  const commentList = ref([])
  const pagination = ref({})
  const isLoading = ref(false)
  const error = ref(null)

  // 获取评论列表
  const getCommentList = async (page = 1, pageSize = 20) => {
    isLoading.value = true
    error.value = null
    try {
      const response = await getArticleCommentsAPI(articleId, { page, pageSize })

      // 根据后端返回的数据结构处理
      if (response.code === 200 && response.data) {
        commentList.value = response.data.comments || []
        pagination.value = response.data.pagination || {}
        console.log('评论列表:', commentList.value)
        console.log('分页信息:', pagination.value)
      }
    } catch (err) {
      console.error('获取评论列表失败:', err)
      error.value = err.message || '获取评论列表失败'
    } finally {
      isLoading.value = false
    }
  }

  // 发送评论
  // 发送评论
  const postComment = async (content, parentId = null) => {
    try {
      // 修复1: 正确传递参数 - articleId作为第一个参数，数据对象作为第二个参数
      const response = await postCommentAPI(articleId, {
        content,
        parentId
      })

      // 修复2: 检查正确的状态码 201
      if (response.code === 201) {
        // 重新获取评论列表
        await getCommentList()
        return { success: true, data: response.data }
      } else {
        return { success: false, error: response.message || '评论发送失败' }
      }
    } catch (err) {
      console.error('发送评论失败:', err)
      return { success: false, error: err.message || '发送评论失败' }
    }
  }

  // 使用计算属性处理评论数据，包括时间格式化和头像处理
  const formattedComments = computed(() => {
    return commentList.value.map(comment => ({
      ...comment,
      // 格式化创建时间
      createdAt: convertToChinaLocalDate(comment.createdAt),
      // 处理用户头像
      user: {
        ...comment.user,
        avatar: getSafeImageUrl(comment.user?.avatar)
      },
      // 处理回复列表
      replies: comment.replies?.map(reply => ({
        ...reply,
        createdAt: convertToChinaLocalDate(reply.createdAt),
        user: {
          ...reply.user,
          avatar: getSafeImageUrl(reply.user?.avatar)
        }
      })) || []
    }))
  })

  // 计算评论总数
  const totalComments = computed(() => {
    return pagination.value.totalItems || 0
  })

  // 检查是否有更多评论
  const hasMoreComments = computed(() => {
    return pagination.value.hasNextPage || false
  })

  // 加载更多评论
  const loadMoreComments = async () => {
    if (hasMoreComments.value && !isLoading.value) {
      const nextPage = (pagination.value.currentPage || 1) + 1
      await getCommentList(nextPage)
    }
  }

  return {
    // 数据
    commentList,
    formattedComments,
    pagination,
    totalComments,
    isLoading,
    error,
    hasMoreComments,

    // 方法
    getCommentList,
    postComment,
    loadMoreComments
  }
}