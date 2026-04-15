const express = require('express')
const router = express.Router()
const { PersonAuth } = require('../../middleware/auth')
const ServiceBookingService = require('../../services/ServiceBookingService')

// 获取预约列表
router.get('/', PersonAuth, ServiceBookingService.ServiceBookingListService)

// 获取预约统计
router.get('/stats', PersonAuth, ServiceBookingService.ServiceBookingStatsService)

// 获取预约详情
router.get('/:id', PersonAuth, ServiceBookingService.ServiceBookingDetailService)

// 更新预约状态
router.patch('/status/:id', PersonAuth, ServiceBookingService.ServiceBookingUpdateStatusService)

// 批量删除预约（必须放在 /:id 之前）
router.delete('/batch', PersonAuth, ServiceBookingService.ServiceBookingBatchDeleteService)

// 删除预约
router.delete('/:id', PersonAuth, ServiceBookingService.ServiceBookingDeleteService)

module.exports = router
