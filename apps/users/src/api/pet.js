import Instance from "../http/http"

// 获取宠物列表
export const getPetListAPI = async (params) => {
  try {
    const response = await Instance({
      url: `/api/pets`,
      method: 'get',
      params,
    })
    // The backend returns { code, message, data: { pets, pagination, ... } }
    // We return the content of the 'data' property which contains pets and pagination
    return response.data.data
  } catch (err) {
    console.error("获取宠物列表失败:", err)
    throw err
  }
}

// 获取宠物数量
export const getPetCountAPI = async () => {
  try {
    const response = await Instance({
      url: `/api/pets/count`,
      method: 'get',
    })
    return response.data
  } catch (err) {
    throw err
  }
}
// 创建宠物
export const createPetAPI = async (data) => {
  try {
    const response = await Instance({
      url: '/api/pets',
      method: 'post',
      data,
    })
    return response.data

  } catch (err) {
    throw err
  }
}

// 上传宠物图片
export const uploadPetImageAPI = async (data) => {
  try {
    const response = await Instance({
      url: '/api/pets/upload',
      method: 'post',
      data,
    })
    return response.data

  } catch (err) {
    throw err
  }
}

// 获取单个宠物详情
export const getPetDetailAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/pets/${id}`,
      method: 'get',
    })
    return response.data.data
  } catch (err) {
    console.error("获取宠物详情失败:", err)
    throw err
  }
}

