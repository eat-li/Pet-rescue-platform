import Instance from "../http/http"

// 获取所有评论
export const getAllCommentAPI = async (params = {}) => {
  try {
    const response = await Instance({
      url: '/api/articles/admin/comments',
      method: 'get',
      params,
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 删除评论
export const deleteCommentAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/articles/comments/${id}`,
      method: 'delete',
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 修改评论状态
export const updateCommentStatusAPI = async (id, status) => {
  try {
    const response = await Instance({
      url: `/api/articles/comments/${id}`,
      method: 'patch',
      data: {
        status,
      },
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 批量删除评论
export const batchDeleteCommentAPI = async (ids) => {
  try {
    const response = await Instance({
      url: `/api/articles/comments/batch`,  // 修复：添加 /articles 前缀
      method: 'delete',
      data: {
        ids,
      },
    })
    return response.data
  } catch (err) {
    throw err
  }
}
