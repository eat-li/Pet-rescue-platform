import Instance from '../http/http'

// 获取领养列表（管理员可查看所有）
export const getAllAdoptionAPI = async (params = {}) => {
  try {
    const response = await Instance({
      url: '/api/adoptions',
      method: 'get',
      params,
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 更新领养状态（审批）
export const updateAdoptionStatusAPI = async (id, status) => {
  try {
    const response = await Instance({
      url: `/api/adoptions/${id}/status`,
      method: 'patch',
      data: { status },
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 删除领养信息
export const deleteAdoptionAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/adoptions/${id}`,
      method: 'delete',
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 批量删除领养信息
export const batchDeleteAdoptionAPI = async (ids) => {
  try {
    const response = await Instance({
      url: '/api/adoptions/batch',
      method: 'delete',
      data: { ids }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 创建领养信息
export const createAdoptionAPI = async (data) => {
  try {
    const response = await Instance({
      url: '/api/adoptions',
      method: 'post',
      data
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 上传领养宠物图片
export const uploadAdoptionImageAPI = async (file) => {
  try {
    const formData = new FormData()
    formData.append('adoption', file)
    
    const response = await Instance({
      url: '/api/adoptions/upload',
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

// ─── 领养申请相关 API ─────────────────────────────────────────

// 管理员获取所有领养申请列表
export const getAllAdoptionApplicationsAPI = async (params = {}) => {
  try {
    const response = await Instance({
      url: '/api/adoptions/applications',
      method: 'get',
      params
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 管理员更新领养申请状态
export const updateAdoptionApplicationStatusAPI = async (appId, status) => {
  try {
    const response = await Instance({
      url: `/api/adoptions/applications/${appId}/status`,
      method: 'patch',
      data: { status }
    })
    return response.data
  } catch (err) {
    throw err
  }
}
