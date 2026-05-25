const express = require("express")
const cors = require("cors")
const config = require("./config/config.js")
const path = require('path')
const mainRouter = require("./routes/index.js")
const { globalErrorHandler } = require("./middleware/errorHandler")

// CORS 白名单配置
const allowedOrigins = config.CORS_ORIGINS ? config.CORS_ORIGINS.split(',') : [
  'http://localhost:5173',  // Vite 默认开发端口
  'http://localhost:8080',   // 用户前端开发端口
  'http://localhost:3000'    // 本地测试
]

const corsOptions = {
  origin: function (origin, callback) {
    // 允许没有 origin 的请求（如移动应用、Postman）
    if (!origin) return callback(null, true)
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('CORS 不允许此来源访问'))
    }
  },
  credentials: true,  // 允许携带 cookie
  optionsSuccessStatus: 200
}

// express
const app = express()
app.use(express.static(path.resolve(__dirname, "static")))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' })) // 解析表单数据
app.use(cors(corsOptions))

// 总路由
app.use("/api", mainRouter)

// 全局错误处理中间件（必须放在路由之后）
app.use(globalErrorHandler)

app.listen(config.PORT, "0.0.0.0", () => {
  console.log(`服务器启动成功为： ${config.PORT}`)
  console.log(`本地访问: http://localhost:${config.PORT}`)
  console.log(`网络访问: http://127.0.0.1:${config.PORT}`)
})