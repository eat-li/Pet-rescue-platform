const path = require('path')
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env')
});

// 导出所有环境变量
module.exports = {
  // 服务器配置
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // 数据库配置
  database: {
    HOST: process.env.DB_HOST || 'localhost',
    USER: process.env.DB_USER || 'root',
    PASSWORD: process.env.DB_PASSWORD || '000000',
    DATABASE: process.env.DB_NAME || 'pet_service',
    PORT: process.env.DB_PORT || 3306
  },

  jwtconfig: {
    SECRET_KEY: process.env.JWT_SECRET || 'secretKey',
    EXPIRES_IN: process.env.JWT_EXPIRE || '1h'
  },

  // 头像
  avatar: process.env.DEFAULT_AVATAR_PATH
};
