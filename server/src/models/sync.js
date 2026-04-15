// user
require('./User/User')
// article
require('./Article/Article')
require('./Article/ArticleStar')
require('./Article/ArticleCollection')
require('./Article/ArticleComment')
// admin
require("./Admin/Admin")
// Product
require('./Product/CartItem.js')
require('./Product/ServiceBooking.js')
require('./Product/PetServiceOrder.js')
// Rescue
require('./Rescue/AdoptionApplication.js')
const sequelize = require("../database/index.js")

const run = async () => {
  try {
    console.log('开始同步数据库...')
    await sequelize.sync({ alter: true })
    console.log('✅ 所有表同步完成')
  } catch (err) {
    console.error('❌ 数据库同步失败：', err.message)
    console.error(err)
  } finally {
    process.exit()
  }
}

run()
