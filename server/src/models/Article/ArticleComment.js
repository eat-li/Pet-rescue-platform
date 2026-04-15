const sequelize = require("../../database");
const { DataTypes } = require('sequelize');
const User = require("../User/User");
const Article = require("./Article");

const ArticleComment = sequelize.define('article_comment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '评论内容'
  },
  // 可选：若支持评论回复，可添加parentId（指向父评论ID）
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '父评论ID（用于回复功能）'
  },
  // 评论状态
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '评论状态（正常/已删除）'
  },
}, {
  timestamps: true,
  freezeTableName: true
});

// 关联用户（谁评论的）
User.hasMany(ArticleComment, { foreignKey: 'userId', as: 'article_comments' });
ArticleComment.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 关联帖子（评论的哪篇帖子）
Article.hasMany(ArticleComment, { foreignKey: 'articleId', as: 'comments' });
ArticleComment.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });

// ArticleComment.sync({
//   alter: true

// }).then(res => {
//   console.log("评论表同步成功")

// })

module.exports = ArticleComment;