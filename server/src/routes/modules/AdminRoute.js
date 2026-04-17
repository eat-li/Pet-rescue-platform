const express = require('express')
const router = express.Router()
const AdminService = require('../../services/AdminService')
const { PersonAuth } = require('../../middleware/auth')
const upload = require('../../utils/upload')

// 管理员登录
router.post('/login', AdminService.AdminLoginService)

// 更新管理员信息（支持修改密码）
router.patch('/:id', PersonAuth, AdminService.AdminUpdateService)

// 管理员头像上传
router.post('/avatar/:id', PersonAuth, upload.single('avatar'), AdminService.AdminAvatarUploadService)

module.exports = router