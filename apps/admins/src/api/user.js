import Instance from "../http/http"

// 获取用户列表
export const getUserListAPI = async (params = {}) => {
  try {
    const response = await Instance({
      url: '/api/users/list',
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

// 删除用户
export const deleteUserAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/users/${id}`,
      method: 'delete',
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 批量删除用户
export const batchDeleteUserAPI = async (ids) => {
  try {
    const response = await Instance({
      url: `/api/users/batch`,
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

// 切换用户的状态
export const toggleUserStatusAPI = async (id, status) => {
  try {
    const response = await Instance({
      url: `/api/users/status/${id}`,
      method: 'patch',
      data: {
        status
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}


// 更新用户信息,传入当前修改的用户的id，和更新的字段
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


