const express = require('express')
const router = express.Router()
const AdoptionService = require('../../services/AdoptionService')
const { PersonAuth } = require('../../middleware/auth')
const upload = require('../../utils/upload')

// ─── 创建领养宠物信息 ─────────────────────────────────────────
router.post('/', PersonAuth, AdoptionService.AdoptionCreateService)

// ─── 上传领养宠物图片（必须在 /:id 路由之前！）─────────────────
router.post(
  '/upload',
  PersonAuth,
  upload.single('adoption'),
  AdoptionService.AdoptionUploadService
)

// ─── 领养申请相关（全部必须在 /:id 之前注册）─────────────────────
// 提交领养申请（用户）
router.post('/applications', PersonAuth, AdoptionService.SubmitApplicationService)

// 获取我提交的领养申请列表（用户）
router.get('/applications/my', PersonAuth, AdoptionService.GetMyApplicationsService)

// 管理员获取所有领养申请（admin only）
router.get('/applications', PersonAuth, AdoptionService.AdminGetAllApplicationsService)

// 更新申请状态（发布者/管理员）
router.patch('/applications/:appId/status', PersonAuth, AdoptionService.UpdateApplicationStatusService)

// 获取我发布的领养帖子（用户个人中心，必须在 /:id 之前）
router.get('/my', PersonAuth, AdoptionService.GetMyAdoptionsService)

// ─── 领养列表 / 详情 ─────────────────────────────────────────
// 获取领养列表（无鉴权）
router.get('/', AdoptionService.AdoptionGetService)

// 获取单个领养详情（无鉴权）
router.get('/:id', AdoptionService.AdoptionGetOneService)

// 获取某个领养帖子的申请列表（发布者/管理员）
router.get('/:id/applications', PersonAuth, AdoptionService.GetAdoptionApplicationsService)

// ─── 状态 / 删除 ─────────────────────────────────────────────
// 管理员更新领养状态
router.patch('/:id/status', PersonAuth, AdoptionService.AdoptionUpdateStatusService)

// 批量删除领养宠物
router.delete('/batch', PersonAuth, AdoptionService.AdoptionBatchDeleteService)

// 删除领养宠物
router.delete('/:id', PersonAuth, AdoptionService.AdoptionDeleteService)

module.exports = router
