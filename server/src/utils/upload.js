const multer = require("multer")

// 使用内存存储，文件存储在 buffer 中，便于后续上传到 OSS
const storage = multer.memoryStorage()

// 创建multer实例
const upload = multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 限制文件大小5MB
  },
  fileFilter: (req, file, cb) => {
    // 限制文件类型
    const allowTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (allowTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('文件类型不正确，仅支持 png、jpg、jpeg'), false)
    }
  }
})

module.exports = upload