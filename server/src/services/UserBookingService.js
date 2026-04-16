const ServiceBooking = require('../models/Product/ServiceBooking')
const PetServiceOrder = require('../models/Product/PetServiceOrder')
const User = require('../models/User/User')
const CartItem = require('../models/Product/CartItem')
const { Op } = require('sequelize')

// 用户创建预约
exports.CreateBookingService = async (req, res) => {
  try {
    const userId = req.userId
    const { serviceId, appointmentDate, appointmentTime, petName, petWeight, contact, notes, totalPrice } = req.body

    // 验证必填字段
    if (!serviceId || !appointmentDate || !appointmentTime || !petName || !petWeight || !contact) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段'
      })
    }

    // 验证服务是否存在
    const service = await PetServiceOrder.findByPk(serviceId)
    if (!service) {
      return res.status(404).json({
        code: 404,
        message: '服务不存在'
      })
    }

    // 创建预约
    const booking = await ServiceBooking.create({
      userId,
      serviceId,
      appointmentDate,
      appointmentTime,
      petName,
      petWeight,
      contact,
      total_price: totalPrice || service.price,
      notes,
      status: 'pending'
    })

    return res.status(201).json({
      code: 201,
      message: '预约成功',
      data: booking
    })
  } catch (error) {
    console.error('创建预约失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，创建预约失败'
    })
  }
}

// 批量创建预约（从购物车）
exports.BatchCreateBookingService = async (req, res) => {
  try {
    const userId = req.userId
    const { serviceIds, appointmentDate, appointmentTime, petName, petWeight, contact, notes } = req.body

    // 验证必填字段
    if (!serviceIds || !Array.isArray(serviceIds) || serviceIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要预约的服务'
      })
    }
    if (!appointmentDate || !appointmentTime || !petName || !petWeight || !contact) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段：预约日期、时间、宠物名称、体重、联系方式'
      })
    }

    // 验证所有服务是否存在且上架
    const services = await PetServiceOrder.findAll({
      where: {
        id: { [Op.in]: serviceIds },
        status: true
      }
    })

    if (services.length !== serviceIds.length) {
      return res.status(400).json({
        code: 400,
        message: '部分服务不存在或已下架，请刷新后重试'
      })
    }

    // 批量创建预约
    const bookings = await Promise.all(
      services.map(service =>
        ServiceBooking.create({
          userId,
          serviceId: service.id,
          appointmentDate,
          appointmentTime,
          petName,
          petWeight,
          contact,
          total_price: service.price,
          notes,
          status: 'pending'
        })
      )
    )

    // 删除购物车中已预约的项
    await CartItem.destroy({
      where: {
        userId,
        serviceId: { [Op.in]: serviceIds }
      }
    })

    return res.status(201).json({
      code: 201,
      message: `成功预约 ${bookings.length} 项服务`,
      data: {
        bookings,
        count: bookings.length
      }
    })
  } catch (error) {
    console.error('批量创建预约失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，批量预约失败'
    })
  }
}

// 获取用户预约列表
exports.GetUserBookingsService = async (req, res) => {
  try {
    const userId = req.userId
    const { status } = req.query

    const whereCondition = { userId }
    if (status) {
      whereCondition.status = status
    }

    const bookings = await ServiceBooking.findAll({
      where: whereCondition,
      include: [
        {
          model: PetServiceOrder,
          as: 'service',
          attributes: ['id', 'name', 'type', 'price', 'image']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    return res.status(200).json({
      code: 200,
      message: '获取预约列表成功',
      data: bookings
    })
  } catch (error) {
    console.error('获取预约列表失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，获取预约列表失败'
    })
  }
}

// 获取用户预约详情
exports.GetUserBookingDetailService = async (req, res) => {
  try {
    const userId = req.userId
    const { id } = req.params

    const booking = await ServiceBooking.findOne({
      where: { id, userId },
      include: [
        {
          model: PetServiceOrder,
          as: 'service',
          attributes: ['id', 'name', 'type', 'price', 'image', 'content']
        }
      ]
    })

    if (!booking) {
      return res.status(404).json({
        code: 404,
        message: '预约不存在'
      })
    }

    return res.status(200).json({
      code: 200,
      message: '获取预约详情成功',
      data: booking
    })
  } catch (error) {
    console.error('获取预约详情失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，获取预约详情失败'
    })
  }
}

// 用户取消预约
exports.CancelBookingService = async (req, res) => {
  try {
    const userId = req.userId
    const { id } = req.params
    const { cancelReason } = req.body

    const booking = await ServiceBooking.findOne({
      where: { id, userId }
    })

    if (!booking) {
      return res.status(404).json({
        code: 404,
        message: '预约不存在'
      })
    }

    // 只有待确认状态可以取消
    if (booking.status !== 'pending') {
      return res.status(400).json({
        code: 400,
        message: '当前状态无法取消'
      })
    }

    await booking.update({
      status: 'cancelled',
      cancelReason: cancelReason || '用户取消'
    })

    return res.status(200).json({
      code: 200,
      message: '预约已取消',
      data: booking
    })
  } catch (error) {
    console.error('取消预约失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，取消预约失败'
    })
  }
}

// =============== 购物车相关 ===============

// 添加服务到购物车
exports.AddToCartService = async (req, res) => {
  try {
    const userId = req.userId
    const { serviceId, petWeight, notes } = req.body

    if (!serviceId) {
      return res.status(400).json({
        code: 400,
        message: '请选择服务'
      })
    }

    // 验证服务是否存在
    const service = await PetServiceOrder.findByPk(serviceId)
    if (!service) {
      return res.status(404).json({
        code: 404,
        message: '服务不存在'
      })
    }

    // 检查是否已在购物车中
    const existingItem = await CartItem.findOne({
      where: { userId, serviceId }
    })

    if (existingItem) {
      return res.status(400).json({
        code: 400,
        message: '该服务已在购物车中'
      })
    }

    const cartItem = await CartItem.create({
      userId,
      serviceId,
      petWeight,
      notes,
      selected: true
    })

    return res.status(201).json({
      code: 201,
      message: '已添加到购物车',
      data: cartItem
    })
  } catch (error) {
    console.error('添加购物车失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，添加购物车失败'
    })
  }
}

// 获取购物车列表
exports.GetCartListService = async (req, res) => {
  try {
    const userId = req.userId

    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [
        {
          model: PetServiceOrder,
          as: 'service',
          attributes: ['id', 'name', 'type', 'price', 'image', 'weight', 'status', 'content']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    return res.status(200).json({
      code: 200,
      message: '获取购物车成功',
      data: cartItems
    })
  } catch (error) {
    console.error('获取购物车失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，获取购物车失败'
    })
  }
}

// 更新购物车项
exports.UpdateCartItemService = async (req, res) => {
  try {
    const userId = req.userId
    const { id } = req.params
    const { petWeight, notes, selected } = req.body

    const cartItem = await CartItem.findOne({
      where: { id, userId }
    })

    if (!cartItem) {
      return res.status(404).json({
        code: 404,
        message: '购物车项不存在'
      })
    }

    const updateData = {}
    if (petWeight !== undefined) updateData.petWeight = petWeight
    if (notes !== undefined) updateData.notes = notes
    if (selected !== undefined) updateData.selected = selected

    await cartItem.update(updateData)

    return res.status(200).json({
      code: 200,
      message: '更新成功',
      data: cartItem
    })
  } catch (error) {
    console.error('更新购物车失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，更新购物车失败'
    })
  }
}

// 删除购物车项
exports.DeleteCartItemService = async (req, res) => {
  try {
    const userId = req.userId
    const { id } = req.params

    const cartItem = await CartItem.findOne({
      where: { id, userId }
    })

    if (!cartItem) {
      return res.status(404).json({
        code: 404,
        message: '购物车项不存在'
      })
    }

    await cartItem.destroy()

    return res.status(200).json({
      code: 200,
      message: '删除成功'
    })
  } catch (error) {
    console.error('删除购物车失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，删除购物车失败'
    })
  }
}

// 批量删除购物车项
exports.BatchDeleteCartService = async (req, res) => {
  try {
    const userId = req.userId
    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的购物车项ID'
      })
    }

    await CartItem.destroy({
      where: {
        id: { [Op.in]: ids },
        userId
      }
    })

    return res.status(200).json({
      code: 200,
      message: '批量删除成功'
    })
  } catch (error) {
    console.error('批量删除购物车失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，批量删除购物车失败'
    })
  }
}
