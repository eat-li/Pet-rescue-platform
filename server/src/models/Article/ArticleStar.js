const sequelize = require("../../database");
const { DataTypes } = require('sequelize');
const User = require("../User/User");
const Article = require("./Article");

const ArticleLike = sequelize.define('article_like', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  timestamps: true,
  freezeTableName: true, // 冻结表名，避免自动复数化
  indexes: [
    {
      unique: true,
      fields: ['userId', 'articleId'] // 关键：限制一个用户只能给同一帖子点赞一次
    }
  ]
});

// 关联用户（谁点的赞）
User.hasMany(ArticleLike, { foreignKey: 'userId', as: 'article_likes' });
ArticleLike.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// 关联帖子（给哪篇帖子点赞）
Article.hasMany(ArticleLike, { foreignKey: 'articleId', as: 'likes' });
ArticleLike.belongsTo(Article, { foreignKey: 'articleId', as: 'article' });

module.exports = ArticleLike;