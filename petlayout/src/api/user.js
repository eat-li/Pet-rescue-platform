import request from '@/http/request.js'
import { customAlphabet, nanoid } from 'nanoid'

// 创建自定义的nanoid生成器
const generateUserId = customAlphabet('1234567890abcdef', 10)
// 用户注册
export const registerAPI = async (userData) => {
  try {
    // 检查用户名是否已存在
    const checkRes = await request.get(`/users?username=${userData.account}`)
    if (checkRes.data.length > 0) {
      throw new Error('用户名已被使用')
    }

    const newId = `U${generateUserId()}`

    // 构建用户对象
    const newUser = {
      id: newId,
      username: userData.account,
      password: userData.password,
      role: "user",
      avatar: "@/assets/avatar.png",//默认头像
      nickname: userData.account,
      registration_time: new Date().toISOString(),
      last_login: new Date().toISOString(),
      pets: []
    }

    return request.post('/users', newUser)
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message)
  }
}

// 登录接口
export const loginAPI = async (userData) => {
  try {
    const res = await request.get(
      `/users?username=${userData.account}&password=${userData.password}`
    )
    if (res.data.length === 0) {
      throw new Error('用户名或密码错误')
    }
    // 生成一个假的token
    const fakeToken = `tkn_${Date.now()}_${nanoid(24)}`;

    return {
      user: res.data[0],
      token: fakeToken
    }
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message)
  }
}