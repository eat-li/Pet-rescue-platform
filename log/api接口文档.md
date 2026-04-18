# 宠物综合服务平台 API 接口文档

> Base URL: `http://localhost:3000/api`  
> 认证方式: Bearer Token (JWT)  
> Content-Type: application/json

---

## 1. 管理员模块 `/api/admins`

### 1.1 管理员登录
- **POST** `/admins/login`
- **鉴权**: 无
- **描述**: 管理员使用账号密码登录，返回JWT令牌
- **请求参数**:
```json
{
  "account": "admin001",
  "password": "Admin@123"
}
```
- **返回示例**:
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "admin": { "id": 1, "account": "admin001", "username": "超级管理员", "avatar": "https://oss.../xxx.png", "email": "admin@pet.com", "phone": "13800000000", "sex": true, "role": "admin" },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 1.2 更新管理员信息
- **PATCH** `/admins/:id`
- **鉴权**: 需要Token
- **描述**: 修改管理员基本信息，修改密码需提供旧密码
- **路径参数**: `id` - 管理员ID
- **请求参数**:
```json
{
  "username": "管理员小王",
  "phone": "13900001111",
  "email": "wang@pet.com",
  "sex": false,
  "avatar": "https://oss.../new_avatar.png",
  "oldPassword": "Admin@123",
  "password": "NewPass@456"
}
```
- **返回示例**:
```json
{ "code": 200, "message": "信息更新成功", "data": { "id": 1, "account": "admin001", "username": "管理员小王" } }
```

### 1.3 管理员头像上传
- **POST** `/admins/avatar/:id`
- **鉴权**: 需要Token
- **描述**: 上传管理员头像图片，存储至阿里云OSS
- **请求格式**: `multipart/form-data`
- **表单字段**: `avatar` (文件类型)
- **返回示例**:
```json
{ "code": 200, "message": "头像上传成功", "data": { "avatar": "https://oss.../avatar/admin/xxx.png" } }
```

---

## 2. 用户模块 `/api/users`

### 2.1 用户注册
- **POST** `/users/register`
- **鉴权**: 无
- **描述**: 新用户注册，邮箱/用户名/手机号不可重复
- **请求参数**:
```json
{
  "username": "petLover",
  "email": "pet@example.com",
  "phone": "13812345678",
  "password": "User@123456"
}
```
- **返回示例**:
```json
{ "code": 201, "message": "注册成功", "data": { "id": 22, "username": "petLover", "email": "pet@example.com", "phone": "13812345678", "nickname": "用户+abc123def", "avatar": null, "status": true } }
```

### 2.2 用户登录
- **POST** `/users/login`
- **鉴权**: 无
- **描述**: 用户使用邮箱或手机号登录，系统自动识别账号类型
- **请求参数**:
```json
{
  "account": "pet@example.com",
  "password": "User@123456"
}
```
- **返回示例**:
```json
{ "code": 200, "message": "登录成功", "data": { "user": { "id": 22, "username": "petLover", "nickname": "用户+abc123def" }, "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." } }
```

### 2.3 修改用户信息
- **PATCH** `/users/:id`
- **鉴权**: 需要Token（用户只能改自己，管理员可改任何人）
- **描述**: 修改用户信息，修改密码需提供旧密码，邮箱/手机号会校验唯一性
- **路径参数**: `id` - 用户ID
- **请求参数**:
```json
{
  "nickname": "爱宠达人",
  "phone": "13987654321",
  "email": "newpet@example.com",
  "sex": true,
  "avatar": "https://oss.../avatar.png",
  "oldPassword": "User@123456",
  "password": "NewPass@789"
}
```
- **返回示例**:
```json
{ "code": 200, "message": "更新成功", "data": { "id": 22, "username": "petLover", "nickname": "爱宠达人" } }
```

### 2.4 修改用户状态（管理员）
- **PATCH** `/users/status/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 启用或禁用用户账号
- **路径参数**: `id` - 用户ID
- **请求参数**:
```json
{ "status": "false" }
```
- **返回示例**:
```json
{ "code": 200, "message": "用户状态更新成功", "data": { "userId": "22", "newStatus": false, "statusText": "禁用" } }
```

### 2.5 获取用户列表（管理员）
- **GET** `/users/list`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 分页获取用户列表，支持搜索
- **查询参数**: `page=1`, `limit=10`, `search=pet`
- **返回示例**:
```json
{ "code": 200, "message": "获取用户列表成功", "data": { "users": [...], "pagination": { "currentPage": 1, "pageSize": 10, "totalItems": 50, "totalPages": 5, "hasNextPage": true, "hasPreviousPage": false } } }
```

### 2.6 获取用户数量
- **GET** `/users/count`
- **鉴权**: 无
- **描述**: 获取平台注册用户总数
- **返回示例**:
```json
{ "code": 200, "message": "获取所有用户数量成功", "data": 128 }
```

### 2.7 获取用户详情
- **GET** `/users/:id`
- **鉴权**: 无
- **描述**: 根据ID获取用户详细信息（不含密码）
- **路径参数**: `id` - 用户ID
- **返回示例**:
```json
{ "code": 200, "message": "获取用户详情成功", "data": { "id": 22, "username": "petLover", "nickname": "爱宠达人", "email": "newpet@example.com", "phone": "13987654321", "avatar": "https://oss.../avatar.png", "status": true } }
```

### 2.8 删除用户（管理员）
- **DELETE** `/users/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 根据ID删除用户
- **路径参数**: `id` - 用户ID
- **返回示例**:
```json
{ "code": 200, "message": "用户删除成功" }
```

### 2.9 批量删除用户（管理员）
- **DELETE** `/users/batch`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 批量删除用户
- **请求参数**:
```json
{ "ids": [23, 24, 25] }
```
- **返回示例**:
```json
{ "code": 200, "message": "成功删除 3 个用户", "deletedCount": 3 }
```

### 2.10 用户头像上传
- **POST** `/users/avatar/:id`
- **鉴权**: 需要Token
- **描述**: 上传用户头像，存储至阿里云OSS并更新用户记录
- **请求格式**: `multipart/form-data`
- **表单字段**: `avatar` (文件类型)
- **路径参数**: `id` - 用户ID
- **返回示例**:
```json
{ "code": 200, "message": "更新用户头像成功", "data": { "avatar": "https://oss.../avatar/user/22/xxx.png" } }
```

---

## 3. 宠物模块 `/api/pets`

### 3.1 添加宠物
- **POST** `/pets`
- **鉴权**: 需要Token
- **描述**: 用户添加自己的宠物信息，管理员可指定userId为其他用户添加
- **请求参数**:
```json
{
  "nickName": "旺财",
  "vaccineStatus": "completed",
  "sex": true,
  "breed": "金毛",
  "type": "dog",
  "birthday": "2022-06-15",
  "image": "https://oss.../pets/xxx.jpg",
  "nature": ["活泼", "友好"],
  "hobby": ["散步", "玩球"],
  "other_msg": "对鸡肉过敏"
}
```
> vaccineStatus可选值: `unvaccinated`, `one_dose`, `two_doses`, `three_doses`, `completed`
- **返回示例**:
```json
{ "code": 201, "message": "宠物信息添加成功", "data": { "id": 15, "nickName": "旺财", "type": "dog", "breed": "金毛" } }
```

### 3.2 获取个人宠物列表
- **GET** `/pets`
- **鉴权**: 需要Token
- **描述**: 获取当前用户的宠物列表，可通过userId参数查看其他用户宠物
- **查询参数**: `userId=22`, `page=1`, `limit=10`
- **返回示例**:
```json
{ "code": 200, "message": "获取宠物信息成功", "data": { "pets": [...], "pagination": {...}, "targetUserId": 22 } }
```

### 3.3 获取全部宠物列表（管理员）
- **GET** `/pets/list`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 管理员获取全部宠物信息，支持多种筛选
- **查询参数**: `page=1`, `limit=10`, `userId=22`, `type=dog`, `breed=金毛`, `vaccineStatus=completed`, `search=旺财`
- **返回示例**:
```json
{ "code": 200, "message": "获取全部宠物信息成功", "data": { "pets": [...], "pagination": {...} } }
```

### 3.4 修改宠物信息
- **PATCH** `/pets/:id`
- **鉴权**: 需要Token（用户只能改自己的宠物，管理员可改所有）
- **描述**: 部分更新宠物信息
- **路径参数**: `id` - 宠物ID
- **请求参数**:
```json
{ "nickName": "小旺", "vaccineStatus": "three_doses", "nature": ["活泼", "粘人"] }
```
- **返回示例**:
```json
{ "code": 200, "message": "宠物信息更新成功", "data": { "id": 15, "nickName": "小旺" } }
```

### 3.5 删除宠物
- **DELETE** `/pets/:id`
- **鉴权**: 需要Token
- **描述**: 删除宠物信息（用户只能删自己的，管理员可删所有）
- **路径参数**: `id` - 宠物ID
- **返回示例**:
```json
{ "code": 200, "message": "宠物信息删除成功" }
```

### 3.6 批量删除宠物
- **DELETE** `/pets/batch`
- **鉴权**: 需要Token
- **描述**: 批量删除宠物
- **请求参数**:
```json
{ "ids": [15, 16, 17] }
```
- **返回示例**:
```json
{ "code": 200, "message": "批量删除宠物成功" }
```

### 3.7 获取宠物数量
- **GET** `/pets/count`
- **鉴权**: 无
- **描述**: 获取平台宠物总数
- **返回示例**:
```json
{ "code": 200, "message": "获取所有宠物数量成功", "data": 45 }
```

### 3.8 获取单个宠物详情
- **GET** `/pets/:id`
- **鉴权**: 无
- **描述**: 根据ID获取宠物详细信息
- **路径参数**: `id` - 宠物ID
- **返回示例**:
```json
{ "code": 200, "message": "获取宠物详情成功", "data": { "id": 15, "nickName": "旺财", "breed": "金毛", "type": "dog", "sex": true, "vaccineStatus": "completed" } }
```

### 3.9 上传宠物图片
- **POST** `/pets/upload`
- **鉴权**: 需要Token
- **描述**: 上传宠物图片至阿里云OSS
- **请求格式**: `multipart/form-data`
- **表单字段**: `pet` (文件类型)
- **返回示例**:
```json
{ "code": 200, "message": "上传宠物图片成功", "data": { "fileUrl": "https://oss.../pets/xxx.jpg" } }
```

---

## 4. 帖子模块 `/api/articles`

### 4.1 发布帖子
- **POST** `/articles`
- **鉴权**: 需要Token
- **描述**: 发布帖子，管理员可指定userId为他人发帖
- **请求参数**:
```json
{
  "title": "我家金毛的日常",
  "type": "pet_daily",
  "content": "今天带狗狗去公园玩了好久...",
  "images": ["https://oss.../articles/aaa.jpg", "https://oss.../articles/bbb.jpg"],
  "tag": ["金毛", "日常", "公园"]
}
```
> type可选值: `pet_daily`(宠物日常), `help_question`(求助问题), `experience_share`(经验分享)
> tag最多5个
- **返回示例**:
```json
{ "code": 201, "message": "文章创建成功", "data": { "id": 30, "title": "我家金毛的日常", "type": "pet_daily", "star": 0, "comment": 0, "collection": 0, "status": 1 } }
```

### 4.2 获取帖子列表
- **GET** `/articles`
- **鉴权**: 无
- **描述**: 分页获取帖子列表，支持分类筛选和关键词搜索
- **查询参数**: `page=1`, `limit=10`, `type=pet_daily`, `tag=金毛`, `status=true`, `search=公园`
- **返回示例**:
```json
{ "code": 200, "message": "文章列表获取成功", "data": { "articles": [...], "pagination": {...} } }
```

### 4.3 获取帖子详情
- **GET** `/articles/:id`
- **鉴权**: 无
- **描述**: 获取帖子详细信息，包含作者信息
- **路径参数**: `id` - 帖子ID
- **返回示例**:
```json
{ "code": 200, "message": "文章详情获取成功", "data": { "id": 30, "title": "我家金毛的日常", "content": "...", "user": { "id": 22, "username": "petLover", "nickname": "爱宠达人" } } }
```

### 4.4 修改帖子
- **PATCH** `/articles/:id`
- **鉴权**: 需要Token（作者或管理员）
- **描述**: 修改帖子内容，管理员可修改审核状态
- **路径参数**: `id` - 帖子ID
- **请求参数**:
```json
{ "title": "修改后的标题", "type": "experience_share", "content": "修改后的内容", "images": [], "tag": ["经验"], "status": 1 }
```
- **返回示例**:
```json
{ "code": 200, "message": "文章更新成功", "data": { "id": 30, "title": "修改后的标题" } }
```

### 4.5 删除帖子
- **DELETE** `/articles/:id`
- **鉴权**: 需要Token（作者或管理员）
- **描述**: 删除帖子
- **路径参数**: `id` - 帖子ID
- **返回示例**:
```json
{ "code": 200, "message": "文章删除成功" }
```

### 4.6 批量删除帖子
- **DELETE** `/articles/batch`
- **鉴权**: 需要Token
- **描述**: 批量删除帖子
- **请求参数**:
```json
{ "ids": [30, 31, 32] }
```
- **返回示例**:
```json
{ "code": 200, "message": "成功删除 3 篇文章" }
```

### 4.7 帖子点赞/取消点赞
- **POST** `/articles/:id/like`
- **鉴权**: 需要Token
- **描述**: 切换点赞状态，已点赞则取消，未点赞则点赞
- **路径参数**: `id` - 帖子ID
- **返回示例（点赞）**:
```json
{ "code": 200, "message": "点赞成功", "data": { "isLiked": true } }
```
- **返回示例（取消点赞）**:
```json
{ "code": 200, "message": "取消点赞成功", "data": { "isLiked": false } }
```

### 4.8 帖子收藏/取消收藏
- **POST** `/articles/:id/collects`
- **鉴权**: 需要Token
- **描述**: 切换收藏状态
- **路径参数**: `id` - 帖子ID
- **返回示例（收藏）**:
```json
{ "code": 200, "message": "收藏成功", "data": { "isCollected": true } }
```

### 4.9 发表评论
- **POST** `/articles/:id/comments`
- **鉴权**: 需要Token
- **描述**: 对帖子发表评论，支持回复（传parentId）
- **路径参数**: `id` - 帖子ID
- **请求参数**:
```json
{
  "content": "好可爱的狗狗！",
  "parentId": null
}
```
> parentId为null时为一级评论，传入评论ID时为回复评论
- **返回示例**:
```json
{ "code": 201, "message": "评论成功", "data": { "comment": { "id": 88, "content": "好可爱的狗狗！", "parentId": null, "user": { "id": 22, "nickname": "爱宠达人" } } } }
```

### 4.10 获取帖子评论列表
- **GET** `/articles/:id/comments`
- **鉴权**: 无
- **描述**: 获取帖子的评论列表，返回树形结构（含嵌套回复）
- **路径参数**: `id` - 帖子ID
- **查询参数**: `page=1`, `limit=20`
- **返回示例**:
```json
{ "code": 200, "message": "获取文章所有评论成功", "data": { "comments": [{ "id": 88, "content": "好可爱的狗狗！", "parentId": null, "replies": [{ "id": 89, "content": "谢谢！", "parentId": 88 }], "user": { "id": 22, "nickname": "爱宠达人" } }], "pagination": {...} } }
```

### 4.11 获取我的点赞列表
- **GET** `/articles/users/likes`
- **鉴权**: 需要Token
- **描述**: 获取当前用户点赞过的帖子列表
- **查询参数**: `page=1`, `limit=10`
- **返回示例**:
```json
{ "code": 200, "message": "获取用户点赞成功", "data": { "likes": [{ "likeId": 15, "likedAt": "2026-04-10T10:00:00.000Z", "article": {...} }], "pagination": {...} } }
```

### 4.12 获取我的收藏列表
- **GET** `/articles/users/collects`
- **鉴权**: 需要Token
- **描述**: 获取当前用户收藏的帖子列表
- **查询参数**: `page=1`, `limit=10`
- **返回示例**:
```json
{ "code": 200, "message": "获取用户收藏成功", "data": { "collections": [...], "pagination": {...} } }
```

### 4.13 获取我发布的帖子
- **GET** `/articles/users/posts`
- **鉴权**: 需要Token
- **描述**: 获取当前用户发布的帖子列表
- **查询参数**: `page=1`, `limit=10`, `status=1`
- **返回示例**:
```json
{ "code": 200, "message": "获取用户发表文章成功", "data": { "articles": [...], "pagination": {...} } }
```

### 4.14 批量获取帖子互动状态
- **POST** `/articles/users/status`
- **鉴权**: 需要Token
- **描述**: 批量查询当前用户对指定帖子的点赞和收藏状态
- **请求参数**:
```json
{ "articleIds": [30, 31, 32] }
```
- **返回示例**:
```json
{ "code": 200, "message": "获取用户状态成功", "data": { "30": { "isLiked": true, "isCollected": false }, "31": { "isLiked": false, "isCollected": true }, "32": { "isLiked": false, "isCollected": false } } }
```

### 4.15 管理员获取所有评论
- **GET** `/articles/admin/comments`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 管理员查看所有评论，支持筛选
- **查询参数**: `page=1`, `limit=20`, `articleId=30`, `userId=22`, `search=可爱`
- **返回示例**:
```json
{ "code": 200, "message": "获取所有评论成功", "data": { "comments": [...], "pagination": {...} } }
```

### 4.16 修改评论状态（管理员）
- **PATCH** `/articles/comments/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 审核评论（通过/隐藏）
- **路径参数**: `id` - 评论ID
- **请求参数**:
```json
{ "status": true }
```
- **返回示例**:
```json
{ "code": 200, "message": "评论状态更新成功", "data": { "status": true } }
```

### 4.17 删除评论
- **DELETE** `/articles/comments/:id`
- **鉴权**: 需要Token（评论作者或管理员）
- **描述**: 删除评论
- **路径参数**: `id` - 评论ID
- **返回示例**:
```json
{ "code": 200, "message": "评论删除成功" }
```

### 4.18 批量删除评论
- **DELETE** `/articles/comments/batch`
- **鉴权**: 需要Token
- **描述**: 批量删除评论
- **请求参数**:
```json
{ "ids": [88, 89, 90] }
```
- **返回示例**:
```json
{ "code": 200, "message": "成功删除 3 条评论" }
```

### 4.19 上传帖子图片
- **POST** `/articles/upload`
- **鉴权**: 需要Token
- **描述**: 批量上传帖子图片（最多5张）
- **请求格式**: `multipart/form-data`
- **表单字段**: `articles` (文件数组，最多5个)
- **返回示例**:
```json
{ "code": 200, "message": "上传文章图片成功", "data": { "fileUrls": ["https://oss.../articles/aaa.jpg", "https://oss.../articles/bbb.jpg"], "uploadCount": 2 } }
```

---

## 5. 领养模块 `/api/adoptions`

### 5.1 创建领养信息
- **POST** `/adoptions`
- **鉴权**: 需要Token
- **描述**: 发布宠物领养信息，支持使用已有宠物ID或创建新宠物
- **请求参数（使用已有宠物）**:
```json
{
  "petId": 15,
  "fee": "free",
  "request": ["有固定住所", "有养宠经验"],
  "other_msg": "希望领养人真心爱护小动物"
}
```
- **请求参数（创建新宠物）**:
```json
{
  "petInfo": {
    "nickName": "小橘",
    "vaccineStatus": "two_doses",
    "sex": false,
    "breed": "橘猫",
    "type": "cat",
    "birthday": "2023-03-20",
    "image": "https://oss.../adoptions/xxx.jpg",
    "nature": ["温顺"],
    "hobby": ["晒太阳"]
  },
  "fee": "paid",
  "money": 200,
  "request": ["需签订领养协议"],
  "other_msg": "含疫苗费用"
}
```
> fee可选值: `free`(无偿), `paid`(有偿), `negotiable`(面议)
- **返回示例**:
```json
{ "code": 201, "message": "领养信息创建成功", "data": { "id": 20, "fee": "free", "status": "pending", "user": {...}, "pet": {...} } }
```

### 5.2 获取领养列表
- **GET** `/adoptions`
- **鉴权**: 无
- **描述**: 分页获取领养信息列表，支持多种筛选
- **查询参数**: `page=1`, `limit=10`, `status=pending`, `fee=free`, `type=dog`, `breed=金毛`, `search=旺财`
- **返回示例**:
```json
{ "code": 200, "message": "获取领养列表成功", "data": { "adoptions": [...], "pagination": {...} } }
```

### 5.3 获取领养详情
- **GET** `/adoptions/:id`
- **鉴权**: 无
- **描述**: 获取领养信息详情，含用户和宠物完整信息
- **路径参数**: `id` - 领养信息ID
- **返回示例**:
```json
{ "code": 200, "message": "获取领养详情成功", "data": { "id": 20, "fee": "free", "status": "pending", "user": {...}, "pet": {...} } }
```

### 5.4 更新领养状态（管理员）
- **PATCH** `/adoptions/:id/status`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 管理员审核领养信息
- **路径参数**: `id` - 领养信息ID
- **请求参数**:
```json
{ "status": "approved" }
```
> status可选值: `pending`, `approved`, `rejected`
- **返回示例**:
```json
{ "code": 200, "message": "状态更新成功", "data": { "id": 20, "status": "approved" } }
```

### 5.5 删除领养信息
- **DELETE** `/adoptions/:id`
- **鉴权**: 需要Token
- **描述**: 删除领养信息（用户只能删自己的，管理员可删所有）
- **路径参数**: `id` - 领养信息ID
- **返回示例**:
```json
{ "code": 200, "message": "领养信息删除成功", "data": { "deletedId": "20" } }
```

### 5.6 批量删除领养信息
- **DELETE** `/adoptions/batch`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 批量删除领养信息
- **请求参数**:
```json
{ "ids": [20, 21, 22] }
```
- **返回示例**:
```json
{ "code": 200, "message": "成功删除 3 条领养信息", "data": { "deletedCount": 3, "deletedIds": [20, 21, 22] } }
```

### 5.7 提交领养申请
- **POST** `/adoptions/applications`
- **鉴权**: 需要Token
- **描述**: 用户对领养帖子提交申请，不能申请自己发布的领养
- **请求参数**:
```json
{
  "adoptionId": 20,
  "name": "李明",
  "phone": "13900002222",
  "experience": "养过三年猫",
  "reason": "非常喜欢小动物，想给流浪猫一个家"
}
```
- **返回示例**:
```json
{ "code": 201, "message": "申请提交成功", "data": { "id": 5, "adoptionId": 20, "applicantId": 22, "status": "pending" } }
```

### 5.8 获取我的领养申请
- **GET** `/adoptions/applications/my`
- **鉴权**: 需要Token
- **描述**: 获取当前用户提交的所有领养申请
- **返回示例**:
```json
{ "code": 200, "message": "获取成功", "data": [...] }
```

### 5.9 管理员获取所有领养申请
- **GET** `/adoptions/applications`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 管理员分页查看所有领养申请
- **查询参数**: `page=1`, `limit=10`, `status=pending`
- **返回示例**:
```json
{ "code": 200, "message": "获取成功", "data": { "applications": [...], "pagination": {...} } }
```

### 5.10 获取领养帖子的申请列表
- **GET** `/adoptions/:id/applications`
- **鉴权**: 需要Token（领养发布者或管理员）
- **描述**: 查看某个领养帖子收到的所有申请
- **路径参数**: `id` - 领养信息ID
- **返回示例**:
```json
{ "code": 200, "message": "获取成功", "data": [...] }
```

### 5.11 更新领养申请状态
- **PATCH** `/adoptions/applications/:appId/status`
- **鉴权**: 需要Token（领养发布者或管理员）
- **描述**: 审批领养申请，批准后自动更新领养帖状态并拒绝其他待处理申请
- **路径参数**: `appId` - 申请ID
- **请求参数**:
```json
{ "status": "approved" }
```
- **返回示例**:
```json
{ "code": 200, "message": "状态更新成功", "data": { "id": 5, "status": "approved" } }
```

### 5.12 获取我发布的领养帖子
- **GET** `/adoptions/my`
- **鉴权**: 需要Token
- **描述**: 获取当前用户发布的所有领养信息
- **返回示例**:
```json
{ "code": 200, "message": "获取成功", "data": [...] }
```

### 5.13 上传领养图片
- **POST** `/adoptions/upload`
- **鉴权**: 需要Token
- **描述**: 上传领养宠物图片至阿里云OSS
- **请求格式**: `multipart/form-data`
- **表单字段**: `adoption` (文件类型)
- **返回示例**:
```json
{ "code": 200, "message": "上传图片成功", "data": { "fileUrl": "https://oss.../adoptions/xxx.jpg" } }
```

---

## 6. 服务模块 `/api/services`

### 6.1 创建服务（管理员）
- **POST** `/services`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 创建宠物服务商品，默认下架状态
- **请求参数**:
```json
{
  "name": "精致美容套餐",
  "type": "beauty_styling",
  "price": 199.00,
  "weight": "all",
  "content": "包含洗澡、剪毛、修甲等全套服务",
  "image": "https://oss.../services/xxx.png"
}
```
> type可选值: `basic_care`(基础护理), `beauty_styling`(美容造型), `health_medical`(健康医疗), `training_service`(训练服务), `special_experience`(特殊体验)
- **返回示例**:
```json
{ "code": 201, "message": "服务创建成功", "data": { "id": 10, "name": "精致美容套餐", "status": false } }
```

### 6.2 获取服务列表
- **GET** `/services`
- **鉴权**: 无
- **描述**: 分页获取服务列表，支持筛选
- **查询参数**: `page=1`, `limit=10`, `type=beauty_styling`, `status=true`, `search=美容`
- **返回示例**:
```json
{ "code": 200, "message": "获取服务列表成功", "data": { "services": [...], "pagination": {...} } }
```

### 6.3 获取服务详情
- **GET** `/services/:id`
- **鉴权**: 无
- **描述**: 获取单个服务详细信息
- **路径参数**: `id` - 服务ID
- **返回示例**:
```json
{ "code": 200, "message": "获取服务详情成功", "data": { "id": 10, "name": "精致美容套餐", "type": "beauty_styling", "price": 199.00, "content": "..." } }
```

### 6.4 更新服务（管理员）
- **PATCH** `/services/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 更新服务信息，支持部分更新
- **路径参数**: `id` - 服务ID
- **请求参数**:
```json
{ "name": "豪华美容套餐", "price": 299.00, "status": true }
```
- **返回示例**:
```json
{ "code": 200, "message": "服务更新成功", "data": { "id": 10, "name": "豪华美容套餐", "price": 299.00 } }
```

### 6.5 更新服务状态（上下架）
- **PATCH** `/services/status/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 控制服务上架/下架
- **路径参数**: `id` - 服务ID
- **请求参数**:
```json
{ "status": true }
```
- **返回示例**:
```json
{ "code": 200, "message": "服务已上架", "data": { "id": 10, "status": true } }
```

### 6.6 删除服务（管理员）
- **DELETE** `/services/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 删除服务
- **路径参数**: `id` - 服务ID
- **返回示例**:
```json
{ "code": 200, "message": "服务删除成功" }
```

### 6.7 批量删除服务（管理员）
- **DELETE** `/services/batch`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 批量删除服务
- **请求参数**:
```json
{ "ids": [10, 11, 12] }
```
- **返回示例**:
```json
{ "code": 200, "message": "批量删除成功", "data": { "deletedCount": 3 } }
```

### 6.8 上传服务图片
- **POST** `/services/upload`
- **鉴权**: 需要Token
- **描述**: 上传服务图片至阿里云OSS
- **请求格式**: `multipart/form-data`
- **表单字段**: `service` (文件类型)
- **返回示例**:
```json
{ "code": 200, "message": "上传图片成功", "data": { "fileUrl": "https://oss.../services/xxx.png" } }
```

---

## 7. 购物车与预约模块 `/api/user`

### 7.1 添加到购物车
- **POST** `/user/cart`
- **鉴权**: 需要Token
- **描述**: 将服务添加到购物车，同一服务不能重复添加
- **请求参数**:
```json
{
  "serviceId": 10,
  "petWeight": 5.5,
  "notes": "请轻一点，狗狗比较胆小"
}
```
- **返回示例**:
```json
{ "code": 201, "message": "已添加到购物车", "data": { "id": 30, "userId": 22, "serviceId": 10, "petWeight": 5.5, "notes": "请轻一点，狗狗比较胆小", "selected": true } }
```

### 7.2 获取购物车列表
- **GET** `/user/cart`
- **鉴权**: 需要Token
- **描述**: 获取当前用户的购物车列表，含关联的服务详情
- **返回示例**:
```json
{ "code": 200, "message": "获取购物车成功", "data": [{ "id": 30, "serviceId": 10, "petWeight": 5.5, "selected": true, "service": { "id": 10, "name": "精致美容套餐", "price": 199.00, "image": "...", "status": true } }] }
```

### 7.3 更新购物车项
- **PATCH** `/user/cart/:id`
- **鉴权**: 需要Token
- **描述**: 更新购物车条目的选中状态、体重或备注
- **路径参数**: `id` - 购物车条目ID
- **请求参数**:
```json
{ "selected": true, "petWeight": 6.0, "notes": "更新备注" }
```
- **返回示例**:
```json
{ "code": 200, "message": "更新成功", "data": { "id": 30, "selected": true, "petWeight": 6.0 } }
```

### 7.4 删除购物车项
- **DELETE** `/user/cart/:id`
- **鉴权**: 需要Token
- **描述**: 删除购物车中的单个条目
- **路径参数**: `id` - 购物车条目ID
- **返回示例**:
```json
{ "code": 200, "message": "删除成功" }
```

### 7.5 批量删除购物车项
- **DELETE** `/user/cart/batch`
- **鉴权**: 需要Token
- **描述**: 批量删除购物车条目
- **请求参数**:
```json
{ "ids": [30, 31, 32] }
```
- **返回示例**:
```json
{ "code": 200, "message": "批量删除成功" }
```

### 7.6 创建单个预约
- **POST** `/user/booking`
- **鉴权**: 需要Token
- **描述**: 为单个服务创建预约订单
- **请求参数**:
```json
{
  "serviceId": 10,
  "appointmentDate": "2026-05-01",
  "appointmentTime": "14:00-15:00",
  "petName": "旺财",
  "petWeight": 5.5,
  "contact": "13900002222",
  "notes": "第一次来，请多关照",
  "totalPrice": 199.00
}
```
- **返回示例**:
```json
{ "code": 201, "message": "预约成功", "data": { "id": 40, "userId": 22, "serviceId": 10, "status": "pending", "total_price": 199.00 } }
```

### 7.7 批量创建预约（从购物车）
- **POST** `/user/bookings/batch`
- **鉴权**: 需要Token
- **描述**: 从购物车批量创建预约订单，成功后自动删除购物车已预约项
- **请求参数**:
```json
{
  "serviceIds": [10, 11],
  "appointmentDate": "2026-05-01",
  "appointmentTime": "14:00-15:00",
  "petName": "旺财",
  "petWeight": 5.5,
  "contact": "13900002222",
  "notes": "批量预约"
}
```
- **返回示例**:
```json
{ "code": 201, "message": "成功预约 2 项服务", "data": { "bookings": [...], "count": 2 } }
```

### 7.8 获取用户预约列表
- **GET** `/user/bookings`
- **鉴权**: 需要Token
- **描述**: 获取当前用户的预约列表
- **查询参数**: `status=pending`
- **返回示例**:
```json
{ "code": 200, "message": "获取预约列表成功", "data": [{ "id": 40, "status": "pending", "service": { "name": "精致美容套餐", "price": 199.00 } }] }
```

### 7.9 获取用户预约详情
- **GET** `/user/booking/:id`
- **鉴权**: 需要Token
- **描述**: 获取单个预约的详细信息
- **路径参数**: `id` - 预约ID
- **返回示例**:
```json
{ "code": 200, "message": "获取预约详情成功", "data": { "id": 40, "appointmentDate": "2026-05-01", "status": "pending", "service": {...} } }
```

### 7.10 取消预约
- **PATCH** `/user/booking/:id/cancel`
- **鉴权**: 需要Token
- **描述**: 用户取消预约（仅待确认状态可取消）
- **路径参数**: `id` - 预约ID
- **请求参数**:
```json
{ "cancelReason": "临时有事无法前往" }
```
- **返回示例**:
```json
{ "code": 200, "message": "预约已取消", "data": { "id": 40, "status": "cancelled", "cancelReason": "临时有事无法前往" } }
```

---

## 8. 预约管理模块 `/api/bookings`（管理员）

### 8.1 获取预约列表
- **GET** `/bookings`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 管理员分页获取所有预约订单
- **查询参数**: `page=1`, `limit=10`, `status=pending`, `search=petLover`
- **返回示例**:
```json
{ "code": 200, "message": "获取预约列表成功", "data": { "bookings": [...], "pagination": {...} } }
```

### 8.2 获取预约统计
- **GET** `/bookings/stats`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 获取预约订单各状态统计
- **返回示例**:
```json
{ "code": 200, "message": "获取预约统计成功", "data": { "stats": [{ "status": "pending", "count": 15 }, { "status": "confirmed", "count": 8 }], "total": 30 } }
```

### 8.3 获取预约详情
- **GET** `/bookings/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 管理员获取预约详细信息
- **路径参数**: `id` - 预约ID
- **返回示例**:
```json
{ "code": 200, "message": "获取预约详情成功", "data": { "id": 40, "user": {...}, "service": {...}, "appointmentDate": "2026-05-01" } }
```

### 8.4 更新预约状态
- **PATCH** `/bookings/status/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 管理员确认/完成/取消预约
- **路径参数**: `id` - 预约ID
- **请求参数**:
```json
{ "status": "confirmed", "cancelReason": "服务人员不足" }
```
> status可选值: `pending`, `confirmed`, `completed`, `cancelled`
- **返回示例**:
```json
{ "code": 200, "message": "预约状态更新成功", "data": { "id": 40, "status": "confirmed" } }
```

### 8.5 删除预约
- **DELETE** `/bookings/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 管理员删除预约记录
- **路径参数**: `id` - 预约ID
- **返回示例**:
```json
{ "code": 200, "message": "预约删除成功" }
```

### 8.6 批量删除预约
- **DELETE** `/bookings/batch`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 批量删除预约记录
- **请求参数**:
```json
{ "ids": [40, 41, 42] }
```
- **返回示例**:
```json
{ "code": 200, "message": "批量删除成功", "data": { "deletedCount": 3 } }
```

---

## 9. 通知模块 `/api/notices`

### 9.1 创建公告（管理员）
- **POST** `/notices`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 发布系统公告
- **请求参数**:
```json
{
  "title": "平台五一活动通知",
  "content": "五一期间所有服务享8折优惠...",
  "cover": "https://oss.../notices/xxx.png"
}
```
> title长度不超过100字符
- **返回示例**:
```json
{ "code": 201, "message": "公告创建成功", "data": { "id": 25, "title": "平台五一活动通知", "content": "...", "cover": "...", "adminId": 1, "status": true } }
```

### 9.2 获取公告列表
- **GET** `/notices`
- **鉴权**: 无
- **描述**: 分页获取公告列表，支持搜索
- **查询参数**: `page=1`, `limit=10`, `search=活动`, `status=true`
- **返回示例**:
```json
{ "code": 200, "message": "公告列表获取成功", "data": { "notices": [...], "pagination": {...} } }
```

### 9.3 获取公告详情
- **GET** `/notices/:id`
- **鉴权**: 无
- **描述**: 获取公告详细内容
- **路径参数**: `id` - 公告ID
- **返回示例**:
```json
{ "code": 200, "message": "公告详情获取成功", "data": { "id": 25, "title": "平台五一活动通知", "content": "..." } }
```

### 9.4 更新公告（管理员）
- **PATCH** `/notices/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 修改公告内容和封面
- **路径参数**: `id` - 公告ID
- **请求参数**:
```json
{
  "title": "修改后的公告标题",
  "content": "修改后的公告内容",
  "cover": "https://oss.../notices/new_cover.png"
}
```
- **返回示例**:
```json
{ "code": 200, "message": "公告更新成功", "data": { "id": 25, "title": "修改后的公告标题" } }
```

### 9.5 更新公告状态
- **PATCH** `/notices/status/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 控制公告显示/隐藏
- **路径参数**: `id` - 公告ID
- **请求参数**:
```json
{ "status": "true" }
```
- **返回示例**:
```json
{ "code": 200, "message": "公告状态更新成功" }
```

### 9.6 删除公告（管理员）
- **DELETE** `/notices/:id`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 删除公告
- **路径参数**: `id` - 公告ID
- **返回示例**:
```json
{ "code": 200, "message": "公告删除成功" }
```

### 9.7 批量删除公告
- **DELETE** `/notices/batch`
- **鉴权**: 需要Token（仅管理员）
- **描述**: 批量删除公告
- **请求参数**:
```json
{ "ids": [25, 26, 27] }
```
- **返回示例**:
```json
{ "code": 200, "message": "成功删除 3 个公告", "deletedCount": 3 }
```

### 9.8 上传公告图片
- **POST** `/notices/upload`
- **鉴权**: 需要Token
- **描述**: 上传公告封面图片至阿里云OSS
- **请求格式**: `multipart/form-data`
- **表单字段**: `notice` (文件类型)
- **返回示例**:
```json
{ "code": 200, "message": "上传图片成功", "data": { "fileUrl": "https://oss.../notices/xxx.png" } }
```

---

## 通用响应格式

| 状态码 | 含义 |
|-------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 参数错误/验证失败 |
| 401 | 未认证/Token无效/权限不足 |
| 403 | 禁止访问（角色权限不够） |
| 404 | 资源不存在 |
| 409 | 资源冲突（如重复注册） |
| 500 | 服务器内部错误 |

## 通用分页响应格式
```json
{
  "currentPage": 1,
  "pageSize": 10,
  "totalItems": 50,
  "totalPages": 5,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

## 认证说明
- 需要鉴权的接口需在请求头添加: `Authorization: Bearer <token>`
- Token有效期为24小时
- Token中包含用户ID和角色信息（user/admin）
