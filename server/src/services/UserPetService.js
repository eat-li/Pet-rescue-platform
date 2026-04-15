const Pet = require('../models/User/MyPet')
const { Op } = require('sequelize')
const User = require('../models/User/User')

// 添加用户宠物
exports.UserPetAddService = async (req, res) => {
  try {
    // 获取当前用户ID（管理员可通过 body.userId 指定绑定用户）
    const userId = (req.role === 'admin' && req.body.userId)
      ? parseInt(req.body.userId)
      : req.currentUser.id

    // 提取请求数据
    const {
      nickName,
      vaccineStatus,
      sex,
      breed,
      type,
      birthday,
      image,
      nature = [],
      hobby = [],
      other_msg = ''
    } = req.body
    let currentSex = sex

    // 验证必填字段
    if (!nickName || !vaccineStatus || sex === undefined || !breed || !type || !birthday || !image) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段，请检查宠物信息'
      })
    }

    // 验证疫苗状态有效性
    const validVaccineStatus = ['unvaccinated', 'one_dose', 'two_doses', 'three_doses', 'completed']
    if (!validVaccineStatus.includes(vaccineStatus)) {
      return res.status(400).json({
        code: 400,
        message: `无效的疫苗状态，可选值: ${validVaccineStatus.join(', ')}`
      })
    }

    // 验证性别是否为布尔值（兼容字符串形式）
    if (typeof sex !== 'boolean') {
      if (typeof sex === 'string') {
        const lowerSex = sex.toLowerCase()
        if (lowerSex === 'true') {
          currentSex = true
        } else if (lowerSex === 'false') {
          currentSex = false
        } else {
          return res.status(400).json({
            code: 400,
            message: '宠物性别必须为true或false'
          })
        }
      } else {
        return res.status(400).json({
          code: 400,
          message: '宠物性别必须为布尔值（true/false）'
        })
      }
    }

    // 验证出生日期格式
    if (isNaN(new Date(birthday).getTime())) {
      return res.status(400).json({
        code: 400,
        message: '无效的出生日期格式'
      })
    }

    // 验证性格和爱好是否为数组
    if (!Array.isArray(nature) || !Array.isArray(hobby)) {
      return res.status(400).json({
        code: 400,
        message: '宠物性格和爱好必须为数组格式'
      })
    }

    // 验证用户是否存在
    const user = await User.findByPk(userId)
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    // 创建宠物记录，关联当前用户
    const newPet = await Pet.create({
      nickName,
      vaccineStatus,
      sex: currentSex,
      breed,
      type,
      birthday,
      image,
      nature,
      hobby,
      other_msg,
      userId // 关联到当前用户
    })

    // 返回创建的宠物信息
    return res.status(201).json({
      code: 201,
      message: '宠物信息添加成功',
      data: newPet
    })

  } catch (err) {
    console.error('添加宠物信息失败:', err)
    return res.status(500).json({
      code: 500,
      message: '添加宠物信息失败，请稍后再试'
    })
  }
}

// 获取用户所有宠物信息
exports.UserPetGetAllService = async (req, res) => {
  try {
    // 获取当前登录用户ID（用于权限判断）
    const currentUserId = req.currentUser.id

    // 目标用户ID：优先从查询参数获取，否则默认当前用户
    const targetUserId = req.query.userId ? parseInt(req.query.userId) : currentUserId

    // 验证目标用户ID是否有效
    if (isNaN(targetUserId)) {
      return res.status(400).json({
        code: 400,
        message: '无效的用户ID'
      })
    }

    // 获取分页参数，默认第一页，每页10条
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10

    // 验证分页参数
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({
        code: 400,
        message: '无效的分页参数，page和limit必须为正整数'
      })
    }

    // 验证目标用户是否存在
    const targetUser = await User.findByPk(targetUserId)
    if (!targetUser) {
      return res.status(404).json({
        code: 404,
        message: '目标用户不存在'
      })
    }

    // 计算偏移量
    const offset = (page - 1) * limit

    // 查询目标用户的宠物总数
    const totalPets = await Pet.count({
      where: { userId: targetUserId }
    })

    // 查询目标用户的所有宠物（按添加时间倒序）
    const pets = await Pet.findAll({
      where: { userId: targetUserId },
      order: [['createdAt', 'DESC']], // 最新添加的宠物在前
      limit,
      offset
    })

    // 构建分页信息
    const totalPages = Math.ceil(totalPets / limit)
    const pagination = {
      currentPage: page,
      pageSize: limit,
      totalItems: totalPets,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }

    return res.status(200).json({
      code: 200,
      message: '获取宠物信息成功',
      data: {
        pets,
        pagination,
        targetUserId // 返回目标用户ID，方便前端展示上下文
      }
    })

  } catch (err) {
    console.error('获取用户宠物信息失败:', err)
    return res.status(500).json({
      code: 500,
      message: '获取宠物信息失败，请稍后再试'
    })
  }
}

// 获取全部宠物（管理员）
exports.AdminGetAllPetService = async (req, res) => {
  try {
    // 权限验证：仅管理员可访问
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可查看全部宠物信息'
      })
    }

    // 获取分页参数和筛选条件
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const {
      userId,
      type,
      breed,
      vaccineStatus,
      search  // 用于模糊搜索宠物昵称
    } = req.query

    // 验证分页参数
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({
        code: 400,
        message: '无效的分页参数，page和limit必须为正整数'
      })
    }

    // 构建查询条件
    const whereCondition = {}

    // 按用户ID筛选
    if (userId) {
      whereCondition.userId = userId
    }

    // 按宠物类型筛选
    if (type) {
      whereCondition.type = type
    }

    // 按宠物品种筛选
    if (breed) {
      whereCondition.breed = {
        [Op.like]: `%${breed}%`  // 支持模糊匹配
      }
    }

    // 按疫苗状态筛选
    if (vaccineStatus) {
      const validStatus = ['unvaccinated', 'one_dose', 'two_doses', 'three_doses', 'completed']
      if (validStatus.includes(vaccineStatus)) {
        whereCondition.vaccineStatus = vaccineStatus
      } else {
        return res.status(400).json({
          code: 400,
          message: `无效的疫苗状态，可选值: ${validStatus.join(', ')}`
        })
      }
    }

    // 按昵称模糊搜索
    if (search) {
      whereCondition.nickName = {
        [Op.like]: `%${search}%`
      }
    }

    // 计算偏移量
    const offset = (page - 1) * limit

    // 查询宠物总数
    const totalPets = await Pet.count({
      where: whereCondition
    })

    // 查询宠物列表（按添加时间倒序），关联用户信息
    const pets = await Pet.findAll({
      where: whereCondition,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'nickname', 'avatar']  // 只返回必要的用户信息
      }],
      order: [['createdAt', 'DESC']],  // 最新添加的宠物在前
      limit,
      offset
    })

    // 构建分页信息
    const totalPages = Math.ceil(totalPets / limit)
    const pagination = {
      currentPage: page,
      pageSize: limit,
      totalItems: totalPets,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }

    return res.status(200).json({
      code: 200,
      message: '获取全部宠物信息成功',
      data: {
        pets,
        pagination
      }
    })

  } catch (err) {
    console.error('管理员获取全部宠物信息失败:', err)
    return res.status(500).json({
      code: 500,
      message: '获取宠物信息失败，请稍后再试'
    })
  }
}

// 更新宠物信息（支持部分字段更新）
exports.UserPetUpdateService = async (req, res) => {
  // 获取当前用户ID
  const currentUserId = req.currentUser.id;
  // 获取宠物ID
  const { id: petId } = req.params;
  // 获取更新数据
  const updateData = req.body;

  try {
    // 验证宠物ID
    if (!petId) {
      return res.status(400).json({
        code: 400,
        message: '宠物ID不能为空'
      });
    }

    // 查找宠物
    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({
        code: 404,
        message: '宠物信息不存在'
      });
    }

    // 权限验证（管理员可编辑任意宠物）
    if (req.role !== 'admin' && pet.userId !== currentUserId) {
      return res.status(403).json({
        code: 403,
        message: '没有权限更新该宠物信息'
      });
    }

    // 定义可更新字段
    const updateFields = [
      'nickName',
      'vaccineStatus',
      'sex',
      'breed',
      'type',
      'birthday',
      'image',
      'nature',
      'hobby',
      'other_msg'
    ];
    const updates = {};

    // 处理每个字段
    for (const field of updateFields) {
      // 只处理提供了的字段
      if (updateData[field] !== undefined) {
        switch (field) {
          case 'vaccineStatus': {
            const validStatus = ['unvaccinated', 'one_dose', 'two_doses', 'three_doses', 'completed'];
            if (!validStatus.includes(updateData[field])) {
              return res.status(400).json({
                code: 400,
                message: `无效的疫苗状态，可选值: ${validStatus.join(', ')}`
              });
            }
            updates[field] = updateData[field];
            break;
          }

          case 'sex': {
            let currentSex = updateData[field];
            if (typeof currentSex !== 'boolean') {
              if (typeof currentSex === 'string') {
                const lowerSex = currentSex.toLowerCase();
                if (lowerSex === 'true') {
                  currentSex = true;
                } else if (lowerSex === 'false') {
                  currentSex = false;
                } else {
                  return res.status(400).json({
                    code: 400,
                    message: '宠物性别必须为true或false'
                  });
                }
              } else {
                return res.status(400).json({
                  code: 400,
                  message: '宠物性别必须为布尔值（true/false）'
                });
              }
            }
            updates[field] = currentSex;
            break;
          }

          case 'birthday': {
            if (isNaN(new Date(updateData[field]).getTime())) {
              return res.status(400).json({
                code: 400,
                message: '无效的出生日期格式'
              });
            }
            updates[field] = updateData[field];
            break;
          }

          case 'nature':
          case 'hobby': {
            if (!Array.isArray(updateData[field])) {
              return res.status(400).json({
                code: 400,
                message: `宠物${field === 'nature' ? '性格' : '爱好'}必须为数组格式`
              });
            }
            updates[field] = updateData[field];
            break;
          }

          // 其他普通字段（基本验证）
          default: {
            // 对必填性质的字段做基本非空验证（如果提供了的话）
            if ((field === 'nickName' || field === 'breed' || field === 'type' || field === 'image') && !updateData[field]) {
              return res.status(400).json({
                code: 400,
                message: `${field === 'nickName' ? '昵称' : field === 'breed' ? '品种' : field === 'type' ? '类型' : '图片'}不能为空`
              });
            }
            updates[field] = updateData[field];
          }
        }
      }
    }

    // 检查是否有可更新的字段
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        code: 400,
        message: '没有可更新的字段'
      });
    }

    // 执行更新
    await pet.update(updates);

    // 返回更新后的宠物信息
    const updatedPet = await Pet.findByPk(petId);
    return res.status(200).json({
      code: 200,
      message: '宠物信息更新成功',
      data: updatedPet
    });

  } catch (err) {
    console.error('更新宠物信息失败:', err);
    return res.status(500).json({
      code: 500,
      message: '更新宠物信息失败，请稍后再试'
    });
  }
}

// 删除宠物（普通用户只能删除自己的，管理员能够管理所有人的）
exports.DeletePetService = async (req, res) => {
  try {
    // 获取当前用户信息和宠物ID
    const currentUserId = req.currentUser.id;
    const currentUserRole = req.role; // 假设角色信息存放在req.role
    const { id: petId } = req.params;

    // 验证宠物ID
    if (!petId) {
      return res.status(400).json({
        code: 400,
        message: '宠物ID不能为空'
      });
    }

    // 查找宠物
    const pet = await Pet.findByPk(petId);
    if (!pet) {
      return res.status(404).json({
        code: 404,
        message: '宠物信息不存在'
      });
    }

    // 权限验证
    // 普通用户只能删除自己的宠物，管理员可以删除所有宠物
    if (currentUserRole !== 'admin' && pet.userId !== currentUserId) {
      return res.status(403).json({
        code: 403,
        message: '没有权限删除该宠物信息'
      });
    }

    // 执行删除操作
    await pet.destroy();

    // 返回成功响应
    return res.status(200).json({
      code: 200,
      message: '宠物信息删除成功'
    });

  } catch (err) {
    console.error('删除宠物信息失败:', err);
    return res.status(500).json({
      code: 500,
      message: '删除宠物信息失败，请稍后再试'
    });
  }
}

// 批量删除宠物
exports.DeleteBatchPetServie = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的宠物ID列表'
      });
    }
    await Pet.destroy({
      where: {
        id: ids
      }
    });
    return res.status(200).json({
      code: 200,
      message: '批量删除宠物成功'
    });
  } catch (err) {
    console.error('批量删除宠物失败:', err);
    return res.status(500).json({
      code: 500,
      message: '批量删除宠物失败，请稍后再试'
    });
  }

}


// 获取单个宠物详情
exports.UserPetGetOneService = async (req, res) => {
  try {
    const { id: petId } = req.params

    if (!petId || isNaN(Number(petId))) {
      return res.status(400).json({
        code: 400,
        message: '无效的宠物ID'
      })
    }

    const pet = await Pet.findByPk(petId)

    if (!pet) {
      return res.status(404).json({
        code: 404,
        message: '宠物信息不存在'
      })
    }

    return res.status(200).json({
      code: 200,
      message: '获取宠物详情成功',
      data: pet
    })

  } catch (err) {
    console.error('获取宠物详情失败:', err)
    return res.status(500).json({
      code: 500,
      message: '获取宠物详情失败，请稍后再试'
    })
  }
}

// 获取所有宠物数量
exports.GetAllPetCountService = async (req, res) => {
  try {
    const count = await Pet.count();
    return res.status(200).json({
      code: 200,
      message: '获取所有宠物数量成功',
      data: count
    });
  } catch (err) {
    console.error('获取所有宠物数量失败:', err);
    return res.status(500).json({
      code: 500,
      message: '获取所有宠物数量失败，请稍后再试',
      data: 0,
    })
  }
}

// 上传文章图片
exports.PetUploadSerivice = async (req, res) => {
  try {
    const { id: userId } = req.currentUser; // 获取当前用户ID
    const file = req.file;

    // 验证文件是否上传
    if (!file) {
      return res.status(400).json({
        code: 400,
        message: '请上传文件'
      });
    }

    // 验证用户是否存在（可选，根据业务需求）
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '用户未登录'
      });
    }

    const fileUrl = `/pets/uploadPet/${file.filename}`;



    return res.status(200).json({
      code: 200,
      message: '上传宠物图片成功',
      data: {
        fileUrl,
      }
    });

  } catch (err) {
    console.error('上传宠物图片失败:', err);
    return res.status(500).json({
      code: 500,
      message: '上传宠物图片失败，请稍后再试'
    });
  }
};
