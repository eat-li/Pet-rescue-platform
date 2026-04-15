const bcrypt = require('bcryptjs')

// 密码加密函数
const encryptPassword = (password) => {
  // 使用bcrypt加密密码
  const salt = bcrypt.genSaltSync(10) // 生成盐
  return bcrypt.hashSync(password, salt) // 返回加密后的密码
}

// 密码验证函数
const verifyPassword = (password, hashedPassword) => {
  // 使用bcrypt验证密码
  return bcrypt.compareSync(password, hashedPassword)// 返回布尔值，表示密码是否匹配
}

module.exports = {
  encryptPassword,
  verifyPassword,
}