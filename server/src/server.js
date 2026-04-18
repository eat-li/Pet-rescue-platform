const express = require("express")
const cors = require("cors")
const config = require("./config/config.js")
const path = require('path')
const mainRouter = require("./routes/index.js")
const { globalErrorHandler } = require("./middleware/errorHandler")

// express
const app = express()
app.use(express.static(path.resolve(__dirname, "static")))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' })) // 解析表单数据
app.use(cors())

// 总路由
app.use("/api", mainRouter)

// 全局错误处理中间件（必须放在路由之后）
app.use(globalErrorHandler)

app.listen(config.PORT, "0.0.0.0", () => {
  console.log(`服务器启动成功为： ${config.PORT}`)
  console.log(`本地访问: http://localhost:${config.PORT}`)
  console.log(`网络访问: http://127.0.0.1:${config.PORT}`)
})