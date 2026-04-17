const Notice = require("../models/Admin/Notice")
const {Op} = require("sequelize")
const { uploadToOSS } = require('../utils/ossUpload')

// 创建公告
exports.NoticeCreateService = async (req, res) => {
  try {
    // 权限验证：只有管理员可以创建公告
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可创建公告'
      });
    }

    // 提取请求数据
    const {title, content, cover = ''} = req.body;
    const adminId = req.currentUser.id; // 从中间件获取当前管理员ID

    // 数据验证
    if (!title || !content) {
      return res.status(400).json({
        code: 400,
        message: '缺少必填字段：标题和内容为必填项'
      });
    }

    // 标题长度限制（根据实际需求调整）
    if (title.length > 100) {
      return res.status(400).json({
        code: 400,
        message: '标题长度不能超过100个字符'
      });
    }

    // 创建公告
    const newNotice = await Notice.create({
      title,
      content,
      cover,
      adminId // 记录创建者ID（需要在Notice模型中添加adminId字段）
    });

    // 返回创建结果
    return res.status(201).json({
      code: 201,
      message: '公告创建成功',
      data: newNotice
    });

  } catch (err) {
    console.error('创建公告失败：', err);
    return res.status(500).json({
      code: 500,
      message: '服务器错误，公告创建失败'
    });
  }
};


// 获取公告列表
exports.NoticeListService = async (req, res) => {
  try {
    // 从查询参数获取分页信息，默认第一页，每页10条
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const search = req.query.search || ''
    const status = req.query.status

    // 验证分页参数有效性
    const currentPage = page
    const pageSize = limit

    if (isNaN(currentPage) || isNaN(pageSize) || currentPage < 1 || pageSize < 1) {
      return res.status(400).json({
        code: 400,
        message: '无效的分页参数，page和limit必须为正整数'
      });
    }
    // 创建搜索条件
    let whereCondition = {}
    
    // 状态过滤（前台用户只显示启用的公告）
    if (status === 'true' || status === 'false') {
      whereCondition.status = status === 'true'
    }
    
    // 搜索条件
    if (search) {
      const searchCondition = {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } },
          { content: { [Op.like]: `%${search}%` } }
        ]
      };
      
      if (Object.keys(whereCondition).length > 0) {
        whereCondition = {
          [Op.and]: [whereCondition, searchCondition]
        }
      } else {
        whereCondition = searchCondition
      }
    }

    // 计算偏移量
    const offset = (currentPage - 1) * pageSize;

    // 查询公告列表并计算总数（按创建时间倒序，最新的在前）
    const {count, rows: notices} = await Notice.findAndCountAll({
      where: whereCondition,
      order: [['createdAt', 'DESC']],
      limit: pageSize,
      offset: offset
    });

    // 计算分页信息
    const totalPages = Math.ceil(count / pageSize);

    // 构建分页对象
    const pagination = {
      currentPage: currentPage,
      pageSize: pageSize,
      totalItems: count,
      totalPages: totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };

    // 返回结果
    return res.status(200).json({
      code: 200,
      message: '公告列表获取成功',
      data: {
        notices,
        pagination
      }
    });

  } catch (err) {
    console.error('获取公告列表失败：', err);
    return res.status(500).json({
      code: 500,
      message: '服务器错误，获取公告列表失败'
    });
  }
};


// 删除公告（管理员）
exports.NoticeDeleteService = async (req, res) => {
  try {
    // 1. 权限验证：仅管理员可删除公告
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可删除公告'
      });
    }

    // 2. 获取公告ID
    const {id} = req.params;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '缺少公告ID'
      });
    }

    // 3. 查找公告是否存在
    const notice = await Notice.findByPk(id);
    if (!notice) {
      return res.status(404).json({
        code: 404,
        message: '公告不存在或已被删除'
      });
    }

    // 4. 执行删除操作
    await notice.destroy();

    // 5. 返回成功响应
    return res.status(200).json({
      code: 200,
      message: '公告删除成功'
    });

  } catch (err) {
    console.error('删除公告失败：', err);
    return res.status(500).json({
      code: 500,
      message: '服务器错误，删除公告失败'
    });
  }
}


// 批量删除公告
exports.NoticeBatchDeleteService = async (req, res) => {
  try {
    const role = req.role
    const {ids} = req.body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '请选择要删除的公告'
      });
    }
    if (role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可删除公告'
      });
    }
    const validIds = ids.filter(id => id && !isNaN(id))
    if (validIds.length !== ids.length) {
      return res.status(400).json({
        code: 400,
        message: '存在无效的用户ID'
      })
    }
    const result = await Notice.destroy({
      where: {
        id: {
          [Op.in]: validIds
        }
      }
    });
    if (result === 0) {
      return res.status(404).json({
        code: 404,
        message: '公告不存在或已被删除'
      });
    }

    return res.status(200).json({
      code: 200,
      message: `成功删除 ${result} 个公告`,
      deletedCount: result
    })
  } catch (err) {
    console.error('批量删除公告失败：', err);
    return res.status(500).json({
      code: 500,
      message: '服务器错误，批量删除公告失败'
    });
  }
}

// 获取公告详情
exports.NoticeDetailService = async (req, res) => {
  try {
    // 1. 获取公告ID
    const {id} = req.params;
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '缺少公告ID'
      });
    }

    // 2. 查询公告详情
    const notice = await Notice.findByPk(id);
    if (!notice) {
      return res.status(404).json({
        code: 404,
        message: '公告不存在或已被删除'
      });
    }

    // 3. 返回公告详情
    return res.status(200).json({
      code: 200,
      message: '公告详情获取成功',
      data: notice
    });

  } catch (err) {
    console.error('获取公告详情失败：', err);
    return res.status(500).json({
      code: 500,
      message: '服务器错误，获取公告详情失败'
    });
  }

}
// 更新公告状态
exports.NoticeStatusUpdateService = async (req, res) => {
  try {
    const role = req.role
    const {id} = req.params
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '缺少公告ID'
      });
    }
    if (role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可更新公告状态'
      });
    }
    const {status} = req.body
    if (!status) {
      return res.status(400).json({
        code: 400,
        message: '缺少状态参数'
      });
    }

    if (status !== 'true' && status !== 'false') {
      return res.status(400).json({
        code: 400,
        message: '状态参数错误'
      });
    }
    const notice = await Notice.findByPk(id)
    if (!notice) {
      return res.status(404).json({
        code: 404,
        message: '公告不存在或已被删除'
      });
    }
    notice.status = status
    await notice.save()
    return res.status(200).json({
      code: 200,
      message: '公告状态更新成功'
    });
  } catch (err) {
    console.error('更新公告状态失败：', err);
    return res.status(500).json({
      code: 500,
      message: '服务器错误，更新公告状态失败'
    });
  }
}


// 更新公告（管理员）
exports.NoticeUpdateService = async (req, res) => {
  try {
    // 1. 权限验证：仅管理员可更新公告
    if (req.role !== 'admin') {
      return res.status(403).json({
        code: 403,
        message: '权限不足，仅管理员可更新公告'
      });
    }

    // 2. 获取公告ID和更新数据
    const {id} = req.params;
    const {title, content, cover} = req.body;

    // 3. 验证必要参数
    if (!id) {
      return res.status(400).json({
        code: 400,
        message: '缺少公告ID'
      });
    }

    if (!title || !content) {
      return res.status(400).json({
        code: 400,
        message: '标题和内容为必填项'
      });
    }

    // 4. 验证公告是否存在
    const notice = await Notice.findByPk(id);
    if (!notice) {
      return res.status(404).json({
        code: 404,
        message: '公告不存在或已被删除'
      });
    }

    // 5. 验证数据格式
    if (title.length > 100) {
      return res.status(400).json({
        code: 400,
        message: '标题长度不能超过100个字符'
      });
    }

    // 6. 执行更新操作
    await notice.update({
      title,
      content,
      // 只有提供了封面参数时才更新，避免覆盖现有封面
      ...(cover !== undefined && {cover})
    });

    // 7. 返回更新后的公告详情
    return res.status(200).json({
      code: 200,
      message: '公告更新成功',
      data: notice
    });

  } catch (err) {
    console.error('更新公告失败：', err);
    return res.status(500).json({
      code: 500,
      message: '服务器错误，更新公告失败'
    });
  }
}

// 上传公告图片
exports.NoticeUploadService = async (req, res) => {
  try {
    const file = req.file

    if (!file) {
      return res.status(400).json({
        code: 400,
        message: '请上传文件'
      })
    }

    // 上传到 OSS
    const fileUrl = await uploadToOSS(file.buffer, file.originalname, 'notices')

    return res.status(200).json({
      code: 200,
      message: '上传图片成功',
      data: { fileUrl }
    })

  } catch (error) {
    console.error('上传公告图片失败:', error)
    return res.status(500).json({
      code: 500,
      message: '上传失败，请稍后再试'
    })
  }
}
