import { ref, nextTick } from 'vue'
import { getArticleListAPI, articleCollectionAPI, articleLikeListAPI, getUserPostsAPI } from '../../api/article.js'
import scrollToTop from '../Common/useScrollTop.js'

export const useArticleList = () => {
  // 文章列表
  const articleList = ref([])
  
  // 加载状态
  const loading = ref(false)
  
  // 搜索类型
  const searchType = ref('all')
  
  // 分页信息
  const pagination = ref({
    currentPage: 1,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0,
    hasPreviousPage: false,
    hasNextPage: false
  })

  // 获取文章列表的核心方法
  const getArticleList = async (page = 1, type = 'all', containerRef = null) => {
    try {
      loading.value = true
      let res
      
      if (type === 'collection') {
        // 获取收藏列表
        res = await articleCollectionAPI({
          page: page,
          limit: pagination.value.pageSize
        })
        articleList.value = res.data.collections.map(item => item.article)
        pagination.value = res.data.pagination
      } else if (type === 'like') {
        // 获取点赞列表
        res = await articleLikeListAPI({
          page: page,
          limit: pagination.value.pageSize
        })
        articleList.value = res.data.likes.map(item => item.article)
        pagination.value = res.data.pagination
      } else if (type === 'publish') {
        // 获取用户发表的文章列表
        res = await getUserPostsAPI({
          page: page,
          limit: pagination.value.pageSize
        })
        articleList.value = res.data.articles
        pagination.value = res.data.pagination
      } else if (type !== 'all') {
        // 按类型获取文章
        res = await getArticleListAPI({
          page: page,
          limit: pagination.value.pageSize,
          type: type
        })
        articleList.value = res.data.articles
        pagination.value = res.data.pagination
      } else {
        // 获取所有文章
        res = await getArticleListAPI({
          page: page,
          limit: pagination.value.pageSize
        })
        articleList.value = res.data.articles
        pagination.value = res.data.pagination
      }

      await nextTick()
      // 如果传入了容器引用，滚动到顶部
      if (containerRef) {
        scrollToTop(containerRef)
      }

    } catch (err) {
      console.error('获取文章列表失败:', err)
      throw err // 抛出错误让调用方处理
    } finally {
      loading.value = false
    }
  }

  // 处理菜单类型点击
  const handleMenuType = (item, containerRef = null) => {
    searchType.value = item.type
    return getArticleList(1, item.type, containerRef)
  }

  // 处理个人菜单点击
  const handlePersonType = (item, containerRef = null) => {
    searchType.value = item.type
    return getArticleList(1, item.type, containerRef)
  }

  // 上一页
  const goToPreviousPage = (containerRef = null) => {
    if (pagination.value.hasPreviousPage) {
      return getArticleList(pagination.value.currentPage - 1, searchType.value, containerRef)
    } else {
      throw new Error('这是第一页了！')
    }
  }

  // 下一页
  const goToNextPage = (containerRef = null) => {
    if (pagination.value.hasNextPage) {
      return getArticleList(pagination.value.currentPage + 1, searchType.value, containerRef)
    } else {
      throw new Error('这是最后一页了！')
    }
  }

  // 初始化加载
  const initializeList = (containerRef = null) => {
    return getArticleList(pagination.value.currentPage, searchType.value, containerRef)
  }

  return {
    // 状态
    articleList,
    loading,
    searchType,
    pagination,
    
    // 方法
    getArticleList,
    handleMenuType,
    handlePersonType,
    goToPreviousPage,
    goToNextPage,
    initializeList
  }
}