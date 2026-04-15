exports.setAvatarDir = (dir) => {
  return (req, res, next) => {
    const { id } = req.params
    req.uploadDir = `${dir}/${id}`
    next()
  }
}
// 文章上传目录
exports.setArticleDir = (dir) => {
  return (req, res, next) => {
    req.uploadDir = dir
    next()
  }
}
// 宠物上传目录
exports.setPetDir = (dir) => {
  return (req, res, next) => {
    req.uploadDir = dir
    next()
  }
}

// 领养上传目录
exports.setAdoptionDir = (dir) => {
  return (req, res, next) => {
    req.uploadDir = dir
    next()
  }
}

// 公告上传目录
exports.setNoticeDir = (dir) => {
  return (req, res, next) => {
    req.uploadDir = dir
    next()
  }
}

// 服务上传目录
exports.setServiceDir = (dir) => {
  return (req, res, next) => {
    req.uploadDir = dir
    next()
  }
}