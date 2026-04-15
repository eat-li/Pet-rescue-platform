const express = require("express")
const cors = require("cors")
const config = require("./config/config.js")
const path = require('path')
const mainRouter = require("./routes/index.js")

// express
const app = express()
app.use(express.static(path.resolve(__dirname, "static")))
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // 解析表单数据
app.use(cors())

// 总路由
app.use("/api", mainRouter)

app.listen(config.PORT, "0.0.0.0", () => {
  console.log(`服务器启动成功为： ${config.PORT}`)
  console.log(`本地访问: http://localhost:${config.PORT}`)
  console.log(`网络访问: http://127.0.0.1:${config.PORT}`)
})