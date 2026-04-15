import request from '../http/http.js'

// =============== 服务相关 ===============
// 获取服务列表
export const getServiceListAPI = (params = {}) => {
  return request.get('/api/services', { params })
}

// 获取服务详情
export const getServiceDetailAPI = (id) => {
  return request.get(`/api/services/${id}`)
}

// =============== 预约相关 ===============
// 创建预约
export const createBookingAPI = (data) => {
  return request.post('/api/user/booking', data)
}

// 获取用户预约列表
export const getUserBookingsAPI = (params = {}) => {
  return request.get('/api/user/bookings', { params })
}

// 获取预约详情
export const getBookingDetailAPI = (id) => {
  return request.get(`/api/user/booking/${id}`)
}

// 取消预约
export const cancelBookingAPI = (id, data = {}) => {
  return request.patch(`/api/user/booking/${id}/cancel`, data)
}

// =============== 购物车相关 ===============
// 添加到购物车
export const addToCartAPI = (data) => {
  return request.post('/api/user/cart', data)
}

// 获取购物车列表
export const getCartListAPI = () => {
  return request.get('/api/user/cart')
}

// 更新购物车项
export const updateCartItemAPI = (id, data) => {
  return request.patch(`/api/user/cart/${id}`, data)
}

// 删除购物车项
export const deleteCartItemAPI = (id) => {
  return request.delete(`/api/user/cart/${id}`)
}

// 批量删除购物车项
export const batchDeleteCartAPI = (ids) => {
  return request.delete('/api/user/cart/batch', { data: { ids } })
}
