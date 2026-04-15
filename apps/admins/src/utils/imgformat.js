// 导入baseURL
import { baseURL } from '../http/http'

/**
 * 简化的图片URL格式化函数
 * @param {string} imagePath - 后端传来的图片路径
 * @param {string} defaultImage - 默认图片路径（可选）
 * @returns {string} 格式化后的完整图片URL
 */
export const formatImageUrl = (imagePath, defaultImage = '/default-image.jpg') => {
  // 如果图片路径为空或undefined，返回默认图片
  if (!imagePath) {
    return defaultImage
  }

  // 如果已经以baseURL开头，直接返回
  if (imagePath.startsWith(baseURL)) {
    return imagePath
  }

  // 如果是完整的URL（包含http或https），直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  // 确保路径以/开头
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  // 拼接baseURL和图片路径
  return `${baseURL}${normalizedPath}`
}

/**
 * 获取安全的图片URL
 * @param {string|Array} imagePath - 图片路径或图片数组
 * @param {number} index - 如果是数组，指定获取的索引（默认0）
 * @param {string} defaultImage - 默认图片路径
 * @returns {string} 安全的图片URL
 */
export const getSafeImageUrl = (imagePath, index = 0, defaultImage = '/default-image.jpg') => {
  try {
    // 如果是数组
    if (Array.isArray(imagePath)) {
      if (imagePath.length === 0 || !imagePath[index]) {
        return defaultImage
      }
      return formatImageUrl(imagePath[index], defaultImage)
    }
    
    // 如果是字符串
    return formatImageUrl(imagePath, defaultImage)
  } catch (error) {
    console.warn('图片URL格式化失败:', error)
    return defaultImage
  }
}

// 默认导出主要函数
export default formatImageUrl