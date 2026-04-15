import Instance from "../http/http"

// 获取服务列表
export const getServiceListAPI = async (params = {}) => {
  try {
    const response = await Instance({
      url: '/api/services',
      method: 'get',
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        type: params.type || '',
        status: params.status
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取服务详情
export const getServiceDetailAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/services/${id}`,
      method: 'get'
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 创建服务
export const createServiceAPI = async (data) => {
  try {
    const response = await Instance({
      url: '/api/services',
      method: 'post',
      data: {
        name: data.name,
        type: data.type,
        price: data.price,
        weight: data.weight,
        content: data.content,
        image: data.image || ''
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 更新服务
export const updateServiceAPI = async (id, data) => {
  try {
    const response = await Instance({
      url: `/api/services/${id}`,
      method: 'patch',
      data: {
        name: data.name,
        type: data.type,
        price: data.price,
        weight: data.weight,
        content: data.content,
        status: data.status,
        image: data.image || ''
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 删除服务
export const deleteServiceAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/services/${id}`,
      method: 'delete'
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 批量删除服务
export const batchDeleteServiceAPI = async (ids) => {
  try {
    const response = await Instance({
      url: '/api/services/batch',
      method: 'delete',
      data: { ids }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 更新服务状态（上下架）
export const updateServiceStatusAPI = async (id, status) => {
  try {
    const response = await Instance({
      url: `/api/services/status/${id}`,
      method: 'patch',
      data: { status }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 上传服务图片
export const uploadServiceImageAPI = async (file) => {
  try {
    const formData = new FormData()
    formData.append('service', file)
    
    const response = await Instance({
      url: '/api/services/upload',
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
