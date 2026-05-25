// 邮箱验证格式
const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
// 电话验证格式中国电话11位
const regPhone = /^1[3-9]\d{9}$/
// 密码验证格式6-16位
const regPassword = /^[a-zA-Z0-9_]{6,16}$/
// 账号验证格式6-16 位
const regAccount = /^[a-zA-Z0-9_]{6,16}$/

// 有效的疫苗状态列表
const validVaccineStatuses = ['unvaccinated', 'one_dose', 'two_doses', 'three_doses', 'completed']

// 规则验证函数
/**
 * 验证指定类型的值是否符合格式要求
 * @param {string} validateType - 验证类型，可选值：'email'、'mobile'、'password'、'account'、'sex'
 * @param {string} value - 需要验证的值
 * @returns {boolean|string} 验证结果，对于sex类型可能返回true/false/'sexType Error'，其他类型返回boolean值
 */
const validator = (validateType, value) => {
  // 验证邮箱格式
  if (validateType === 'email') {
    return regEmail.test(value);
  }
  // 验证手机号格式
  if (validateType === 'phone') {
    return regPhone.test(value);
  }
  // 验证密码格式
  if (validateType === 'password') {
    return regPassword.test(value);
  }
  // 验证性别类型
  if (validateType === 'sex') {
    if (value === true) {
      return true
    } else if (value === false) {
      return false
    } else {
      return 'sexType Error'
    }
  }
  return false;
}

/**
 * 验证并转换性别字段
 * @param {any} sex - 性别值（布尔值或字符串）
 * @returns {{success: boolean, value?: boolean, error?: string}} 验证结果
 */
validator.validateSex = (sex) => {
  if (typeof sex === 'boolean') {
    return { success: true, value: sex }
  }

  if (typeof sex === 'string') {
    const lowerSex = sex.toLowerCase()
    if (lowerSex === 'true') {
      return { success: true, value: true }
    } else if (lowerSex === 'false') {
      return { success: true, value: false }
    }
  }

  return { success: false, error: '宠物性别必须为布尔值（true/false）' }
}

/**
 * 验证疫苗状态
 * @param {string} status - 疫苗状态
 * @returns {{success: boolean, error?: string}} 验证结果
 */
validator.validateVaccineStatus = (status) => {
  if (!validVaccineStatuses.includes(status)) {
    return {
      success: false,
      error: `无效的疫苗状态，可选值: ${validVaccineStatuses.join(', ')}`
    }
  }
  return { success: true }
}

/**
 * 验证并解析分页参数
 * @param {any} page - 页码
 * @param {any} limit - 每页数量
 * @param {number} maxLimit - 最大每页数量限制（默认100）
 * @returns {{success: boolean, page?: number, limit?: number, error?: string}} 验证结果
 */
validator.validatePagination = (page, limit, maxLimit = 100) => {
  const parsedPage = parseInt(page) || 1
  const parsedLimit = parseInt(limit) || 10

  if (parsedPage < 1 || parsedLimit < 1) {
    return { success: false, error: '页码和每页数量必须大于0' }
  }

  if (parsedLimit > maxLimit) {
    return { success: false, error: `每页数量不能超过${maxLimit}` }
  }

  return { success: true, page: parsedPage, limit: parsedLimit }
}

module.exports = validator