const sequelize = require("../../database");
const {DataTypes} = require('sequelize');
const User = require("../User/User");
const Article = require("./Article");

const ArticleCollection = sequelize.define('article_collection', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}, {
  timestamps: true,
  freezeTableName: true,
  indexes: [
    {
      unique: true,
      fields: ['userId', 'articleId'] // 限制一个用户只能收藏同一帖子一次
    }
  ]
});

// 关联用户（谁收藏的）
User.hasMany(ArticleCollection, {foreignKey: 'userId', as: 'article_collections'});
ArticleCollection.belongsTo(User, {foreignKey: 'userId', as: 'user'});

// 关联帖子（收藏的哪篇帖子）
Article.hasMany(ArticleCollection, {foreignKey: 'articleId', as: 'collections'});
ArticleCollection.belongsTo(Article, {foreignKey: 'articleId', as: 'article'});

module.exports = ArticleCollection;