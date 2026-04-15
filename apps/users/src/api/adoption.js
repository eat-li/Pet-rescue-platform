import Instance from '../http/http'

// 获取领养列表
export const getAdoptionListAPI = async (params) => {
  try {
    const response = await Instance({
      url: '/api/adoptions',
      method: 'get',
      params
    })
    return response.data.data // { adoptions, pagination }
  } catch (err) {
    console.error('获取领养列表失败:', err)
    throw err
  }
}

// 获取单个领养详情
export const getAdoptionDetailAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/adoptions/${id}`,
      method: 'get'
    })
    return response.data.data
  } catch (err) {
    console.error('获取领养详情失败:', err)
    throw err
  }
}

// 创建领养信息
// data 结构: { petInfo: {...} | petId, fee, money, request: {requirements, location, contact}, other_msg }
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

// 删除领养信息
export const deleteAdoptionAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/adoptions/${id}`,
      method: 'delete'
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 上传领养宠物图片
export const uploadAdoptionImageAPI = async (formData) => {
  try {
    const response = await Instance({
      url: '/api/adoptions/upload',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data // { code, message, data: { fileUrl } }
  } catch (err) {
    throw err
  }
}

// ─── 领养申请相关 API ─────────────────────────────────────────

// 提交领养申请
export const submitAdoptionApplicationAPI = async (data) => {
  try {
    const response = await Instance({
      url: '/api/adoptions/applications',
      method: 'post',
      data
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取我提交的领养申请列表
export const getMyApplicationsAPI = async () => {
  try {
    const response = await Instance({
      url: '/api/adoptions/applications/my',
      method: 'get'
    })
    return response.data.data
  } catch (err) {
    throw err
  }
}

// 获取我发布的领养帖子列表
export const getMyAdoptionsAPI = async () => {
  try {
    const response = await Instance({
      url: '/api/adoptions/my',
      method: 'get'
    })
    return response.data.data
  } catch (err) {
    throw err
  }
}

// 获取某个领养帖子的申请列表（发布者查看）
export const getAdoptionApplicationsAPI = async (adoptionId) => {
  try {
    const response = await Instance({
      url: `/api/adoptions/${adoptionId}/applications`,
      method: 'get'
    })
    return response.data.data
  } catch (err) {
    throw err
  }
}

// 更新申请状态（发布者审批）
export const updateApplicationStatusAPI = async (appId, status) => {
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
