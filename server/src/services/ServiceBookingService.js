const ServiceBooking = require('../models/Product/ServiceBooking')
const PetServiceOrder = require('../models/Product/PetServiceOrder')
const User = require('../models/User/User')
const { Op } = require('sequelize')
const sequelize = require('../database/index')

// 获取预约列表（管理员）
exports.ServiceBookingListService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以查看所有预约
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足'
      })
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const status = req.query.status || ''
    const search = req.query.search || ''

    const whereCondition = {}
    
    if (status) {
      whereCondition.status = status
    }

    const offset = (page - 1) * limit

    const { count, rows: bookings } = await ServiceBooking.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname', 'avatar'],
          where: search ? {
            [Op.or]: [
              { username: { [Op.like]: `%${search}%` } },
              { nickname: { [Op.like]: `%${search}%` } }
            ]
          } : undefined,
          required: false
        },
        {
          model: PetServiceOrder,
          as: 'service',
          attributes: ['id', 'name', 'type', 'price']
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    })

    return res.status(200).json({
      code: 200,
      message: '获取预约列表成功',
      data: {
        bookings,
        pagination: {
          currentPage: page,
          pageSize: limit,
          totalItems: count,
          totalPages: Math.ceil(count / limit)
        }
      }
    })
  } catch (error) {
    console.error('获取预约列表失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，获取预约列表失败'
    })
  }
}

// 获取预约详情
exports.ServiceBookingDetailService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以查看预约详情
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足'
      })
    }

    const { id } = req.params

    const booking = await ServiceBooking.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'nickname', 'avatar', 'phone']
        },
        {
          model: PetServiceOrder,
          as: 'service',
          attributes: ['id', 'name', 'type', 'price', 'content']
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

// 更新预约状态
exports.ServiceBookingUpdateStatusService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以更新预约状态
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足'
      })
    }

    const { id } = req.params
    const { status, cancelReason } = req.body

    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled']
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        code: 400,
        message: '无效的状态值'
      })
    }

    const booking = await ServiceBooking.findByPk(id)

    if (!booking) {
      return res.status(404).json({
        code: 404,
        message: '预约不存在'
      })
    }

    const updateData = { status }
    if (status === 'cancelled' && cancelReason) {
      updateData.cancelReason = cancelReason
    }

    await booking.update(updateData)

    return res.status(200).json({
      code: 200,
      message: '预约状态更新成功',
      data: booking
    })
  } catch (error) {
    console.error('更新预约状态失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，更新预约状态失败'
    })
  }
}

// 删除预约
exports.ServiceBookingDeleteService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以删除预约
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足'
      })
    }

    const { id } = req.params

    const booking = await ServiceBooking.findByPk(id)

    if (!booking) {
      return res.status(404).json({
        code: 404,
        message: '预约不存在'
      })
    }

    await booking.destroy()

    return res.status(200).json({
      code: 200,
      message: '预约删除成功'
    })
  } catch (error) {
    console.error('删除预约失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，删除预约失败'
    })
  }
}

// 批量删除预约
exports.ServiceBookingBatchDeleteService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以批量删除预约
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足'
      })
    }

    const { ids } = req.body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的预约ID数组'
      })
    }

    await ServiceBooking.destroy({
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
    console.error('批量删除预约失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，批量删除预约失败'
    })
  }
}

// 获取预约统计
exports.ServiceBookingStatsService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以查看统计
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足'
      })
    }

    const stats = await ServiceBooking.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('status')), 'count']
      ],
      group: ['status']
    })

    const total = await ServiceBooking.count()

    return res.status(200).json({
      code: 200,
      message: '获取预约统计成功',
      data: {
        stats,
        total
      }
    })
  } catch (error) {
    console.error('获取预约统计失败:', error)
    return res.status(500).json({
      code: 500,
      message: '服务器错误，获取预约统计失败'
    })
  }
}
