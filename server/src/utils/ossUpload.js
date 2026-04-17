const OSS = require('ali-oss')
const { v4: uuid } = require('uuid')
const path = require('path')

// 确保加载环境变量（指定正确的.env文件路径）
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

// 从环境变量读取OSS配置
const ossClient = new OSS({
  region: process.env.OSS_REGION,
  bucket: process.env.OSS_BUCKET,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  secure: true // 使用HTTPS
})

const OSS_BASE_URL = process.env.OSS_BASE_URL

/**
 * 上传文件到OSS
 * @param {Buffer} fileBuffer - 文件Buffer
 * @param {string} originalname - 原始文件名
 * @param {string} folder - 存储文件夹 (如 'avatar', 'articles', 'adoptions')
 * @returns {Promise<string>} - 返回OSS完整URL
 */
async function uploadToOSS(fileBuffer, originalname, folder = 'uploads') {
  try {
    // 生成唯一文件名
    const ext = path.extname(originalname) || '.jpg'
    const fileName = `${folder}/${uuid()}${ext}`
    
    // 上传到OSS
    const result = await ossClient.put(fileName, fileBuffer)
    
    // 返回完整URL
    return result.url || `${OSS_BASE_URL}/${fileName}`
  } catch (error) {
    console.error('OSS上传失败:', error)
    throw new Error('文件上传失败')
  }
}

/**
 * 批量上传文件到OSS
 * @param {Array} files - 文件数组 (multer格式)
 * @param {string} folder - 存储文件夹
 * @returns {Promise<Array<string>>} - 返回URL数组
 */
async function uploadMultipleToOSS(files, folder = 'uploads') {
  const uploadPromises = files.map(file => 
    uploadToOSS(file.buffer, file.originalname, folder)
  )
  return Promise.all(uploadPromises)
}

/**
 * 删除OSS上的文件
 * @param {string} url - 文件URL
 */
async function deleteFromOSS(url) {
  try {
    // 从URL提取文件路径
    const fileName = url.replace(OSS_BASE_URL + '/', '')
    await ossClient.delete(fileName)
  } catch (error) {
    console.error('OSS删除失败:', error)
    // 删除失败不抛出错误，只记录日志
  }
}

module.exports = {
  uploadToOSS,
  uploadMultipleToOSS,
  deleteFromOSS,
  ossClient,
  OSS_BASE_URL
}
