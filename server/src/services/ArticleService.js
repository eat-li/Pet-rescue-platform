const Article = require('../models/Article/Article')

const User = require('../models/User/User')
const ArticleCollection = require('../models/Article/ArticleCollection')
const ArticleStar = require('../models/Article/ArticleStar')
const ArticleComment = require('../models/Article/ArticleComment')
const { Op } = require('sequelize')
const { uploadMultipleToOSS } = require('../utils/ossUpload')

// 创建帖子
exports.ArticleCreateService = async (req, res) => {
  const currentUserId = req.currentUser.id  // 从认证中间件获取当前用户ID
  const role = req.role  // 获取用户角色
  const { title, type, content, images = [], tag = [], userId } = req.body
  
  // 确定最终使用的userId：管理员可以指定userId，否则使用当前用户ID
  const finalUserId = (role === 'admin' && userId) ? userId : currentUserId
  
  console.log(
    title, type, content, images, tag,
    finalUserId, role
  )

  try {
    //  基础验证
    if (!title || !type || !content || !finalUserId) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段: title, type, content, userId'
      })
    }
    // tag最多5个
    if (tag.length > 5) {
      return res.status(400).json({
        code: 400,
        message: '标签最多5个'
      })
    }

    // 验证内容类型
    const validTypes = ['pet_daily', 'help_question', 'experience_share']
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        code: 400,
        message: `无效的内容类型，可选值: ${validTypes.join(', ')}`
      })
    }

    // 验证用户存在性
    const user = await User.findByPk(finalUserId)
    if (!user) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      })
    }

    //  创建文章（自动关联用户）
    const newArticle = await Article.create({
      title,
      type,
      content,
      images, // 统一为数组格式
      tag, // 限制最多10个标签
      status: 1, // 默认发布状态
      userId: finalUserId // 关联用户ID
    })

    //  返回创建结果（排除敏感字段）
    const { userId: _, ...safeArticleData } = newArticle.toJSON()

    return res.status(201).json({
      code: 201,
      message: '文章创建成功',
      data: safeArticleData
    })

  } catch (err) {
    console.error('文章创建失败:', err)
    return res.status(500).json({
      code: 500,
      message: "文章创建失败，请稍后再试"
    })
  }
}

// 获取文章列表（分页）
exports.ArticleListService = async (req, res) => {
  try {
    // 从查询参数获取分页信息和筛选条件
    const {
      type,
      tag,
      status, // 移除默认值，允许为undefined
      search = ''
    } = req.query

    // 验证分页参数有效性
    const currentPage = parseInt(req.query.page) || 1
    const pageSize = parseInt(req.query.limit) || 10

    if (isNaN(currentPage) || isNaN(pageSize) || currentPage < 1 || pageSize < 1) {
      return res.status(400).json({
        code: 400,
        message: '无效的分页参数，page和limit必须为正整数'
      })
    }

    // 构建查询条件
    const whereCondition = {}

    // 只有当status参数明确传递时才添加到查询条件中
    if (status !== undefined) {
      // 将字符串 'true'/'false' 转换为布尔值
      whereCondition.status = status === 'true' || status === true
    }
    // 如果不传status参数，则不添加status条件，获取所有状态的帖子


    // 如果有类型筛选，添加到查询条件
    if (type) {
      const validTypes = ['pet_daily', 'help_question', 'experience_share']
      if (validTypes.includes(type)) {
        whereCondition.type = type
      } else {
        return res.status(400).json({
          code: 400,
          message: `无效的内容类型，可选值: ${validTypes.join(', ')}`
        })
      }
    }

    // 如果有标签筛选，添加到查询条件
    if (tag) {
      whereCondition.tag = {
        [Op.contains]: [tag]  // 查找包含该标签的文章
      }
    }

    // 如果有搜索关键词，添加到查询条件
    if (search) {
      whereCondition[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },  // 标题模糊搜索
        { content: { [Op.like]: `%${search}%` } }  // 内容模糊搜索
      ]
    }

    // 计算偏移量
    const offset = (currentPage - 1) * pageSize

    // 执行分页查询，关联查询用户信息（不包含敏感字段）
    const { count, rows: articles } = await Article.findAndCountAll({
      where: whereCondition,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar', 'nickname']  // 只返回需要的用户字段
      }],
      order: [['createdAt', 'DESC']],  // 按创建时间降序排列
      limit: pageSize,
      offset: offset
    })

    // 计算分页信息
    const totalPages = Math.ceil(count / pageSize)

    // 构建分页对象
    const pagination = {
      currentPage: currentPage,
      pageSize: pageSize,
      totalItems: count,
      totalPages: totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    }

    // 返回结果
    return res.status(200).json({
      code: 200,
      message: '文章列表获取成功',
      data: {
        articles,
        pagination
      }
    })

  } catch (err) {
    console.error('获取文章列表失败:', err)
    return res.status(500).json({
      code: 500,
      message: "获取文章列表失败，请稍后再试"
    })
  }
}

// 获取文章详情
exports.ArticleSingleService = async (req, res) => {
  try {
    const { id: articleId } = req.params
    const article = await Article.findByPk(articleId, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar', 'nickname']  // 只返回需要的用户字段
      }]
    })
    // 存在性验证
    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      })
    }

    return res.status(200).json({
      code: 200,
      message: '文章详情获取成功',
      data: article
    })


  } catch (err) {
    console.error('获取文章详情失败:', err)
    return res.status(500).json({
      code: 500,
      message: "获取文章详情失败，请稍后再试"

    })
  }
}

// 删除文章
exports.ArticleDeleteService = async (req, res) => {
  try {
    const { id: userId } = req.currentUser
    const role = req.role
    const { id: articleId } = req.params

    const article = await Article.findByPk(articleId)

    // 存在性验证
    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      })
    }

    // 权限判断逻辑
    if (article.userId !== userId && role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '没有权限删除该文章'
      })
    }

    // 删除文章
    await article.destroy()

    return res.status(200).json({
      code: 200,
      message: '文章删除成功'
    })
  } catch (err) {
    console.error('删除文章失败:', err)
    return res.status(500).json({
      code: 500,
      message: "删除文章失败，请稍后再试"
    })
  }
}

// 批量删除文章
exports.ArticleBatchDeleteService = async (req, res) => {
  try {
    const { id: userId } = req.currentUser
    const role = req.role
    const { ids } = req.body

    // 验证ids是否为空
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的文章ID列表'
      })
    }

    // 验证ids是否为数字
    if (!ids.every(id => Number.isInteger(id))) {
      return res.status(400).json({
        code: 400,
        message: '文章ID列表必须为数字'
      })
    }

    // 查找要删除的文章
    const articles = await Article.findAll({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    })

    // 检查权限：只有文章作者或管理员可以删除
    if (role !== 'admin') {
      const unauthorizedArticles = articles.filter(article => article.userId !== userId)
      if (unauthorizedArticles.length > 0) {
        return res.status(403).json({
          code: 403,
          message: '没有权限删除部分文章'
        })
      }
    }

    // 执行批量删除
    await Article.destroy({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    })

    return res.status(200).json({
      code: 200,
      message: `成功删除 ${articles.length} 篇文章`
    })
  } catch (err) {
    console.error('批量删除文章失败:', err)
    return res.status(500).json({
      code: 500,
      message: "批量删除文章失败，请稍后再试"
    })
  }
}






// 修改文章
exports.ArticleUpdateService = async (req, res) => {
  try {
    const { id } = req.params
    const currentUserId = req.currentUser.id
    const currentUserRole = req.role
    const { title, type, content, images = [], tag = [], status } = req.body

    // 查找文章
    const article = await Article.findByPk(id)
    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      })
    }

    // 权限判断：文章作者或管理员可以修改
    if (article.userId !== currentUserId && currentUserRole !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '没有权限修改该文章'
      })
    }

    // 数据验证
    if (!title || !type || !content) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段: title, type, content'
      })
    }

    // 验证标签数量
    if (tag.length > 10) {
      return res.status(400).json({
        code: 400,
        message: '标签最多10个'
      })
    }

    // 验证内容类型
    const validTypes = ['pet_daily', 'help_question', 'experience_share']
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        code: 400,
        message: `无效的内容类型，可选值: ${validTypes.join(', ')}`
      })
    }

    // 只有管理员可以修改状态
    const updateData = {
      title,
      type,
      content,
      images,
      tag
    }

    // 如果是管理员且传递了status参数，才允许修改状态
    if (currentUserRole === 'admin' && status !== undefined) {
      updateData.status = status
    }

    // 执行更新
    await article.update(updateData)

    // 返回更新后的文章信息（排除敏感字段）
    const { userId: _, ...updatedArticle } = article.toJSON()

    return res.status(200).json({
      code: 200,
      message: '文章更新成功',
      data: updatedArticle
    })

  } catch (err) {
    console.error('更新文章失败:', err)
    return res.status(500).json({
      code: 500,
      message: '更新文章失败，请稍后再试'
    })
  }
}


// 用户给文章点赞、取消点赞
exports.ArticleLikeService = async (req, res) => {
  try {
    // 获取用户ID和文章ID
    const userId = req.currentUser.id
    const { id: articleId } = req.params

    // 验证文章是否存在
    const article = await Article.findByPk(articleId)
    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      })
    }

    // 检查用户是否已经点赞
    const existingLike = await ArticleStar.findOne({
      where: {
        userId,
        articleId
      }
    })

    if (existingLike) {
      // 已点赞，执行取消点赞操作
      await existingLike.destroy()

      // 更新文章点赞数（减1）
      await article.update({
        star: Math.max(0, article.star - 1) // 确保点赞数不会小于0
      })

      return res.status(200).json({
        code: 200,
        message: '取消点赞成功',
        data: {
          isLiked: false,
        }
      })
    } else {
      // 未点赞，执行点赞操作
      await ArticleStar.create({
        userId,
        articleId
      })

      // 更新文章点赞数（加1）
      await article.update({
        star: article.star + 1
      })

      return res.status(200).json({
        code: 200,
        message: '点赞成功',
        data: {
          isLiked: true,
        }
      })
    }

  } catch (err) {
    console.error('点赞操作失败:', err)
    return res.status(500).json({
      code: 500,
      message: '点赞操作失败，请稍后再试'
    })
  }
}


/// 用户给文章评论
exports.ArticleCommentService = async (req, res) => {
  try {
    // 获取用户ID、文章ID和评论内容
    const userId = req.currentUser.id
    const { id: articleId } = req.params
    const { content, parentId } = req.body

    // 处理parentId：确保空值时为null而不是空字符串
    const processedParentId = (parentId === '' || parentId === undefined) ? null : parentId

    // 验证必要参数
    if (!content) {
      return res.status(400).json({
        code: 400,
        message: '评论内容不能为空'
      })
    }

    // 验证文章是否存在
    const article = await Article.findByPk(articleId)
    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      })
    }

    // 验证父评论是否存在（如果是回复）
    if (processedParentId) {
      // 确保parentId是整数
      const parentIdInt = parseInt(processedParentId, 10)
      if (isNaN(parentIdInt)) {
        return res.status(400).json({
          code: 400,
          message: '父评论ID必须是有效的整数'
        })
      }

      const parentComment = await ArticleComment.findByPk(parentIdInt)
      if (!parentComment || parentComment.articleId !== parseInt(articleId)) {
        return res.status(404).json({
          code: 404,
          message: '回复的评论不存在'
        })
      }
    }

    // 创建评论
    const comment = await ArticleComment.create({
      userId,
      articleId: parseInt(articleId, 10),
      content,
      parentId: processedParentId !== null ? parseInt(processedParentId, 10) : null // 转换为整数或null
    })

    // 关联查询用户信息（返回给前端显示）
    const newComment = await ArticleComment.findByPk(comment.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar', 'nickname']
      }]
    })

    // 更新文章的评论数（加1）
    await article.update({
      comment: article.comment + 1
    })

    // 返回结果
    return res.status(201).json({
      code: 201,
      message: '评论成功',
      data: {
        comment: newComment,
      }
    })

  } catch (err) {
    console.error('评论操作失败:', err)
    return res.status(500).json({
      code: 500,
      message: '评论失败，请稍后再试'
    })
  }
}

// 获取单个文章的所有评论
exports.ArticleGetOneAllCommentService = async (req, res) => {
  try {
    const { id: articleId } = req.params
    // 获取分页参数，默认第一页，每页20条
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20

    // 验证分页参数
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({
        code: 400,
        message: '无效的分页参数，page和limit必须为正整数'
      })
    }

    // 验证文章是否存在
    const article = await Article.findByPk(articleId)
    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      })
    }

    // 计算偏移量
    const offset = (page - 1) * limit

    // 查询评论总数（只统计status为true的评论）
    const totalComments = await ArticleComment.count({
      where: { articleId, status: true }
    })

    // 查询评论列表，关联用户信息（只显示已审核通过的评论）
    const comments = await ArticleComment.findAll({
      where: { articleId, status: true },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'avatar', 'nickname'] // 只返回必要的用户信息
      }],
      order: [['createdAt', 'DESC']], // 按创建时间倒序，最新的评论在前
      limit,
      offset
    })

    // 构建分页信息
    const totalPages = Math.ceil(totalComments / limit)
    const pagination = {
      currentPage: page,
      pageSize: limit,
      totalItems: totalComments,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }

    // 处理评论层级（将回复关联到对应的父评论）
    const commentMap = {}
    const rootComments = []

    // 先将所有评论按ID映射
    comments.forEach(comment => {
      const commentObj = comment.toJSON() // seq实例转为普通对象
      commentObj.replies = []  // 用于存储回复，默认为空
      commentMap[commentObj.id] = commentObj //

      // 没有父评论的是根评论
      if (!commentObj.parentId) {
        rootComments.push(commentObj)
      }
    })

    // 关联回复到父评论
    comments.forEach(comment => {
      const commentObj = comment.toJSON()
      if (commentObj.parentId && commentMap[commentObj.parentId]) {
        commentMap[commentObj.parentId].replies.push(commentObj)
      }
    })

    return res.status(200).json({
      code: 200,
      message: '获取文章所有评论成功',
      data: {
        comments: rootComments, // 只返回根评论，回复包含在replies中
        pagination
      }
    })

  } catch (err) {
    console.error('获取文章所有评论失败:', err)
    return res.status(500).json({
      code: 500,
      message: '获取文章所有评论失败，请稍后再试'
    })
  }
}


// 获取所有评论，管理员
exports.ArticleGetAllCommentService = async (req, res) => {
  try {
    // 权限验证：仅管理员可访问
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可查看所有评论'
      });
    }

    // 获取分页参数和筛选条件
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { articleId, userId, content, search } = req.query;

    // 验证分页参数
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return res.status(400).json({
        code: 400,
        message: '无效的分页参数，page和limit必须为正整数'
      });
    }

    // 构建查询条件
    const whereCondition = {};

    // 按文章ID筛选
    if (articleId) {
      whereCondition.articleId = articleId;
    }

    // 按用户ID筛选
    if (userId) {
      whereCondition.userId = userId;
    }

    // 按评论内容模糊搜索 - 支持 content 和 search 参数
    if (content || search) {
      const searchTerm = content || search;
      whereCondition.content = {
        [Op.like]: `%${searchTerm}%`
      };
    }

    // 计算偏移量
    const offset = (page - 1) * limit;

    // 查询评论总数
    const totalComments = await ArticleComment.count({
      where: whereCondition
    });

    // 查询评论列表，关联用户和文章信息
    const comments = await ArticleComment.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar', 'nickname'] // 用户信息
        },
        {
          model: Article,
          as: 'article',
          attributes: ['id', 'title'] // 关联的文章信息（仅标题和ID）
        }
      ],
      order: [['createdAt', 'DESC']], // 按创建时间倒序
      limit,
      offset
    });

    // 构建分页信息
    const totalPages = Math.ceil(totalComments / limit);
    const pagination = {
      currentPage: page,
      pageSize: limit,
      totalItems: totalComments,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };

    return res.status(200).json({
      code: 200,
      message: '获取所有评论成功',
      data: {
        comments,
        pagination
      }
    });

  } catch (err) {
    console.error('管理员获取所有评论失败:', err);
    return res.status(500).json({
      code: 500,
      message: '获取评论失败，请稍后再试'
    });
  }
}

// 修改评论状态
exports.ArticleCommentStatusService = async (req, res) => {
  try {
    // 获取评论ID和状态
    const role = req.role;
    console.log(123)
    if (role !== 'admin' && role !== 'super_admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可修改评论状态'
      });
    }

    const { id: commentId } = req.params;
    const { status } = req.body;
    // 验证状态值
    if (status !== true && status !== false) {
      return res.status(400).json({
        code: 400,
        message: '状态值必须为true或false'
      })
    }

    // 查找评论
    const comment = await ArticleComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        code: 404,
        message: '评论不存在'
      });
    }

    // 更新状态
    await comment.update({
      status
    });

    return res.status(200).json({
      code: 200,
      message: '评论状态更新成功',
      data: {
        status
      }
    });
  } catch (err) {
    console.error('更新评论状态失败:', err);
    return res.status(500).json({
      code: 500,
      message: '更新评论状态失败，请稍后再试'
    });
  }
}

// 删除评论
exports.ArticleCommentDeleteService = async (req, res) => {
  try {
    const role = req.role;
    const userId = req.currentUser.id;

    const { id: commentId } = req.params;
    const comment = await ArticleComment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({
        code: 404,
        message: '评论不存在'
      });
    }

    if (role !== 'admin' && role !== 'super_admin' && userId !== comment.userId) {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可删除评论'
      });
    }

    // 删除评论
    await comment.destroy();

    return res.status(200).json({
      code: 200,
      message: '评论删除成功'
    });
  } catch (err) {
    console.error('删除评论失败:', err);
    return res.status(500).json({
      code: 500,
      message: '删除评论失败，请稍后再试'
    });
  }
}

// 批量删除评论
exports.ArticleCommentBatchDeleteService = async (req, res) => {
  try {
    const { id: userId } = req.currentUser
    const role = req.role


    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请提供要删除的评论ID列表'
      });
    }


    if (!ids.every(id => Number.isInteger(id))) {
      return res.status(400).json({
        code: 400,
        message: '评论ID列表必须为数字'
      })
    }

    // 检查删除的评论
    const comments = await ArticleComment.findAll({
      where: {
        id: {
          [Op.in]: ids
        }
      }
    })

    // 验证评论是否存在
    if (comments.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '没有找到要删除的评论'
      })
    }

    // 检查是否有部分评论不存在
    const foundIds = comments.map(comment => comment.id)
    const notFoundIds = ids.filter(id => !foundIds.includes(id))

    if (notFoundIds.length > 0) {
      return res.status(404).json({
        code: 404,
        message: `以下评论不存在: ${notFoundIds.join(', ')}`
      })
    }

    // 检查权限：只有评论作者或管理员可以删除
    if (role !== 'admin') {
      const unComments = comments.filter(comment => comment.userId !== userId)
      if (unComments.length > 0) {
        return res.status(403).json({
          code: 403,
          message: '权限不足，仅管理员可删除其他用户的评论'
        })
      }
    }

    // 执行批量删除
    await ArticleComment.destroy({
      where: {
        id: {
          [Op.in]: foundIds  // 只删除确实存在的评论
        }
      }
    })

    // 更新相关文章的评论数
    const articleIds = [...new Set(comments.map(comment => comment.articleId))]
    for (const articleId of articleIds) {
      const remainingComments = await ArticleComment.count({
        where: { articleId }
      })
      await Article.update(
        { comment: remainingComments },
        { where: { id: articleId } }
      )
    }

    return res.status(200).json({
      code: 200,
      message: `成功删除 ${comments.length} 条评论`
    })

  } catch (err) {
    console.error('批量删除评论失败:', err);
    return res.status(500).json({
      code: 500,
      message: '批量删除评论失败，请稍后再试'
    });
  }
}


// 用户收藏/取消收藏文章
exports.ArticleCollectService = async (req, res) => {
  try {
    // 获取用户ID和文章ID
    const userId = req.currentUser.id;
    const { id: articleId } = req.params;

    // 验证文章是否存在
    const article = await Article.findByPk(articleId);
    if (!article) {
      return res.status(404).json({
        code: 404,
        message: '文章不存在'
      });
    }

    // 检查用户是否已经收藏该文章
    const existingCollection = await ArticleCollection.findOne({
      where: {
        userId,
        articleId
      }
    });

    if (existingCollection) {
      // 已收藏，执行取消收藏操作
      await existingCollection.destroy();

      // 更新文章收藏数（减1）
      await article.update({
        collection: Math.max(0, article.collection - 1) // 确保收藏数不会小于0
      });

      return res.status(200).json({
        code: 200,
        message: '取消收藏成功',
        data: {
          isCollected: false,
        }
      });
    } else {
      // 未收藏，执行收藏操作
      await ArticleCollection.create({
        userId,
        articleId
      });

      // 更新文章收藏数（加1）
      await article.update({
        collection: article.collection + 1
      });

      return res.status(200).json({
        code: 200,
        message: '收藏成功',
        data: {
          isCollected: true,
        }
      });
    }

  } catch (err) {
    console.error('收藏操作失败:', err);
    return res.status(500).json({
      code: 500,
      message: '收藏操作失败，请稍后再试'
    });
  }
}
// 获取单个用户的所有收藏
exports.ArticleCollectionService = async (req, res) => {
  try {
    // 获取当前用户ID（如果需要只能查看自己的收藏）
    // 如需管理员查看他人收藏，可添加权限判断并从参数获取目标用户ID
    const userId = req.currentUser.id;
    const { page = 1, limit = 10 } = req.query;

    // 验证分页参数
    const currentPage = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (isNaN(currentPage) || isNaN(pageSize) || currentPage < 1 || pageSize < 1) {
      return res.status(400).json({
        code: 400,
        message: '无效的分页参数，page和limit必须为正整数'
      });
    }

    // 计算偏移量
    const offset = (currentPage - 1) * pageSize;

    // 查询用户收藏的总数
    const totalCollections = await ArticleCollection.count({
      where: { userId }
    });

    // 查询用户收藏的文章，关联文章详情和作者信息
    const collections = await ArticleCollection.findAll({
      where: { userId },
      include: [
        {
          model: Article,
          as: 'article',
          where: { status: 1 }, // 只返回审核通过的文章
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar', 'nickname'] // 文章作者信息
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']], // 按收藏时间倒序，最新收藏在前
      limit: pageSize,
      offset: offset
    });

    // 处理返回数据，提取有效的文章信息
    const collectedArticles = collections
      .filter(item => item.article) // 过滤掉可能已被删除的文章
      .map(item => ({
        collectionId: item.id,
        collectedAt: item.createdAt,
        article: item.article
      }));

    // 计算分页信息
    const totalPages = Math.ceil(totalCollections / pageSize);
    const pagination = {
      currentPage: currentPage,
      pageSize: pageSize,
      totalItems: totalCollections,
      totalPages: totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };

    return res.status(200).json({
      code: 200,
      message: '获取用户收藏成功',
      data: {
        collections: collectedArticles,
        pagination
      }
    });

  } catch (err) {
    console.error('获取用户收藏失败:', err);
    return res.status(500).json({
      code: 500,
      message: '获取用户收藏失败，请稍后再试'
    });
  }
};

// 获取单个用户的所有点赞文章
exports.ArticleLikeListService = async (req, res) => {
  try {
    // 获取当前用户ID
    const userId = req.currentUser.id;
    const { page = 1, limit = 10 } = req.query;

    // 验证分页参数
    const currentPage = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (isNaN(currentPage) || isNaN(pageSize) || currentPage < 1 || pageSize < 1) {
      return res.status(400).json({
        code: 400,
        message: '无效的分页参数，page和limit必须为正整数'
      });
    }

    // 计算偏移量
    const offset = (currentPage - 1) * pageSize;

    // 查询用户点赞的总数
    const totalLikes = await ArticleStar.count({
      where: { userId }
    });

    // 查询用户点赞的文章，关联文章详情和作者信息
    const likes = await ArticleStar.findAll({
      where: { userId },
      include: [
        {
          model: Article,
          as: 'article',
          where: { status: 1 }, // 只返回审核通过的文章
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'username', 'avatar', 'nickname'] // 文章作者信息
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']], // 按点赞时间倒序，最新点赞在前
      limit: pageSize,
      offset: offset
    });

    // 处理返回数据，提取有效的文章信息
    const likedArticles = likes
      .filter(item => item.article) // 过滤掉可能已被删除的文章
      .map(item => ({
        likeId: item.id,
        likedAt: item.createdAt,
        article: item.article
      }));

    // 计算分页信息
    const totalPages = Math.ceil(totalLikes / pageSize);
    const pagination = {
      currentPage: currentPage,
      pageSize: pageSize,
      totalItems: totalLikes,
      totalPages: totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };

    return res.status(200).json({
      code: 200,
      message: '获取用户点赞成功',
      data: {
        likes: likedArticles,
        pagination
      }
    });

  } catch (err) {
    console.error('获取用户点赞失败:', err);
    return res.status(500).json({
      code: 500,
      message: '获取用户点赞失败，请稍后再试'
    });
  }
};

// 获取用户对文章列表的点赞和收藏状态
exports.ArticleUserStatusService = async (req, res) => {
  try {
    const userId = req.currentUser.id;
    const { articleIds } = req.body; // 文章ID数组

    if (!articleIds || !Array.isArray(articleIds) || articleIds.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '文章ID列表不能为空'
      });
    }

    // 查询用户的点赞状态
    const likes = await ArticleStar.findAll({
      where: {
        userId,
        articleId: articleIds
      },
      attributes: ['articleId']
    });

    // 查询用户的收藏状态
    const collections = await ArticleCollection.findAll({
      where: {
        userId,
        articleId: articleIds
      },
      attributes: ['articleId']
    });

    // 构建状态映射
    const likedArticleIds = likes.map(like => like.articleId);
    const collectedArticleIds = collections.map(collection => collection.articleId);

    const userStatus = {};
    articleIds.forEach(articleId => {
      userStatus[articleId] = {
        isLiked: likedArticleIds.includes(parseInt(articleId)),
        isCollected: collectedArticleIds.includes(parseInt(articleId))
      };
    });

    return res.status(200).json({
      code: 200,
      message: '获取用户状态成功',
      data: userStatus
    });

  } catch (err) {
    console.error('获取用户状态失败:', err);
    return res.status(500).json({
      code: 500,
      message: '获取用户状态失败，请稍后再试'
    });
  }
};

// 获取用户自己发表的文章列表
exports.ArticleUserPostsService = async (req, res) => {
  try {
    // 获取当前用户ID
    const userId = req.currentUser.id;
    const { page = 1, limit = 10, status } = req.query;

    // 验证分页参数
    const currentPage = parseInt(page, 10);
    const pageSize = parseInt(limit, 10);

    if (isNaN(currentPage) || isNaN(pageSize) || currentPage < 1 || pageSize < 1) {
      return res.status(400).json({
        code: 400,
        message: '无效的分页参数，page和limit必须为正整数'
      });
    }

    // 计算偏移量
    const offset = (currentPage - 1) * pageSize;

    // 构建查询条件
    const whereCondition = { userId };

    // 如果指定了状态，则添加状态筛选
    if (status !== undefined) {
      whereCondition.status = parseInt(status, 10);
    }

    // 查询用户发表的文章总数
    const totalArticles = await Article.count({
      where: whereCondition
    });

    // 查询用户发表的文章列表
    const articles = await Article.findAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'avatar', 'nickname'] // 作者信息
        }
      ],
      order: [['createdAt', 'DESC']], // 按创建时间倒序，最新发表在前
      limit: pageSize,
      offset: offset,
      attributes: {
        exclude: ['userId'] // 排除敏感字段
      }
    });

    // 计算分页信息
    const totalPages = Math.ceil(totalArticles / pageSize);
    const pagination = {
      currentPage: currentPage,
      pageSize: pageSize,
      totalItems: totalArticles,
      totalPages: totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };

    return res.status(200).json({
      code: 200,
      message: '获取用户发表文章成功',
      data: {
        articles,
        pagination
      }
    });

  } catch (err) {
    console.error('获取用户发表文章失败:', err);
    return res.status(500).json({
      code: 500,
      message: '获取用户发表文章失败，请稍后再试'
    });
  }
};


// 上传文章图片
exports.ArticleUploadService = async (req, res) => {
  try {
    const { id: userId } = req.currentUser; // 获取当前用户ID
    const files = req.files;

    // 验证文件是否上传
    if (!files || files.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请上传文件'
      });
    }

    // 验证用户是否存在（可选，根据业务需求）
    if (!userId) {
      return res.status(401).json({
        code: 401,
        message: '用户未登录'
      });
    }

    // 批量上传到 OSS
    const fileUrls = await uploadMultipleToOSS(files, 'articles');

    return res.status(200).json({
      code: 200,
      message: '上传文章图片成功',
      data: {
        fileUrls,
        uploadCount: files.length
      }
    });

  } catch (err) {
    console.error('上传文章图片失败:', err);
    return res.status(500).json({
      code: 500,
      message: '上传文章图片失败，请稍后再试'
    });
  }
};
