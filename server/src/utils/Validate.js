// 邮箱验证格式
const regEmail = /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/
// 电话验证格式中国电话11位
const regPhone = /^1[3-9]\d{9}$/
// 密码验证格式6-16位
const regPassword = /^[a-zA-Z0-9_]{6,16}$/
// 账号验证格式6-16 位
const regAccount = /^[a-zA-Z0-9_]{6,16}$/

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

module.exports = validator