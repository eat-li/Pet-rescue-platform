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
    logging: false
  }
)

function testConnect() {
  sequelize.authenticate()
    .then(() => {
      console.log("database connect successfully")
    })
    .catch((err) => {
      console.error("database connect error", err)
    })
}
testConnect()

module.exports = sequelize
