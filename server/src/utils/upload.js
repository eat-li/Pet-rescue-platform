const multer = require("multer")
const path = require("path")
const { v4: uuid } = require('uuid')
const fs = require('fs')


const storage = multer.diskStorage({
  // 设置文件存储路径
  destination: (req, file, cb) => {
    // cb(null,path.join(__dirname,'../static/avatar/uploadavatar'))
    const parentDir = path.join(__dirname, '..');
    const uploadDir = path.resolve(parentDir, 'static', req.uploadDir || 'default')
    // 创建目录
    if (!fs.existsSync(uploadDir)) {
      // 创建目录
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  // 设置文件名
  filename: (req, file, cb) => {
    // 获取文件后缀和文件存储名字
    const ext = file.originalname.split('.')[1]
    const baseName = `${uuid()}`
    console.log(baseName)
    cb(null, `${baseName}.${ext}`)
  }
})

// 创建multer实例
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5,// 限制文件大小，单位为字节
  },
  fileFilter: (req, file, cb) => {
    // 限制文件类型
    const allowTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (allowTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('文件类型不正确'), false)
    }
  }
})

module.exports = upload