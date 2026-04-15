import Instance from "../http/http"


// 获取宠物列表
export const getPetListAPI = async (params = {}) => {
  try {
    const response = await Instance({
      url: '/api/pets/list',
      method: 'get',
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search || '',
        breed: params.breed || '',
        type: params.type || '',
        vaccineStatus: params.vaccineStatus || '',
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取宠物详情
export const getPetDetailAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/pets/${id}`,
      method: 'get'
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 创建宠物（管理员绑定主人）
export const createPetAPI = async (data) => {
  try {
    const response = await Instance({
      url: '/api/pets',
      method: 'post',
      data: {
        userId:        data.userId,
        nickName:      data.nickName,
        type:          data.type,
        breed:         data.breed,
        sex:           data.sex,
        birthday:      data.birthday,
        vaccineStatus: data.vaccineStatus,
        image:         data.image || '',
        nature:        data.nature || [],
        hobby:         data.hobby  || [],
        other_msg:     data.other_msg || ''
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 更新宠物信息
export const updatePetAPI = async (id, data) => {
  try {
    const response = await Instance({
      url: `/api/pets/${id}`,
      method: 'patch',
      data: {
        nickName:      data.nickName,
        type:          data.type,
        breed:         data.breed,
        sex:           data.sex,
        birthday:      data.birthday,
        vaccineStatus: data.vaccineStatus,
        image:         data.image || '',
        nature:        data.nature || [],
        hobby:         data.hobby  || [],
        other_msg:     data.other_msg || ''
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 删除宠物
export const deletePetAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/pets/${id}`,
      method: 'delete'
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 批量删除宠物
export const batchDeletePetAPI = async (ids) => {
  try {
    const response = await Instance({
      url: '/api/pets/batch',
      method: 'delete',
      data: { ids }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 上传宠物图片
export const uploadPetImageAPI = async (file) => {
  try {
    const formData = new FormData()
    formData.append('pet', file)
    const response = await Instance({
      url: '/api/pets/upload',
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  } catch (err) {
    throw err
  }
}
