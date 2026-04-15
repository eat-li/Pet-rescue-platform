const Adoption = require('../models/Rescue/Adoption')
const AdoptionApplication = require('../models/Rescue/AdoptionApplication')
const User = require('../models/User/User')
const Pet = require('../models/User/MyPet')

// 创建领养宠物信息
exports.AdoptionCreateService = async (req, res) => {

  try {
    const { petId, petInfo, fee, money, request, other_msg, userId: bodyUserId } = req.body
    const currentUserId = req.currentUser.id
    const userRole = req.role
    
    // 确定最终使用的userId：管理员可以指定userId，否则使用当前用户ID
    const finalUserId = (userRole === 'admin' && bodyUserId) ? bodyUserId : currentUserId
    
    let finalPetId = petId

    // 验证必填字段
    if (!fee) {
      return res.status(400).json({
        code: 400,
        message: '费用类型为必填项'
      })
    }

    // 验证费用类型
    const validFeeTypes = ['free', 'paid', 'negotiable']
    if (!validFeeTypes.includes(fee)) {
      return res.status(400).json({
        code: 400,
        message: '费用类型必须是 free(无偿)、paid(有偿) 或 negotiable(面议)'
      })
    }

    // 验证金额字段
    if (fee === 'paid' && (!money || money <= 0)) {
      return res.status(400).json({
        code: 400,
        message: '有偿领养必须提供有效的金额'
      })
    }

    if (fee === 'free' && money && money > 0) {

      return res.status(400).json({
        code: 400,
        message: '无偿领养不应设置金额'
      })
    }

    // 场景1：使用已有宠物ID
    if (petId) {
      const pet = await Pet.findByPk(petId)
      if (!pet) {

        return res.status(404).json({
          code: 404,
          message: '宠物不存在'
        })
      }

      // 权限验证：普通用户只能为自己的宠物创建领养信息
      if (userRole === 'user' && pet.userId !== currentUserId) {

        return res.status(403).json({
          code: 403,
          message: '您只能为自己的宠物创建领养信息'
        })
      }

      finalPetId = petId
    }
    // 场景2：创建新宠物信息
    else if (petInfo) {
      const {
        nickName,
        vaccineStatus = 'unvaccinated',
        sex,
        breed,
        type,
        birthday,
        image,
        nature = [],
        hobby = [],
        other_msg: petOtherMsg = ''
      } = petInfo

      // 验证宠物信息必填字段
      if (!nickName || sex === undefined || !breed || !type || !birthday || !image) {

        return res.status(400).json({
          code: 400,
          message: '宠物信息缺少必填字段：昵称、性别、品种、类型、生日、图片'
        })
      }

      // 验证疫苗状态
      const validVaccineStatus = ['unvaccinated', 'one_dose', 'two_doses', 'three_doses', 'completed']
      if (!validVaccineStatus.includes(vaccineStatus)) {

        return res.status(400).json({
          code: 400,
          message: `无效的疫苗状态，可选值: ${validVaccineStatus.join(', ')}`
        })
      }

      // 处理性别字段
      let currentSex = sex
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

      // 验证出生日期
      if (isNaN(new Date(birthday).getTime())) {

        return res.status(400).json({
          code: 400,
          message: '无效的出生日期格式'
        })
      }

      // 创建新宠物记录
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
        other_msg: petOtherMsg,
        userId: finalUserId // 关联到指定用户或当前用户
      })

      finalPetId = newPet.id
    }
    else {

      return res.status(400).json({
        code: 400,
        message: '请提供宠物ID或宠物信息'
      })
    }

    // 检查该宠物是否已有待处理的领养信息
    const existingAdoption = await Adoption.findOne({
      where: {
        petId: finalPetId,
        status: 'pending'
      },
    })

    if (existingAdoption) {

      return res.status(400).json({
        code: 400,
        message: '该宠物已有待处理的领养信息'
      })
    }

    // 创建领养信息
    const adoptionData = {
      userId: finalUserId,
      petId: finalPetId,
      fee: fee,
      money: money || null, // 添加金额字段
      status: 'pending',
      request: request || null,
      other_msg: other_msg || null
    }

    const newAdoption = await Adoption.create(adoptionData)


    // 返回创建的领养信息（包含关联数据）
    const adoptionWithDetails = await Adoption.findByPk(newAdoption.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname', 'avatar']
        },
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'nickName', 'breed', 'type', 'image', 'vaccineStatus']
        }
      ]
    })

    return res.status(201).json({
      code: 201,
      message: '领养信息创建成功',
      data: adoptionWithDetails
    })

  } catch (error) {

    console.error('创建领养信息失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
    })
  }
}

// 删除宠物信息，用户专用
exports.AdoptionDeleteService = async (req, res) => {

  try {
    const { id } = req.params // 从URL参数获取领养信息ID
    const userId = req.currentUser.id
    const userRole = req.role

    // 验证ID参数
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        code: 400,
        message: '无效的领养信息ID'
      })
    }

    // 查找领养信息
    const adoption = await Adoption.findByPk(id, {
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'userId', 'nickName']
        }
      ],
    })

    if (!adoption) {
      return res.status(404).json({
        code: 404,
        message: '领养信息不存在'
      })
    }

    // 权限验证
    let canDelete = false

    if (userRole === 'admin') {
      // 管理员可以删除任何领养信息
      canDelete = true
    } else if (userRole === 'user') {
      // 普通用户只能删除自己发布的领养信息
      if (adoption.userId === userId) {
        canDelete = true
      }
      // 或者删除自己宠物的领养信息
      else if (adoption.pet && adoption.pet.userId === userId) {
        canDelete = true
      }
    }

    if (!canDelete) {
      return res.status(403).json({
        code: 403,
        message: '您没有权限删除此领养信息'
      })
    }

    // 检查领养状态，普通用户删除时，已批准的领养信息不能删除
    // 管理员可以删除任何状态的领养信息
    if (adoption.status === 'approved' && userRole !== 'admin') {
      return res.status(400).json({
        code: 400,
        message: '已批准的领养信息不能删除'
      })
    }

    // 执行删除
    await adoption.destroy()

    return res.status(200).json({
      code: 200,
      message: '领养信息删除成功',
      data: {
        deletedId: id,
      }
    })

  } catch (error) {
    console.error('删除领养信息失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    })
  }
}

// 批量删除领养信息（管理员）
exports.AdoptionBatchDeleteService = async (req, res) => {
  try {
    const { ids } = req.body
    const userRole = req.role

    // 验证参数
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的领养信息ID列表'
      })
    }

    // 验证ID是否为数字
    if (!ids.every(id => Number.isInteger(Number(id)))) {
      return res.status(400).json({
        code: 400,
        message: 'ID列表必须为数字'
      })
    }

    // 查找要删除的领养信息
    const adoptions = await Adoption.findAll({
      where: {
        id: {
          [require('sequelize').Op.in]: ids
        }
      },
      include: [
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'userId']
        }
      ]
    })

    if (adoptions.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '没有找到要删除的领养信息'
      })
    }

    // 权限检查
    if (userRole !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可批量删除'
      })
    }

    // 执行批量删除
    await Adoption.destroy({
      where: {
        id: {
          [require('sequelize').Op.in]: ids
        }
      }
    })

    return res.status(200).json({
      code: 200,
      message: `成功删除 ${adoptions.length} 条领养信息`,
      data: {
        deletedCount: adoptions.length,
        deletedIds: ids
      }
    })

  } catch (error) {
    console.error('批量删除领养信息失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    })
  }
}

// 管理员更新领养状态
exports.AdoptionUpdateStatusService = async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'approved', 'rejected']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        code: 400,
        message: '无效的状态值，必须为 pending/approved/rejected'
      })
    }

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ code: 400, message: '无效的领养信息ID' })
    }

    const adoption = await Adoption.findByPk(id)
    if (!adoption) {
      return res.status(404).json({ code: 404, message: '领养信息不存在' })
    }

    await adoption.update({ status })

    return res.status(200).json({
      code: 200,
      message: '状态更新成功',
      data: { id: adoption.id, status: adoption.status }
    })
  } catch (error) {
    console.error('更新领养状态失败:', error)
    return res.status(500).json({ code: 500, message: '服务器内部错误' })
  }
}

// 获取单个领养详情（无需鉴权）
exports.AdoptionGetOneService = async (req, res) => {
  try {
    const { id } = req.params

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        code: 400,
        message: '无效的领养信息ID'
      })
    }

    const adoption = await Adoption.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname', 'avatar']
        },
        {
          model: Pet,
          as: 'pet',
          attributes: ['id', 'nickName', 'breed', 'type', 'image', 'vaccineStatus', 'sex', 'birthday', 'nature', 'hobby', 'other_msg']
        }
      ]
    })

    if (!adoption) {
      return res.status(404).json({
        code: 404,
        message: '领养信息不存在'
      })
    }

    return res.status(200).json({
      code: 200,
      message: '获取领养详情成功',
      data: adoption
    })

  } catch (error) {
    console.error('获取领养详情失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    })
  }
}

// 上传领养宠物图片
exports.AdoptionUploadService = async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({
        code: 400,
        message: '请上传文件'
      })
    }

    const fileUrl = `/adoptions/uploadAdoption/${file.filename}`

    return res.status(200).json({
      code: 200,
      message: '上传图片成功',
      data: { fileUrl }
    })

  } catch (error) {
    console.error('上传领养图片失败:', error)
    return res.status(500).json({
      code: 500,
      message: '上传失败，请稍后再试'
    })
  }
}

// ── 以下为领养申请相关服务 ──────────────────────────────────────

// 提交领养申请（用户）
exports.SubmitApplicationService = async (req, res) => {
  try {
    const applicantId = req.userId
    const { adoptionId, name, phone, experience, reason } = req.body

    if (!adoptionId || !name || !phone) {
      return res.status(400).json({ code: 400, message: '领养帖子ID、姓名和联系方式为必填项' })
    }

    const adoption = await Adoption.findByPk(adoptionId)
    if (!adoption) {
      return res.status(404).json({ code: 404, message: '领养帖子不存在' })
    }
    if (adoption.status !== 'pending') {
      return res.status(400).json({ code: 400, message: '该领养帖子已不可申请' })
    }
    if (adoption.userId === applicantId) {
      return res.status(400).json({ code: 400, message: '不能申请领养自己发布的宠物' })
    }

    const existing = await AdoptionApplication.findOne({ where: { adoptionId, applicantId } })
    if (existing) {
      return res.status(400).json({ code: 400, message: '您已提交过此领养申请' })
    }

    const app = await AdoptionApplication.create({
      adoptionId,
      applicantId,
      name,
      phone,
      experience: experience || null,
      reason: reason || null
    })

    return res.status(201).json({ code: 201, message: '申请提交成功', data: app })
  } catch (error) {
    console.error('提交领养申请失败:', error)
    return res.status(500).json({ code: 500, message: '服务器内部错误' })
  }
}

// 获取我提交的领养申请列表（用户）
exports.GetMyApplicationsService = async (req, res) => {
  try {
    const applicantId = req.userId
    const applications = await AdoptionApplication.findAll({
      where: { applicantId },
      include: [
        {
          model: Adoption,
          as: 'adoption',
          include: [
            { model: Pet, as: 'pet', attributes: ['id', 'nickName', 'breed', 'type', 'image'] },
            { model: User, as: 'user', attributes: ['id', 'username', 'nickname', 'avatar'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    })
    return res.status(200).json({ code: 200, message: '获取成功', data: applications })
  } catch (error) {
    console.error('获取我的申请失败:', error)
    return res.status(500).json({ code: 500, message: '服务器内部错误' })
  }
}

// 获取我发布的领养帖子列表（用户个人中心）
exports.GetMyAdoptionsService = async (req, res) => {
  try {
    const userId = req.userId
    const adoptions = await Adoption.findAll({
      where: { userId },
      include: [
        { model: Pet, as: 'pet', attributes: ['id', 'nickName', 'breed', 'type', 'image'] }
      ],
      order: [['createdAt', 'DESC']]
    })
    return res.status(200).json({ code: 200, message: '获取成功', data: adoptions })
  } catch (error) {
    console.error('获取我的领养发布失败:', error)
    return res.status(500).json({ code: 500, message: '服务器内部错误' })
  }
}

// 获取某个领养帖子的申请列表（发布者/管理员）
exports.GetAdoptionApplicationsService = async (req, res) => {
  try {
    const userId = req.userId
    const userRole = req.role
    const { id } = req.params

    const adoption = await Adoption.findByPk(id)
    if (!adoption) {
      return res.status(404).json({ code: 404, message: '领养帖子不存在' })
    }
    if (userRole !== 'admin' && adoption.userId !== userId) {
      return res.status(403).json({ code: 403, message: '无权查看此申请列表' })
    }

    const applications = await AdoptionApplication.findAll({
      where: { adoptionId: id },
      include: [
        { model: User, as: 'applicant', attributes: ['id', 'username', 'nickname', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']]
    })
    return res.status(200).json({ code: 200, message: '获取成功', data: applications })
  } catch (error) {
    console.error('获取申请列表失败:', error)
    return res.status(500).json({ code: 500, message: '服务器内部错误' })
  }
}

// 更新申请状态（发布者或管理员）
exports.UpdateApplicationStatusService = async (req, res) => {
  try {
    const userId = req.userId
    const userRole = req.role
    const { appId } = req.params
    const { status } = req.body

    const validStatuses = ['pending', 'approved', 'rejected']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ code: 400, message: '无效的状态值' })
    }

    const application = await AdoptionApplication.findByPk(appId, {
      include: [{ model: Adoption, as: 'adoption' }]
    })
    if (!application) {
      return res.status(404).json({ code: 404, message: '申请不存在' })
    }
    if (userRole !== 'admin' && application.adoption.userId !== userId) {
      return res.status(403).json({ code: 403, message: '无权修改此申请状态' })
    }

    await application.update({ status })

    // 若批准：同步更新领养帖状态，并拒绝其他待处理申请
    if (status === 'approved') {
      await application.adoption.update({ status: 'approved' })
      const { Op } = require('sequelize')
      await AdoptionApplication.update(
        { status: 'rejected' },
        { where: { adoptionId: application.adoptionId, id: { [Op.ne]: parseInt(appId) }, status: 'pending' } }
      )
    }

    return res.status(200).json({ code: 200, message: '状态更新成功', data: { id: application.id, status } })
  } catch (error) {
    console.error('更新申请状态失败:', error)
    return res.status(500).json({ code: 500, message: '服务器内部错误' })
  }
}

// 管理员获取所有申请（分页）
exports.AdminGetAllApplicationsService = async (req, res) => {
  try {
    const userRole = req.role
    if (userRole !== 'admin') {
      return res.status(403).json({ code: 403, message: '无权访问，仅管理员可用' })
    }

    const { page = 1, limit = 10, status } = req.query
    const currentPage = parseInt(page)
    const pageSize = parseInt(limit)
    const where = {}
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      where.status = status
    }

    const { count, rows } = await AdoptionApplication.findAndCountAll({
      where,
      include: [
        { model: User, as: 'applicant', attributes: ['id', 'username', 'nickname', 'avatar'] },
        {
          model: Adoption,
          as: 'adoption',
          include: [
            { model: Pet, as: 'pet', attributes: ['id', 'nickName', 'breed', 'type', 'image'] },
            { model: User, as: 'user', attributes: ['id', 'username', 'nickname'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
      distinct: true
    })

    return res.status(200).json({
      code: 200,
      message: '获取成功',
      data: {
        applications: rows,
        pagination: {
          currentPage,
          pageSize,
          totalItems: count,
          totalPages: Math.ceil(count / pageSize)
        }
      }
    })
  } catch (error) {
    console.error('获取所有申请失败:', error)
    return res.status(500).json({ code: 500, message: '服务器内部错误' })
  }
}

// 获取领养宠物列表（无权限）
exports.AdoptionGetService = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      fee, 
      type, 
      breed,
      search 
    } = req.query

    // 验证分页参数
    const currentPage = parseInt(page, 10)
    const pageSize = parseInt(limit, 10)
    
    if (currentPage < 1 || pageSize < 1 || pageSize > 100) {
      return res.status(400).json({
        code: 400,
        message: '分页参数无效'
      })
    }

    // 构建查询条件
    const whereCondition = {}
    const petWhereCondition = {}

    // 按状态筛选
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      whereCondition.status = status
    }

    // 按费用类型筛选
    if (fee && ['free', 'paid', 'negotiable'].includes(fee)) {
      whereCondition.fee = fee
    }

    // 按宠物类型筛选
    if (type) {
      petWhereCondition.type = type
    }

    // 按品种筛选
    if (breed) {
      petWhereCondition.breed = breed
    }

    // 搜索功能（宠物昵称或品种）
    if (search) {
      const { Op } = require('sequelize')
      petWhereCondition[Op.or] = [
        { nickName: { [Op.like]: `%${search}%` } },
        { breed: { [Op.like]: `%${search}%` } }
      ]
    }

    // 计算偏移量
    const offset = (currentPage - 1) * pageSize

    // 查询领养信息
    const { count: totalItems, rows: adoptions } = await Adoption.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname', 'avatar']
        },
        {
          model: Pet,
          as: 'pet',
          where: Object.keys(petWhereCondition).length > 0 ? petWhereCondition : undefined,
          attributes: ['id', 'nickName', 'breed', 'type', 'image', 'vaccineStatus', 'sex', 'birthday']
        }
      ],
      order: [['createdAt', 'DESC']], // 按创建时间倒序
      limit: pageSize,
      offset: offset,
      distinct: true // 确保count正确
    })

    // 构建分页信息
    const totalPages = Math.ceil(totalItems / pageSize)
    const pagination = {
      currentPage,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    }

    return res.status(200).json({
      code: 200,
      message: '获取领养列表成功',
      data: {
        adoptions,
        pagination
      }
    })

  } catch (error) {
    console.error('获取领养列表失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器内部错误'
    })
  }
}
