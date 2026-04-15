const express = require('express')
const router = express.Router()
const { PersonAuth } = require('../../middleware/auth')
const PetServiceOrderService = require('../../services/PetServiceOrderService')
const upload = require("../../utils/upload")
const { setServiceDir } = require("../../middleware/sendDir")

// 上传服务图片
router.post(
  '/upload',
  PersonAuth,
  setServiceDir('services/uploadService'),
  upload.single('service'),
  PetServiceOrderService.PetServiceOrderUploadService
)

// 获取服务列表
router.get('/', PetServiceOrderService.PetServiceOrderListService)

// 获取服务详情
router.get('/:id', PetServiceOrderService.PetServiceOrderDetailService)

// 创建服务
router.post('/', PersonAuth, PetServiceOrderService.PetServiceOrderCreateService)

// 更新服务
router.patch('/:id', PersonAuth, PetServiceOrderService.PetServiceOrderUpdateService)

// 批量删除服务（必须放在 /:id 之前）
router.delete('/batch', PersonAuth, PetServiceOrderService.PetServiceOrderBatchDeleteService)

// 删除服务
router.delete('/:id', PersonAuth, PetServiceOrderService.PetServiceOrderDeleteService)

// 更新服务状态（上下架）
router.patch('/status/:id', PersonAuth, PetServiceOrderService.PetServiceOrderStatusService)

module.exports = router
