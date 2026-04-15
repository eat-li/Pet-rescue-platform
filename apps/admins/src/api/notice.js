import Instance from "../http/http"


// 获取公告列表
export const getNoticeListAPI = async (params = {}) => {
  try {
    const response = await Instance({
      url: '/api/notices',
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

// 删除公告
export const deleteNoticeAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/notices/${id}`,
      method: 'delete'
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 批量删除公告
export const batchDeleteNoticeAPI = async (ids) => {
  try {
    const response = await Instance({
      url: '/api/notices/batch',
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

// 更新公告状态
export const updateNoticeStatusAPI = async (id, status) => {
  try {
    const response = await Instance({
      url: `/api/notices/status/${id}`,
      method: 'patch',
      data: {
        status: status.toString()  // 将布尔值转换为字符串
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 创建公告
export const createNoticeAPI = async (data) => {
  try {
    const response = await Instance({
      url: '/api/notices',
      method: 'post',
      data: {
        title: data.title,
        content: data.content,
        cover: data.cover || ''
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取公告详情
export const getNoticeDetailAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/notices/${id}`,
      method: 'get'
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 更新公告
export const updateNoticeAPI = async (id, data) => {
  try {
    const response = await Instance({
      url: `/api/notices/${id}`,
      method: 'patch',
      data: {
        title: data.title,
        content: data.content,
        cover: data.cover || ''
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 上传公告图片
export const uploadNoticeImageAPI = async (file) => {
  try {
    const formData = new FormData()
    formData.append('notice', file)
    
    const response = await Instance({
      url: '/api/notices/upload',
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
