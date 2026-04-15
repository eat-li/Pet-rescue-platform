const sequelize = require("../../database")
const {DataTypes} = require('sequelize')
const User = require("../User/User.js")

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('pet_daily', 'help_question', 'experience_share'),
    allowNull: false,
    defaultValue: 'pet_daily',
    comment: '内容类型：pet_daily(萌宠日常)、help_question(求助提问)、experience_share(经验分享)'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  images:{
    type: DataTypes.JSON,
    allowNull: true,
    comment: '图片列表'
  },
  tag:{
    type:DataTypes.JSON,
    allowNull: true,
    comment: '帖子标签'
  },
  status:{
    type:DataTypes.BOOLEAN,
    allowNull: false,
    comment: '帖子状态：0(待审核)、1(审核通过)'
  },
  star:{
    type:DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '帖子点赞数'
  },
  comment:{
    type:DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '帖子评论数'
  },
  collection:{
    type:DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    comment: '帖子收藏数'
  }
}, {
  timestamps: true,
  paranoid: true,
})

User.hasMany(Article, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  as: 'articles'
})
Article.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
})

module.exports = Article