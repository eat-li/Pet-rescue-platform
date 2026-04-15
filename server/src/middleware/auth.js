const jwt = require("jsonwebtoken")
const { jwtconfig } = require("../config/config.js")
const Admin = require("../models/Admin/Admin")
const User = require("../models/User/User.js")

// 生成token
exports.generateToken = (load) => {
  return jwt.sign(load, jwtconfig.SECRET_KEY, {
    expiresIn: jwtconfig.EXPIRES_IN
  })
}

// 验证
exports.PersonAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({
        code: 401,
        message: "please give token availablily"
      })
    }
    const token = authHeader.split(' ')[1]
    let decoded
    try {
      decoded = jwt.verify(
        token,
        jwtconfig.SECRET_KEY
      )
    } catch (jwtError) {
      return res.status(401).json({
        code: 401,
        message: jwtError.name === 'TokenExpiredError' ? 'token已过期' : 'token验证失败'
      })
    }

    const roleModels = {
      admin: Admin,
      user: User
    }
    // 验证角色类型
    if (!roleModels.hasOwnProperty(decoded.type)) {
      return res.status(401).json({
        code: 401,
        message: '无效的角色类型'
      })
    }
    // 查询用户信息
    const Model = roleModels[decoded.type]
    const user = await Model.findOne({ where: { id: decoded.id } })
    // console.log(user.id)
    if (!user) {
      return res.status(401).json({
        code: 401,
        message: '该角色用户不存在'
      })
    }

    // 统一存储用户信息和角色
    req.currentUser = user
    req.userId = user.id  // 添加 userId 供 Service 使用
    req.role = decoded.type

    next()

  } catch (err) {
    console.error('权限验证中间件错误:', err)
    return res.status(500).json({
      code: 500,
      message: '服务器错误'
    })
  }
}