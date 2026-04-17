const express = require('express')
const router = express.Router()
const UserService = require("../../services/UserService")
const { PersonAuth } = require("../../middleware/auth")
const upload = require("../../utils/upload.js")

// 用户注册
router.post('/register', UserService.UserRegister)
// 用户登录
router.post('/login', UserService.UserLoginService)
// 用户信息修改
router.patch("/:id", PersonAuth, UserService.UserUpdateService)
// 批量删除用户
router.delete("/batch", PersonAuth, UserService.BatchDeleteUserService)
// 删除用户
router.delete("/:id", PersonAuth, UserService.UserDeleteService)
// 修改用户状态
router.patch("/status/:id", PersonAuth, UserService.UserUpdateStatusService)
// 查询用户列表
router.get("/list", PersonAuth, UserService.UserListService)
// 获取用户数量
router.get("/count", UserService.GetAllUserCountService)
// 获取用户详情
router.get("/:id", UserService.UserDetailService)
// 用户头像上传
router.post(
  "/avatar/:id",
  upload.single('avatar'),
  UserService.UserUploadAvatarService
)

module.exports = router
