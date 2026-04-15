import Instance from "../http/http"

// 获取预约列表
export const getBookingListAPI = async (params = {}) => {
  try {
    const response = await Instance({
      url: '/api/bookings',
      method: 'get',
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        status: params.status || '',
        search: params.search || ''
      }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取预约详情
export const getBookingDetailAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/bookings/${id}`,
      method: 'get'
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 更新预约状态
export const updateBookingStatusAPI = async (id, status, cancelReason = '') => {
  try {
    const response = await Instance({
      url: `/api/bookings/status/${id}`,
      method: 'patch',
      data: { status, cancelReason }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 删除预约
export const deleteBookingAPI = async (id) => {
  try {
    const response = await Instance({
      url: `/api/bookings/${id}`,
      method: 'delete'
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 批量删除预约
export const batchDeleteBookingAPI = async (ids) => {
  try {
    const response = await Instance({
      url: '/api/bookings/batch',
      method: 'delete',
      data: { ids }
    })
    return response.data
  } catch (err) {
    throw err
  }
}

// 获取预约统计
export const getBookingStatsAPI = async () => {
  try {
    const response = await Instance({
      url: '/api/bookings/stats',
      method: 'get'
    })
    return response.data
  } catch (err) {
    throw err
  }
}
