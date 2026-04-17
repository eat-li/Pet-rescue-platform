const Admin = require('../models/Admin/Admin')
const { Op } = require("sequelize")
const password_encryption = require("../utils/Encryption")
const { generateToken } = require("../middleware/auth")
const validator = require("../utils/Validate")
const { uploadToOSS } = require("../utils/ossUpload")


// 管理员登录功能
exports.AdminLoginService = async (req, res) => {
  const {
    account,
    password
  } = req.body
  try {

    if (!account || !password) {
      return res.status(400).json({
        code: 400,
        message: '账号或密码不能为空'
      })
    }
    // 查询管理员
    const admin = await Admin.findOne({
      where: { account }
    })
    // 管理员不存在
    if (!admin) {
      return res.status(400).json({
        code: 400,
        message: '管理员不存在'
      })
    }
    // 验证登录状态
    if (!admin.loginState) {
      return res.status(400).json({
        code: 400,
        message: '账号已被禁用'
      })
    }
    const isPassword = password_encryption.verifyPassword(password, admin.password)
    if (!isPassword) {
      return res.status(400).json({
        code: 400,
        message: '密码错误'
      })
    }
    // 生成token
    const token = generateToken({
      id: admin.id,
      account: admin.account,
      type: 'admin'
    })
    const { password: _, ...safeAdminData } = admin.toJSON()
    return res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        admin: safeAdminData,
        token
      }
    })

  } catch (err) {
    console.error('管理员登录失败:', err)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，登录失败'
    })
  }
}

// 更新管理员信息
exports.AdminUpdateService = async (req, res) => {
  try {
    const { id } = req.params
    const { username, phone, email, sex, avatar, oldPassword, password } = req.body

    const admin = await Admin.findByPk(id)
    if (!admin) {
      return res.status(404).json({ code: 404, message: '管理员不存在' })
    }

    const updates = {}

    // 修改密码逻辑
    if (password) {
      if (!oldPassword) {
        return res.status(400).json({ code: 400, message: '请提供原密码' })
      }
      const isOldPwdValid = password_encryption.verifyPassword(oldPassword, admin.password)
      if (!isOldPwdValid) {
        return res.status(400).json({ code: 400, message: '原密码错误' })
      }
      updates.password = password_encryption.encryptPassword(password)
    }

    // 更新基本信息
    if (username !== undefined) updates.username = username
    if (phone !== undefined) updates.phone = phone
    if (email !== undefined) updates.email = email
    if (sex !== undefined) updates.sex = sex
    if (avatar !== undefined) updates.avatar = avatar

    await admin.update(updates)

    const { password: _, ...safeAdminData } = admin.toJSON()
    return res.status(200).json({
      code: 200,
      message: '信息更新成功',
      data: safeAdminData
    })
  } catch (err) {
    console.error('更新管理员信息失败:', err)
    return res.status(500).json({ code: 500, message: '更新失败，请稍后再试' })
  }
}

// 管理员头像上传
exports.AdminAvatarUploadService = async (req, res) => {
  try {
    const file = req.file
    if (!file) {
      return res.status(400).json({ code: 400, message: '请上传文件' })
    }
    // 上传到 OSS
    const avatarUrl = await uploadToOSS(file.buffer, file.originalname, 'avatar/admin')
    return res.status(200).json({
      code: 200,
      message: '头像上传成功',
      data: { avatar: avatarUrl }
    })
  } catch (err) {
    console.error('上传头像失败:', err)
    return res.status(500).json({ code: 500, message: '上传失败' })
  }
}