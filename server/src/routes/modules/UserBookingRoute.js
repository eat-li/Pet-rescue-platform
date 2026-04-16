const express = require('express')
const router = express.Router()
const UserBookingService = require("../../services/UserBookingService")
const { PersonAuth } = require("../../middleware/auth")

// =============== 预约相关 ===============
// 创建预约
router.post('/booking', PersonAuth, UserBookingService.CreateBookingService)
// 批量创建预约（从购物车）
router.post('/bookings/batch', PersonAuth, UserBookingService.BatchCreateBookingService)
// 获取用户预约列表
router.get('/bookings', PersonAuth, UserBookingService.GetUserBookingsService)
// 获取用户预约详情
router.get('/booking/:id', PersonAuth, UserBookingService.GetUserBookingDetailService)
// 取消预约
router.patch('/booking/:id/cancel', PersonAuth, UserBookingService.CancelBookingService)

// =============== 购物车相关 ===============
// 添加到购物车
router.post('/cart', PersonAuth, UserBookingService.AddToCartService)
// 获取购物车列表
router.get('/cart', PersonAuth, UserBookingService.GetCartListService)
// 更新购物车项
router.patch('/cart/:id', PersonAuth, UserBookingService.UpdateCartItemService)
// 删除购物车项
router.delete('/cart/:id', PersonAuth, UserBookingService.DeleteCartItemService)
// 批量删除购物车项
router.delete('/cart/batch', PersonAuth, UserBookingService.BatchDeleteCartService)

module.exports = router
