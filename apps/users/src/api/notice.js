import request from '../http/http.js'

/**
 * 获取公告列表（前台用户）
 * @param {Object} params - 查询参数
 * @param {number} params.page - 页码，默认1
 * @param {number} params.limit - 每页数量，默认10
 * @returns {Promise}
 */
export const getNoticeListAPI = (params = {}) => {
  return request.get('/api/notices', { params })
}

/**
 * 获取公告详情（前台用户）
 * @param {number} id - 公告ID
 * @returns {Promise}
 */
export const getNoticeDetailAPI = (id) => {
  return request.get(`/api/notices/${id}`)
}
