import Instance from "../http/http"

// 管理员登录
export const AdminLoginAPI = async (data) => {
  try {
    const response = await Instance({
      url: '/api/admins/login',
      method: 'post',
      data
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 更新管理员信息
export const updateAdminInfoAPI = async (id, data) => {
  try {
    const response = await Instance({
      url: `/api/admins/${id}`,
      method: 'patch',
      data
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 上传管理员头像
export const uploadAdminAvatarAPI = async (id, file) => {
  try {
    const formData = new FormData()
    formData.append('avatar', file)
    const response = await Instance({
      url: `/api/admins/avatar/${id}`,
      method: 'post',
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  } catch (err) {
    throw err
  }
}