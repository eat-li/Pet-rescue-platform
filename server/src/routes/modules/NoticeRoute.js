const express = require('express')
const router = express.Router()
const {PersonAuth} =require("../../middleware/auth")
const NoticeService = require('../../services/NoticeService')
const upload = require("../../utils/upload")

// 上传公告图片
router.post(
  '/upload',
  PersonAuth,
  upload.single('notice'),
  NoticeService.NoticeUploadService
)

// 创建公告
router.post(
  '/',
  PersonAuth,
  NoticeService.NoticeCreateService)

// 获取公告列表
router.get('/', NoticeService.NoticeListService)

// 批量删除公告
router.delete('/batch', PersonAuth, NoticeService.NoticeBatchDeleteService)

// 删除公告
router.delete(
  '/:id',
  PersonAuth,
  NoticeService.NoticeDeleteService)


// 获取公告详情
router.get(
  '/:id',
  NoticeService.NoticeDetailService)

// 修改公告状态
router.patch(
  '/status/:id',
  PersonAuth,
  NoticeService.NoticeStatusUpdateService
)

// 修改公告
router.patch(
  '/:id',
  PersonAuth,
  NoticeService.NoticeUpdateService
  )


module.exports = router