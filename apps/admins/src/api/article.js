import Instance from "../http/http"

// 获取帖子列表
export const getArticleListAPI = async (params = {}) => {
  try {
    const response = await Instance({
      url: '/api/articles',
      method: 'get',
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || ''
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 删除帖子
export const deleteArticleAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/articles/${id}`,
      method: 'delete'
    })
    return response.data
  } catch (err) {
    throw err
  }
}


//批量删除帖子
export const batchDeleteArticleAPI = async (ids) => {
  try {
    const response = await Instance({
      url: '/api/articles/batch',
      method: 'delete',
      data: {
        ids
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}


// 切换帖子状态


// 发布帖子
export const createArticleAPI = async (data) => {
  try {
    const response = await Instance({
      url: '/api/articles',
      method: 'post',
      data
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取帖子详情
export const getArticleDetailAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/articles/${id}`,
      method: 'get'
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 更新帖子
export const updateArticleAPI = async (id, data) => {
  try {
    const response = await Instance({
      url: `/api/articles/${id}`,
      method: 'patch',
      data
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 上传文章图片
export const uploadArticleImagesAPI = async (files) => {
  try {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('articles', file)
    })
    
    const response = await Instance({
      url: '/api/articles/upload',
      method: 'post',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}
