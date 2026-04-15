import { ref, computed } from 'vue'
import { getArticleDetailAPI } from '../../api/article.js'
import { getSafeImageUrl } from '../../utils/imgformat.js'
import convertToChinaLocalDate from '../../utils/dateCover.js'

export const useArticleDetail = (articleId) => {
  const articleDetail = ref({})
  const isLoading = ref(true)
  const error = ref(null)

  // 获取文章详情
  const getArticleDetail = async () => {
    try {
      isLoading.value = true
      error.value = null
      const res = await getArticleDetailAPI(articleId)
      articleDetail.value = res.data
      console.log('文章详情:', articleDetail.value)
    } catch (err) {
      console.log(err)
      error.value = err.message || '获取文章详情失败'
    } finally {
      isLoading.value = false
    }
  }

  // 计算属性：处理轮播图数据
  const carouselImages = computed(() => {
    if (!articleDetail.value.images || !Array.isArray(articleDetail.value.images)) {
      return []
    }
    // 直接返回格式化后的图片URL数组，而不是对象数组
    return articleDetail.value.images.map(img => getSafeImageUrl(img))
  })

  // 计算属性：处理标签数据
  const articleTags = computed(() => {
    if (!articleDetail.value.tag || !Array.isArray(articleDetail.value.tag)) {
      return []
    }
    return articleDetail.value.tag.map((tagName, index) => ({
      id: index + 1,
      name: tagName
    }))
  })

  // 计算属性：格式化发布时间
  const formattedDate = computed(() => {
    return articleDetail.value.createdAt ? convertToChinaLocalDate(articleDetail.value.createdAt) : '未知时间'
  })

  return {
    articleDetail,
    isLoading,
    error,
    getArticleDetail,
    carouselImages,
    articleTags,
    formattedDate
  }
}
