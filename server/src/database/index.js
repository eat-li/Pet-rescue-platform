const { Sequelize } = require("sequelize")
const config = require("../config/config.js")

const sequelize = new Sequelize(
  config.database.DATABASE,
  config.database.USER,
  config.database.PASSWORD,
  {
    host: config.database.HOST,
    dialect: "mysql",
    port: config.database.PORT,
    logging: false,
    
    // ========================================
    // 数据库连接池配置
    // ========================================
    pool: {
      max: 10,        // 最大连接数：最多同时保持10个连接
      min: 2,         // 最小连接数：最少保持2个空闲连接
      acquire: 30000, // 获取连接超时：30秒内获取不到连接则报错
      idle: 10000     // 空闲超时：连接空闲10秒后自动释放
    }
  }
)

function testConnect() {
  sequelize.authenticate()
    .then(() => {
      console.log("database connect successfully")
      console.log("数据库连接池已启用: max=10, min=2")
    })
    .catch((err) => {
      console.error("database connect error", err)
    })
}
testConnect()

module.exports = sequelize
