const PetServiceOrder = require('../models/Product/PetServiceOrder')
const { Op } = require('sequelize')

// 获取服务列表
exports.PetServiceOrderListService = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''
    const type = req.query.type || ''
    const status = req.query.status

    const whereCondition = {}
    
    if (search) {
      whereCondition.name = { [Op.like]: `%${search}%` }
    }
    
    if (type) {
      whereCondition.type = type
    }
    
    if (status !== undefined && status !== '') {
      whereCondition.status = status === 'true' || status === '1'
    }

    const offset = (page - 1) * limit

    const { count, rows: services } = await PetServiceOrder.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return res.status(200).json({
      code: 200,
      message: '获取服务列表成功',
      data: {
        services,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取服务列表失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，获取服务列表失败'
    })
  }
}

// 获取服务详情
exports.PetServiceOrderDetailService = async (req, res) => {
  try {
    const { id } = req.params
    
    const service = await PetServiceOrder.findByPk(id)
    
    if (!service) {
      return res.status(404).json({
        code: 404,
        message: '服务不存在'
      })
    }

    return res.status(200).json({
      code: 200,
      message: '获取服务详情成功',
      data: service
    })
  } catch (error) {
    console.error('获取服务详情失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，获取服务详情失败'
    })
  }
}

// 创建服务
exports.PetServiceOrderCreateService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以创建服务
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可创建服务'
      })
    }

    const { name, type, price, weight, content, image } = req.body

    // 数据验证
    if (!name || !type || price === undefined || weight === undefined || !content) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段：服务名称、类型、价格、体重限制和内容为必填项'
      })
    }

    // 创建服务
    const newService = await PetServiceOrder.create({
      name,
      type,
      price,
      weight,
      content,
      image: image || '',
      status: false // 默认下架
    })

    return res.status(201).json({
      code: 201,
      message: '服务创建成功',
      data: newService
    })
  } catch (error) {
    console.error('创建服务失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，创建服务失败'
    })
  }
}

// 更新服务
exports.PetServiceOrderUpdateService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以更新服务
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可更新服务'
      })
    }

    const { id } = req.params
    const { name, type, price, weight, content, status, image } = req.body

    const service = await PetServiceOrder.findByPk(id)
    
    if (!service) {
      return res.status(404).json({
        code: 404,
        message: '服务不存在'
      })
    }

    // 更新字段
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (type !== undefined) updateData.type = type
    if (price !== undefined) updateData.price = price
    if (weight !== undefined) updateData.weight = weight
    if (content !== undefined) updateData.content = content
    if (status !== undefined) updateData.status = status
    if (image !== undefined) updateData.image = image

    await service.update(updateData)

    return res.status(200).json({
      code: 200,
      message: '服务更新成功',
      data: service
    })
  } catch (error) {
    console.error('更新服务失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，更新服务失败'
    })
  }
}

// 删除服务
exports.PetServiceOrderDeleteService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以删除服务
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可删除服务'
      })
    }

    const { id } = req.params

    const service = await PetServiceOrder.findByPk(id)
    
    if (!service) {
      return res.status(404).json({
        code: 404,
        message: '服务不存在'
      })
    }

    await service.destroy()

    return res.status(200).json({
      code: 200,
      message: '服务删除成功'
    })
  } catch (error) {
    console.error('删除服务失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，删除服务失败'
    })
  }
}

// 批量删除服务
exports.PetServiceOrderBatchDeleteService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以批量删除服务
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可批量删除服务'
      })
    }

    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的服务ID数组'
      })
    }

    await PetServiceOrder.destroy({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    })

    return res.status(200).json({
      code: 200,
      message: '批量删除成功',
      data: { deletedCount: ids.length }
    })
  } catch (error) {
    console.error('批量删除服务失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，批量删除服务失败'
    })
  }
}

// 更新服务状态（上下架）
exports.PetServiceOrderStatusService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以更新服务状态
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可更新服务状态'
      })
    }

    const { id } = req.params
    const { status } = req.body

    if (status === undefined) {
      return res.status(400).json({
        code: 400,
        message: '请提供状态值'
      })
    }

    const service = await PetServiceOrder.findByPk(id)
    
    if (!service) {
      return res.status(404).json({
        code: 404,
        message: '服务不存在'
      })
    }

    await service.update({ status: status === true || status === 'true' })

    return res.status(200).json({
      code: 200,
      message: status ? '服务已上架' : '服务已下架',
      data: service
    })
  } catch (error) {
    console.error('更新服务状态失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，更新服务状态失败'
    })
  }
}

// 上传服务图片
exports.PetServiceOrderUploadService = async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({
        code: 400,
        message: '请上传文件'
      })
    }

    const fileUrl = `/services/uploadService/${file.filename}`

    return res.status(200).json({
      code: 200,
      message: '上传图片成功',
      data: { fileUrl }
    })

  } catch (error) {
    console.error('上传服务图片失败:', error)
    return res.status(500).json({
      code: 500,
      message: '上传失败，请稍后再试'
    })
  }
}
