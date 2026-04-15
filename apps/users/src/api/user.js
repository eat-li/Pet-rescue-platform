import Instance from "../http/http"

// 注册
export const registerAPI = async (data) => {
  try {
    const response = await Instance.post('/api/users/register', {
      username: data.username,
      email: data.email,
      phone: data.phone,
      password: data.password
    })
    return response.data// 返回响应数据
  } catch (error) {
    // 重新抛出错误，让调用方处理
    throw error;
  }
}

// 登录
export const loginAPI = async (data) => {
  try {
    const response = await Instance.post('/api/users/login', {
      account: data.account, // 邮箱或手机号
      password: data.password
    })
    return response.data // 返回响应数据
  } catch (error) {
    // 重新抛出错误，让调用方处理
    throw error
  }
}

// 获取用户数量
export const getUserCountAPI = async () => {
  try {
    const response = await Instance({
      url: `/api/users/count`,
      method: 'get',
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 修改用户信息
export const updateUserInfoAPI = async (id, data) => {
  try {
    const response = await Instance({
      url: `/api/users/${id}`,
      method: 'patch',
      data
    })
    return response.data
  } catch (err) {
    throw err
  }
}
// 用户头像上传
export const uploadAvatarAPI = async (id, data) => {
  try {
    const response = await Instance({
      url: `/api/users/avatar/${id}`,
      method: 'post',
      data,
    })
    return response.data
  } catch (err) {
    throw err
  }
}
