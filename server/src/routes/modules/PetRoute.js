const express = require('express')
const router = express.Router()
const { PersonAuth } = require('../../middleware/auth')
const MyPetService = require('../../services/UserPetService')
const { setPetDir } = require('../../middleware/sendDir')
const upload = require('../../utils/upload')


// 添加宠物功能
router.post('/', PersonAuth, MyPetService.UserPetAddService)

// 获取个人宠物列表功能
router.get('/', PersonAuth, MyPetService.UserPetGetAllService)

// 获取全部宠物列表(管理员)
router.get('/list', PersonAuth, MyPetService.AdminGetAllPetService)

// 修改宠物资料
router.patch('/:id', PersonAuth, MyPetService.UserPetUpdateService)


// 批量删除宠物
router.delete('/batch', PersonAuth, MyPetService.DeleteBatchPetServie)

// 删除宠物
router.delete('/:id', PersonAuth, MyPetService.DeletePetService)

// 获取宠物数量
router.get("/count", MyPetService.GetAllPetCountService)

// 获取单个宠物详情（无需鉴权，任何人可查看）
router.get('/:id', MyPetService.UserPetGetOneService)




// 添加宠物图片
router.post(
  '/upload',
  PersonAuth,
  setPetDir('pets/uploadPet'),
  upload.single('pet'),
  MyPetService.PetUploadSerivice)


module.exports = router