/**
 * 全局错误处理中间件
 * 作用：捕获所有未处理的错误，统一返回格式
 * 类似 Java Spring Boot 的 @ControllerAdvice
 */

// 自定义业务错误类
class BusinessException extends Error {
  constructor(code, message) {
    super(message)
    this.code = code
    this.name = 'BusinessError'
  }
}

// 统一响应格式工具
const success = (res, data, message = '操作成功', code = 200) => {
  return res.status(code).json({ code, message, data })
}

const error = (res, message = '操作失败', code = 500) => {
  return res.status(code).json({ code, message })
}

const paginate = (res, data, pagination, message = '获取成功') => {
  return res.status(200).json({ code: 200, message, data, pagination })
}

// 全局错误处理中间件（必须放在所有路由之后）
const globalErrorHandler = (err, req, res, next) => {
  console.error(`[错误] ${req.method} ${req.url}:`, err.message)

  // JWT 相关错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ code: 401, message: 'Token无效' })
  }
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ code: 401, message: 'Token已过期' })
  }

  // 数据库验证错误
  if (err.name === 'SequelizeValidationError') {
    const messages = err.errors.map(e => e.message).join('; ')
    return res.status(400).json({ code: 400, message: `数据验证失败: ${messages}` })
  }

  // 数据库唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ code: 409, message: '数据已存在，请检查唯一字段' })
  }

  // 数据库字段过长错误
  if (err.name === 'SequelizeDatabaseError' && err.original?.code === 'ER_DATA_TOO_LONG') {
    return res.status(400).json({ code: 400, message: '提交数据超出字段长度限制' })
  }

  // 业务错误
  if (err.name === 'BusinessError') {
    return res.status(err.code >= 400 && err.code < 600 ? err.code : 400).json({
      code: err.code,
      message: err.message
    })
  }

  // 默认服务器错误
  const message = process.env.NODE_ENV === 'production'
    ? '服务器内部错误'
    : err.message

  return res.status(500).json({ code: 500, message })
}

// 异步路由包装器（避免每个路由写try-catch）
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

module.exports = {
  globalErrorHandler,
  asyncHandler,
  BusinessException,
  success,
  error,
  paginate
}
