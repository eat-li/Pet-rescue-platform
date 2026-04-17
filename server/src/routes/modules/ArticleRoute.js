const express = require('express')
const router = express.Router()
const { PersonAuth } = require("../../middleware/auth")
const ArticleService = require("../../services/ArticleService")
const upload = require("../../utils/upload")


// 发布文章(用户需要登录了才能发布）
router.post('/', PersonAuth, ArticleService.ArticleCreateService)

// 获取文章列表
router.get('/', ArticleService.ArticleListService)

// 获取文章详情
router.get('/:id', ArticleService.ArticleSingleService)

// 批量删除文章
router.delete('/batch', PersonAuth, ArticleService.ArticleBatchDeleteService)


// 删除文章
router.delete('/:id', PersonAuth, ArticleService.ArticleDeleteService)

// 修改文章
router.patch('/:id', PersonAuth, ArticleService.ArticleUpdateService)


// 文章点赞
router.post('/:id/like', PersonAuth, ArticleService.ArticleLikeService)

// 获取自己的点赞列表
router.get('/users/likes', PersonAuth, ArticleService.ArticleLikeListService)


// 获取所有评论，管理员
router.get('/admin/comments', PersonAuth, ArticleService.ArticleGetAllCommentService)

// 修改评论状态
router.patch('/comments/:id', PersonAuth, ArticleService.ArticleCommentStatusService)

// 文章评论
router.post('/:id/comments', PersonAuth, ArticleService.ArticleCommentService)

// 获取单个文章评论列表
router.get('/:id/comments', ArticleService.ArticleGetOneAllCommentService)

// 批量删除评论
router.delete('/comments/batch', PersonAuth, ArticleService.ArticleCommentBatchDeleteService)

// 删除评论
router.delete('/comments/:id', PersonAuth, ArticleService.ArticleCommentDeleteService)

// 文章收藏
router.post('/:id/collects', PersonAuth, ArticleService.ArticleCollectService)

// 获取用户的收藏列表
router.get('/users/collects', PersonAuth, ArticleService.ArticleCollectionService)

// 获取用户自己发表的文章列表
router.get('/users/posts', PersonAuth, ArticleService.ArticleUserPostsService)

// 获取用户对文章列表的状态
router.post('/users/status', PersonAuth, ArticleService.ArticleUserStatusService)

// 上传文章帖子图片多张
router.post(
  '/upload',
  PersonAuth,
  upload.array('articles', 5),
  ArticleService.ArticleUploadService)



module.exports = router