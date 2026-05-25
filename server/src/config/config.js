const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

// 验证必需的环境变量
const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME', 'JWT_SECRET']
const missingVars = requiredEnvVars.filter(varName => !process.env[varName])

if (missingVars.length > 0) {
  console.error(`错误：缺少必需的环境变量: ${missingVars.join(', ')}`)
  console.error('请检查 .env 文件是否正确配置')
  process.exit(1)
}

// 导出所有环境变量
module.exports = {
  // 服务器配置
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // 数据库配置
  database: {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DATABASE: process.env.DB_NAME,
    PORT: process.env.DB_PORT || 3306
  },

  jwtconfig: {
    SECRET_KEY: process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRE || '1h'
  },

  // CORS 配置
  CORS_ORIGINS: process.env.CORS_ORIGINS,

  // 头像
  avatar: process.env.DEFAULT_AVATAR_PATH
};
