import Instance from "../http/http"


// 获取文章列表（传入文章、分类、标签）
export const getArticleListAPI = async (params) => {
  try {
    const response = await Instance({
      url: '/api/articles',
      method: 'get',
      params: {
        ...params,

        status: true
      },
    })
    return response.data

  } catch (err) {
    throw err
  }
}

// 用户点赞文章
export const articleLikeAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/articles/${id}/like`,
      method: 'post',
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 用户收藏文章
export const articleCollectAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/articles/${id}/collects`,
      method: 'post',
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取用户的文章的收藏的列表
export const articleCollectionAPI = async (params) => {
  try {
    const response = await Instance({
      url: `/api/articles/users/collects`,
      method: 'get',
      params,
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取点赞列表
export const articleLikeListAPI = async (params) => {
  try {
    const response = await Instance({
      url: `/api/articles/users/likes`,
      method: 'get',
      params,
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取用户对文章列表的点赞和收藏状态
export const getUserArticleStatusAPI = async (articleIds) => {
  try {
    const response = await Instance({
      url: '/api/articles/users/status',
      method: 'post',
      data: { articleIds }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取用户自己发表的文章列表
export const getUserPostsAPI = async (params) => {
  try {
    const response = await Instance({
      url: '/api/articles/users/posts',
      method: 'get',
      params,
    })
    return response.data
  } catch (err) {
    throw err
  }
}


// 获取文章详情
export const getArticleDetailAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/articles/${id}`,
      method: 'get',
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取文章评论列表
export const getArticleCommentsAPI = async (id, params) => {
  try {
    const response = await Instance({
      url: `/api/articles/${id}/comments`,
      method: 'get',
      params,
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 发表评论
export const postCommentAPI = async (id, data) => {
  try {
    const response = await Instance({
      url: `/api/articles/${id}/comments`,
      method: 'post',
      data,
    })
    return response.data
  } catch (err) {
    throw err
  }
}


// 发布帖子接口
export const postArticleAPI = async (data) => {
  try {
    const response = await Instance({
      url: `/api/articles`,
      method: 'post',
      data,
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 上传文章图片接口
export const uploadArticleImageAPI = async (data) => {
  try {
    const response = await Instance({
      url: `/api/articles/upload`,
      method: 'post',
      data,
    })
    return response.data
  } catch (err) {
    throw err
  }
}
