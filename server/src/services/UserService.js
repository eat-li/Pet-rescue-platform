const User = require("../models/User/User")
const { Op } = require("sequelize")
const password_encryption = require("../utils/Encryption")
const validator = require("../utils/Validate")
const { generateToken } = require("../middleware/auth")
const { uploadToOSS } = require("../utils/ossUpload")

// 用户注册
exports.UserRegister = async (req, res) => {
  try {
    const {
      email,
      username,
      password,
      phone
    } = req.body

    if (!email || !username || !password || !phone) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段: email, username, password, phone'
      })
    }

    if (!validator('email', email)) {
      return res.status(400).json({
        code: 400,
        message: '邮箱格式不正确'
      })
    }

    if (!validator('phone', phone)) {
      return res.status(400).json({
        code: 400,
        message: '手机号格式不正确'
      })
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email },
          { username },
          { phone }
        ]
      },
    })

    if (existingUser) {
      let conflictField = ''
      if (existingUser.email === email) conflictField = '邮箱'
      else if (existingUser.username === username) conflictField = '用户名'
      else if (existingUser.phone === phone) conflictField = '手机号'

      return res.status(409).json({
        code: 409,
        message: `${conflictField}已被注册`
      })
    }

    // 密码加密
    const hashedPassword = password_encryption.encryptPassword(password)
    // 创建用户
    const newUser = await User.create({
      email,
      username,
      password: hashedPassword,
      phone,
      nickname: `用户+${Math.random().toString(36).substring(2, 12)}`
    })
    const { password: _, ...safeUserData } = newUser.toJSON()
    return res.status(201).json({
      code: 201,
      message: '注册成功',
      data: safeUserData
    })

  } catch (err) {
    console.log("注册失败", err)
    return res.status(500).json({
      code: 500,
      message: '注册失败'
    })
  }
}

// 用户登录
exports.UserLoginService = async (req, res) => {
  const { account, password } = req.body
  try {
    if (!account || !password) {
      return res.status(400).json({
        code: 400,
        message: '账号或密码不能为空'
      })
    }
    const isEmail = validator('email', account)
    const isPhone = validator('phone', account)

    if (!isEmail && !isPhone) {
      return res.status(400).json({
        code: 400,
        message: '请输入正确的邮箱或手机号'
      })
    }

    const condition = isEmail ? { email: account } : { phone: account }
    const user = await User.findOne({
      where: condition
    })
    if (!user) {
      return res.status(400).json({
        code: 400,
        message: '用户不存在'
      })
    }
    if (!user.status) {
      return res.status(400).json({
        code: 400,
        message: '用户被禁用'
      })
    }
    const isPassword = password_encryption.verifyPassword(password, user.password)
    if (!isPassword) {
      return res.status(400).json({
        code: 400,
        message: '密码错误'
      })
    }

    const token = generateToken({
      id: user.id,
      account: user.account,
      type: 'user'
    })
    const { password: _, ...safeUserData } = user.toJSON()

    return res.status(200).json({
      code: 200,
      message: '登录成功',
      data: {
        user: safeUserData,
        token
      }
    })


  } catch (err) {
    console.log("登录失败", err)
    return res.status(500).json({
      code: 500,
      message: '登录失败'
    })
  }
}

// 更新用户信息
exports.UserUpdateService = async (req, res) => {
  const { id: userId } = req.currentUser
  const { id } = req.params
  const updateData = req.body
  const role = req.role
  try {
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '用户id不能为空'
      })
    }
    // 只允许用户修改自己的信息，或管理员修改任何用户信息
    if (Number(id) !== userId && role !== 'admin') {
      return res.status(401).json({
        code: 401,
        message: '用户权限不足'
      })
    }
    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }
    const updateFields = [
      'nickname',
      'avatar',
      'phone',
      'email',
      'password',
      'sex'
    ]
    const updates = {}
    for (const field of updateFields) {
      if (updateData[field] !== undefined) {
        // 特殊处理密码字段
        if (field === 'password') {
          // 验证旧密码
          if (!updateData.oldPassword) {
            return res.status(400).json({
              code: 400,
              message: '修改密码需要提供旧密码'
            })
          }
          // 验证旧密码是否正确
          if (!password_encryption.verifyPassword(updateData.oldPassword, user.password)) {
            return res.status(401).json({
              code: 401,
              message: '旧密码不正确'
            })
          }
          // 加密新密码
          updates.password = password_encryption.encryptPassword(updateData.password)
        }
        // 处理邮箱/手机号唯一性验证
        else if (field === 'email' || field === 'phone') {
          // 手机和邮箱格式判断
          if (!validator(field, updateData[field])) {
            return res.status(400).json({
              code: 400,
              message: `${field === 'email' ? '邮箱' : '手机号'}格式错误`
            })
          }

          const existingUser = await User.findOne({
            where: {
              [field]: updateData[field],
              id: { [Op.ne]: id } // 排除当前用户
            }
          })
          if (existingUser) {
            return res.status(409).json({
              code: 409,
              message: `${field === 'email' ? '邮箱' : '手机号'}已被使用`
            })
          }
          updates[field] = updateData[field]
        }
        else if (field === 'sex') {

          if (validator('sex', updateData[field])) {
            updates[field] = updateData[field]
          }
          else {
            return res.status(400).json({
              code: 400,
              message: '性别格式错误'
            })
          }
        }
        // 普通字段直接更新
        else {
          updates[field] = updateData[field]
        }
      }
    }
    // 如果没有可更新的
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        code: 400,
        message: '没有可更新的字段'
      })
    }
    await user.update(updates)
    const updatedUser = await User.findByPk(id)
    const { password: _, ...safeUserData } = updatedUser.toJSON()
    return res.status(200).json({
      code: 200,
      message: '更新成功',
      data: safeUserData
    })
  } catch (err) {
    console.log("更新用户信息失败", err)
    return res.status(500).json({
      code: 500,
      message: '更新用户信息失败'
    })
  }
}

// 删除用户
exports.UserDeleteService = async (req, res) => {
  const { id } = req.params
  const role = req.role
  try {
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '用户ID不能为空'
      })
    }
    if (role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可删除用户'
      })
    }
    const res_user = await User.destroy({
      where: { id }
    })
    if (res_user === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }
    return res.status(200).json({
      code: 200,
      message: '用户删除成功'
    })
  } catch (err) {
    console.error('删除用户失败:', err)
    return res.status(500).json({
      code: 500,
      message: '删除用户失败'
    })
  }
}

// 批量删除
exports.BatchDeleteUserService = async (req, res) => {
  const role = req.role
  const { ids } = req.body
  try {
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '用户ID列表不能为空,且必须为数组格式'
      })
    }
    if (role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可删除用户'
      })
    }
    const validIds = ids.filter(id => id && !isNaN(id))
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        code: 400,
        message: '存在无效的用户ID'
      })
    }
    const result = await User.destroy({
      where: {
        id: {
          [Op.in]: validIds
        }
      }
    })
    if (result === 0) {
      return res.status(404).json({
        code: 404,
        message: '没有找到要删除的用户'
      })
    }
    return res.status(200).json({
      code: 200,
      message: `成功删除 ${result} 个用户`,
      deletedCount: result
    })
  } catch (err) {
    console.error('批量删除用户失败:', err)
    return res.status(500).json({
      code: 500,
      message: '批量删除用户失败'
    })
  }
}

// 获取用户数量
exports.GetAllUserCountService = async (req, res) => {
  try {
    const count = await User.count();
    return res.status(200).json({
      code: 200,
      message: '获取所有用户数量成功',
      data: count
    });
  } catch (err) {
    console.error('获取所有用户数量失败:', err);
    return res.status(500).json({
      code: 500,
      message: '获取所有用户数量失败，请稍后再试',
      data: 0,
    })
  }
}

// 获取用户列表
exports.UserListService = async (req, res) => {
  const role = req.role
  const page = parseInt(req.query.page) || 1
  const limit = parseInt(req.query.limit) || 10
  const search = req.query.search || '' // 添加搜索参数

  try {
    if (role !== 'admin') {
      return res.status(400).json({
        code: 400,
        message: '权限不足'
      })
    }
    const offset = (page - 1) * limit
    let whereCondition = {}
    if (search) {
      whereCondition = {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } },
          { nickname: { [Op.like]: `%${search}%` } }
        ]
      }
    }
    const { count, rows: users } = await User.findAndCountAll({
      where: whereCondition, // 添加搜索条件
      attributes: {
        exclude: ['password'] // 排除密码字段
      },
      order: [['createdAt', 'DESC']], // 按创建时间倒序排列
      limit: limit,
      offset: offset,
    })

    const totalPages = Math.ceil(count / limit)

    return res.status(200).json({
      code: 200,
      message: '获取用户列表成功',
      data: {
        users,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: count,
          totalPages: totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    })


  } catch (err) {
    console.log("获取用户列表失败", err)
    return res.status(500).json({
      code: 500,
      message: '获取用户列表失败'
    })
  }
}

// 修改用户状态
exports.UserUpdateStatusService = async (req, res) => {
  const role = req.role
  try {
    const { id } = req.params
    const { status } = req.body
    if (role !== 'admin') {
      return res.status(401).json({
        code: 401,
        message: '无权限'
      })
    }
    // 转为bool
    let statusBool
    if (status === 'true') {
      statusBool = true
    } else if (status === 'false') {
      statusBool = false
    } else {
      return res.status(400).json({
        code: 400,
        message: '状态参数错误'
      })
    }
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '用户ID不能为空'
      })
    }

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    await user.update({ status: statusBool })

    return res.status(200).json({
      code: 200,
      message: '用户状态更新成功',
      data: {
        userId: id,
        newStatus: statusBool,
        statusText: statusBool ? '正常' : '禁用'
      }
    })

  } catch (err) {
    console.error('修改用户状态失败:', err)
    return res.status(500).json({
      code: 500,
      message: '修改用户状态失败'
    })


  }
}

// 获取用户信息
exports.UserDetailService = async (req, res) => {
  const { id } = req.params  // 从URL参数获取用户ID

  try {
    // 1. 参数验证
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        code: 400,
        message: '无效的用户ID'
      })
    }

    const user = await User.findByPk(id, {
      attributes: {
        exclude: ['password']
      }
    })

    // 用户不存在处理
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    return res.status(200).json({
      code: 200,
      message: '获取用户详情成功',
      data: user
    })

  } catch (err) {
    console.error('获取用户详情失败:', err)
    return res.status(500).json({
      code: 500,
      message: '获取用户详情失败'
    })
  }
}


//用户头像上传
exports.UserUploadAvatarService = async (req, res) => {
  try {
    const { id } = req.params
    const file = req.file
    // 如果文件未上传
    if (!file) return res.status(400).json({ code: 400, message: '请上传文件' })
    //查看用户是否存在
    const user = await User.findByPk(id)
    if (!user) return res.status(404).json({ code: 404, message: '用户不存在' })

    // 上传到 OSS
    const avatarUrl = await uploadToOSS(file.buffer, file.originalname, `avatar/user/${id}`)
    
    // 更新用户头像
    await user.update({ avatar: avatarUrl })
    res.status(200).json({
      code: 200,
      message: '更新用户头像成功',
      data: {
        avatar: avatarUrl
      }
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      code: 500,
      message: '上传头像失败'
    })
  }
}