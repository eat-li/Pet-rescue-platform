# 基于Vue和Node.js的宠物综合服务平台

## 答辩PPT完整内容（13-14页，5分钟）

---

## 第1页：封面（10秒）

**标题**：基于Vue和Node.js的宠物综合服务平台

**副标题**：毕业设计答辩

**个人信息**：
- 学生：李鑫杰
- 学号：223020250
- 专业：计算机科学与技术
- 指导教师：张翀
- 成都锦城学院 计算机与软件学院

**配图建议**：项目首页截图或平台Logo

**演讲稿**：
> 各位老师好，我是计算机科学与技术专业的李鑫杰，我的毕业设计题目是《基于Vue和Node.js的宠物综合服务平台》。接下来我将从项目背景、技术架构、核心功能、个人工作量以及创新点等方面进行汇报。

---

## 第2页：研究背景与意义（20秒）

### 行业痛点
| 问题 | 现状 |
|-----|------|
| 资源分散 | 宠物服务信息分散在各平台，用户查找效率低 |
| 功能单一 | 现有平台或侧重健康管理，或侧重交易，缺乏整合 |
| 互动不足 | 宠物主之间缺乏交流分享的社区平台 |

### 项目价值
- **对用户**：一站式解决宠物服务需求（社区交流+服务预约+领养匹配）
- **对社会**：提高宠物领养率，减少流浪动物，促进人宠和谐

**配图建议**：市场痛点分析图、平台核心价值图

**演讲稿**：
> 随着宠物经济快速发展，现有平台存在资源分散、功能单一等问题。本项目旨在构建一个集宠物社区、服务预约、领养信息于一体的综合平台，既满足用户多元化需求，也助力提升宠物领养率。

---

## 第3页：技术架构与技术栈（30秒）

### 三层架构设计

```
┌─────────────────────────────────────────────────┐
│              前端UI层 (Vue3)                      │
│     用户端(25+页面) + 管理员端(12+页面)            │
│     Element-Plus / Vue Router / Pinia           │
├─────────────────────────────────────────────────┤
│              后端服务层 (Node.js)                 │
│     Express框架 / RESTful API / JWT认证          │
│     50+接口 / 中间件 / 分层架构(Service层)        │
├─────────────────────────────────────────────────┤
│              数据存储层 (MySQL)                   │
│     12张核心表 / Sequelize ORM / 关联查询         │
│     事务处理 / 连接池优化                         │
└─────────────────────────────────────────────────┘
```

### 技术选型理由
| 技术 | 选型原因 |
|-----|---------|
| Vue3 | 组合式API、组件化开发、响应式系统 |
| Node.js | 全栈JavaScript、高并发、丰富生态 |
| MySQL | 成熟稳定、事务支持、查询优化 |

**配图建议**：架构图、技术栈Logo拼图

**演讲稿**：
> 系统采用前后端分离的三层架构。前端使用Vue3框架独立开发用户端和管理员端两个应用；后端使用Node.js+Express构建RESTful API，通过JWT实现权限认证；数据库采用MySQL，使用Sequelize ORM进行数据操作。

---

## 第4页：个人工作量总览 ⭐核心页（25秒）

### 独立完成的全栈开发工作量

| 维度 | 具体成果 | 数量 |
|-----|---------|-----|
| **前端开发** | 用户端页面 | 25+ |
| | 管理员端页面 | 12+ |
| | 复用组件 | 15+ |
| **后端开发** | RESTful接口 | 50+ |
| | Service业务层 | 9个模块 |
| | 中间件 | 认证/错误处理 |
| **数据库** | 核心数据表 | 12张 |
| | 关联关系配置 | 8组 |
| **部署运维** | OSS图片存储 | 全链路适配 |

### 核心创新点
1. **批量预约功能**：购物车多选一键预约，Promise.all批量处理
2. **OSS图片方案**：本地/云端双模式适配，URL格式化工具
3. **性能优化**：懒加载、组件按需加载、Lighthouse优化

**配图建议**：工作量统计图表、项目文件结构截图

**演讲稿**：
> 本项目由我独立完成全栈开发，包括用户端和管理员端两个前端应用，50余个后端接口，12张数据库表。核心创新点包括批量预约功能、OSS图片存储方案以及多项性能优化。

---

## 第5页：用户模块与宠物管理（25秒）

### 功能概览
- **用户认证**：注册/登录/JWT Token持久化
- **密码安全**：bcrypt加密存储
- **宠物档案**：增删改查、图片上传、疫苗记录

### 关键代码：密码加密与安全认证

```javascript
// utils/Encryption.js - 密码加密
const bcrypt = require('bcryptjs')

const encryptPassword = (password) => {
  const salt = bcrypt.genSaltSync(10)  // 生成盐
  return bcrypt.hashSync(password, salt)
}

const verifyPassword = (password, hashedPassword) => {
  return bcrypt.compareSync(password, hashedPassword)
}
```

```javascript
// middleware/auth.js - JWT认证中间件
exports.PersonAuth = async (req, res, next) => {
  const token = authHeader.split(' ')[1]
  const decoded = jwt.verify(token, jwtconfig.SECRET_KEY)
  
  // 统一存储用户信息和角色
  req.currentUser = user
  req.userId = user.id
  req.role = decoded.type
  next()
}
```

**配图建议**：登录页面、宠物管理页面截图

**演讲稿**：
> 用户模块实现了完整的认证流程，密码使用bcrypt加密存储，JWT Token实现无状态认证。宠物管理支持完整的CRUD操作，包括图片上传和疫苗状态记录。

---

## 第6页：服务预约与购物车 ⭐核心页（35秒）

### 功能亮点
- **服务浏览**：分类筛选、价格区间、关键词搜索
- **购物车**：添加/删除/清空、选中状态、总价计算
- **批量预约**：购物车多选一键预约 ⭐创新点

### 关键代码：批量预约实现

```javascript
// UserBookingService.js - 批量创建预约
exports.BatchCreateBookingService = async (req, res) => {
  const { serviceIds, appointmentDate, appointmentTime, ... } = req.body
  
  // 验证所有服务是否存在且上架
  const services = await PetServiceOrder.findAll({
    where: {
      id: { [Op.in]: serviceIds },
      status: true
    }
  })
  
  // 批量创建预约 - 使用Promise.all并行处理
  const bookings = await Promise.all(
    services.map(service =>
      ServiceBooking.create({
        userId,
        serviceId: service.id,
        appointmentDate,
        appointmentTime,
        total_price: service.price,
        status: 'pending'
      })
    )
  )
  
  // 删除购物车中已预约的项
  await CartItem.destroy({
    where: {
      userId,
      serviceId: { [Op.in]: serviceIds }
    }
  })
  
  return res.status(201).json({
    message: `成功预约 ${bookings.length} 项服务`
  })
}
```

### 技术要点
| 难点 | 解决方案 |
|-----|---------|
| 数据一致性 | 先创建订单，成功后清除购物车 |
| 并发处理 | Promise.all并行创建多个预约 |
| 状态验证 | 预约前验证服务是否上架 |

**配图建议**：服务列表、购物车页面、预约弹窗截图

**演讲稿**：
> 服务模块实现了从浏览到预约的完整闭环。其中批量预约功能是项目的核心创新点：用户可在购物车中多选服务，一键完成批量预约。后端使用Promise.all并行处理，确保高效创建多个预约记录，并在成功后自动清除购物车对应项。

---

## 第7页：宠物社区（帖子模块）⭐核心页（25秒）

### 功能概览
- **帖子发布**：富文本编辑、多图上传、标签系统（最多5个）
- **内容筛选**：分类筛选（宠物日常/求助问题/经验分享）+ 关键词搜索
- **互动功能**：点赞/收藏/评论（支持嵌套回复）

### 关键技术：评论树形结构

```javascript
// 评论数据结构 - 支持嵌套回复
{
  id: 1,
  content: "评论内容",
  parentId: null,        // 一级评论
  user: { ... },
  replies: [             // 嵌套回复
    { id: 2, parentId: 1, content: "回复内容" }
  ]
}
```

### 社区互动数据流
```
用户发帖 → 图片上传OSS → 数据库存储 → 社区列表展示
    ↓
其他用户 → 点赞/收藏/评论 → 实时更新互动数 → 通知发帖者
```

**配图建议**：社区列表、帖子详情、评论互动截图

**演讲稿**：
> 宠物社区是平台的核心功能之一，支持用户发布图文帖子，进行点赞、收藏、评论等互动。评论功能支持嵌套回复，后端通过parentId关联组织树形结构，实现多层级对话展示。

---

## 第8页：宠物领养模块（20秒）

### 功能特点
- **领养信息**：关联宠物表，展示完整宠物档案
- **筛选功能**：费用类型（免费/有偿/面议）、宠物类型、品种搜索
- **状态管理**：待处理/已领养状态流转

### 数据关联设计
```
领养信息(Adoption)
    ├── 关联用户表(userId) → 发布者信息
    ├── 关联宠物表(petId) → 宠物详细信息
    └── 费用类型(fee) → free/paid/negotiable
```

**配图建议**：领养列表、领养详情页面截图

**演讲稿**：
> 领养模块为宠物领养提供信息发布与匹配渠道。用户可发布宠物领养信息，设置费用类型和领养要求；其他用户可通过多种条件筛选，快速找到合适的领养对象。

---

## 第9页：性能优化实践 ⭐重点页（30秒）

### 优化策略与成果

| 优化项 | 实现方式 | 测试指标 |
|-------|---------|---------|
| **首屏加载** | 路由懒加载| SpeedIndex < 1000ms |
| **图片优化** | vue-lazyload懒加载、OSS缩略图 | LCP < 1000ms |
| **组件优化** | defineAsyncComponent按需加载 | TTI 1000-3000ms ||

### 关键代码：懒加载实现

```javascript
// 路由懒加载
const Home = () => import('@/views/Home/index.vue')
const Community = () => import('@/views/Community/index.vue')

// 图片懒加载
<img v-lazy="imageUrl" :alt="title" />

// 组件按需加载
const ArticleDetail = defineAsyncComponent(() => 
  import('./views/ArticleDetail.vue')
)
```

### Lighthouse性能报告
```
Performance Score: 90+
├── First Contentful Paint: 0.8s
├── Largest Contentful Paint: 0.9s
├── Total Blocking Time: 50ms
└── Time to Interactive: 2.1s
```

**配图建议**：Lighthouse性能报告截图、优化前后对比图（在ppt中为我留下位置）

**演讲稿**：
> 性能优化是本项目的重要工作之一。通过路由懒加载、图片懒加载、组件按需加载等策略，Lighthouse性能评分达到90分以上，首屏加载时间控制在1秒内，为用户提供流畅的使用体验。

---

## 第10页：OSS图片存储方案 ⭐重点页（30秒）

### 问题背景
- 本地存储：路径问题、跨环境部署困难、容量限制
- 数据库字段：URL长度需扩展至500字符

### 解决方案：阿里云OSS全链路适配

```
前端上传 → 后端接收(Multer) → 转存OSS → 返回URL
                ↓
         本地/云端双模式适配
```

### 关键代码：OSS上传与URL格式化

```javascript
// utils/ossUpload.js - OSS上传
const OSS = require('ali-oss')

const ossClient = new OSS({
  region: process.env.OSS_REGION,
  bucket: process.env.OSS_BUCKET,
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  secure: true  // HTTPS
})

async function uploadToOSS(fileBuffer, originalname, folder) {
  const ext = path.extname(originalname) || '.jpg'
  const fileName = `${folder}/${uuid()}${ext}`
  const result = await ossClient.put(fileName, fileBuffer)
  return result.url  // 返回完整OSS URL
}
```

```javascript
// utils/imgformat.js - URL格式化工具
export const formatImageUrl = (imagePath, defaultImage = '/default-image.jpg') => {
  if (!imagePath) return defaultImage
  
  // 已完整URL直接返回
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }
  
  // 拼接baseURL
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  return `${baseURL}${normalizedPath}`
}
```

### 技术亮点
| 难点 | 解决方案 |
|-----|---------|
| 双模式适配 | 本地开发用baseURL，生产环境用OSS |
| URL一致性 | 统一formatImageUrl工具函数处理 |

**配图建议**：OSS控制台截图、图片上传流程图、数据库表结构

**演讲稿**：
> 图片存储是项目中的技术难点之一。我实现了本地开发和生产环境的双模式适配：开发时使用本地存储，生产环境使用阿里云OSS。通过统一的URL格式化工具函数，确保两种模式下的图片正常显示。同时扩展了数据库字段长度以支持OSS长URL。

---

## 第11页：数据统计与后台管理（20秒）

### 数据统计功能
- **数据可视化**：ECharts展示平台数据
- **统计维度**：用户总数、宠物数量、帖子数量、领养数量、服务数量
- **实时更新**：基于真实数据实时计算

### 后台管理模块
| 模块 | 功能 |
|-----|------|
| 用户管理 | 查看/编辑/禁用用户 |
| 帖子管理 | 审核/删除帖子 |
| 服务管理 | 上架/下架/编辑服务 |
| 预约管理 | 查看/处理预约订单 |
| 领养管理 | 审核领养信息 |
| 通知管理 | 发布系统公告 |

**配图建议**：数据统计仪表盘、后台管理页面截图

**演讲稿**：
> 管理员后台提供完整的数据统计和内容管理功能。数据统计模块使用ECharts可视化展示平台核心指标；内容管理涵盖用户、帖子、服务、预约、领养、通知六大模块，支持完整的CRUD操作。

---

## 第12页：系统测试与项目展示（20秒）

### 功能测试覆盖

| 模块 | 测试用例数 | 测试结果 |
|-----|----------|---------|
| 用户模块 | 5项 | 全部通过 |
| 服务模块 | 6项 | 全部通过 |
| 帖子模块 | 7项 | 全部通过 |
| 领养模块 | 3项 | 全部通过 |
| 通知模块 | 3项 | 全部通过 |
| 数据统计 | 1项 | 全部通过 |

### 非功能测试

| 测试类型 | 测试内容 | 结果 |
|---------|---------|-----|
| 性能测试 | Lighthouse指标 | 全部达标 |
| 安全测试 | XSS/SQL注入防范 | 通过 |
| 密码安全 | bcrypt加密存储 | 通过 |
| 权限控制 | JWT认证/越权访问 | 通过 |

**配图建议**：测试用例表、项目运行截图拼图

**演讲稿**：
> 系统测试阶段，我完成了6大功能模块共25项功能测试，以及性能、安全等非功能测试。所有测试用例均通过，系统运行稳定。

---

## 第13页：总结与展望（15秒）

### 项目成果
- **独立完成**全栈开发，涵盖前后端和数据库
- **核心创新**：批量预约、OSS图片方案、性能优化
- **系统稳定**：通过完整的功能测试和非功能测试

### 未来展望
- **个性化推荐**：基于用户行为的智能推荐
- **视频内容**：支持短视频发布和播放
- **健康档案**：宠物健康记录和疫苗提醒

**配图建议**：项目成果总结图、未来规划图

**演讲稿**：
> 本项目由我独立完成全栈开发，实现了宠物综合服务平台的完整功能。未来可进一步扩展个性化推荐、视频内容、健康档案等功能，使平台更加完善。

---

## 第14页：致谢（10秒）

### 致谢内容
- **衷心感谢**张翀老师的悉心指导
- **感谢**各位评审老师的聆听
- **感谢**学院提供的培养和支持

### 个人感悟
> 通过本次毕业设计，我系统掌握了全栈开发的完整流程，提升了独立解决问题的能力，为今后的职业发展奠定了坚实基础。

**配图建议**：感谢背景图

**演讲稿**：
> 最后，衷心感谢张翀老师在毕业设计过程中的悉心指导，感谢各位评审老师的聆听，恳请各位老师批评指正！

---

## 附录：答辩高频问题与回答要点

### Q1：为什么选择Vue3+Node.js技术栈？
**答**：Vue3组合式API提升了代码复用性和开发效率；Node.js实现全栈JavaScript统一，降低学习成本；前后端分离架构便于维护和扩展。

### Q2：批量预约功能如何保证数据一致性？
**答**：采用"先创建订单，成功后清除购物车"的策略。使用Promise.all并行创建多个预约记录，全部成功后再批量删除购物车项。若过程中出错，已创建的预约保留，购物车项不删除，避免数据丢失。

### Q3：OSS图片存储方案是如何设计的？
**答**：开发环境使用本地存储，生产环境使用阿里云OSS。通过环境变量控制，统一使用formatImageUrl函数处理URL，确保两种模式下图片正常显示。数据库字段扩展至500字符以支持OSS长URL。

### Q4：性能优化做了哪些工作？具体数据如何？
**答**：主要做了三方面优化：路由懒加载减少首屏资源；图片懒加载减少带宽占用；组件按需加载提升交互响应。Lighthouse测试显示SpeedIndex<1000ms，LCP<1000ms，性能评分90+。

### Q5：JWT认证的安全性如何保障？
**答**：Token设置过期时间（24小时），使用Bearer方式传输，配合权限中间件校验用户角色。密码使用bcrypt加密存储，防止明文泄露。敏感操作需重新验证身份。

### Q6：数据库表之间是如何关联的？
**答**：使用Sequelize ORM定义关联关系，如帖子-用户（belongsTo）、领养-宠物（belongsTo）等。通过include实现关联查询，减少多次查询的开销。

---

## PPT制作建议

### 配色方案
- 主色调：蓝色系（#1890ff）或绿色系（#52c41a）
- 背景：白色或浅灰色
- 强调色：橙色（#fa8c16）用于重点标注

### 字体建议
- 标题：微软雅黑 Bold，24-32pt
- 正文：微软雅黑 Regular，16-20pt
- 代码：Consolas，12-14pt

### 页面布局
- 每页内容不宜过多，保持简洁
- 代码片段使用深色背景，语法高亮
- 截图统一尺寸，关键区域用红框标注

### 动画使用
- 适度使用淡入淡出效果
- 复杂流程可使用步骤动画
- 避免过多花哨动画分散注意力

---

**文档生成时间**：2026年4月18日  
**适用场景**：本科毕业设计答辩（5分钟）  
**页数建议**：13-14页  
**演讲时长**：约5分钟
