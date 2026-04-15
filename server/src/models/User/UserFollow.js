const sequelize = require("../../database/index")
const User = require("./User")
const { DataTypes } = require('sequelize')


const UserFollow = sequelize.define('UserFollow', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  }
}, {
  timestamps: true,
  indexes: [
    // 创建复合唯一索引，确保不能重复关注
    {
      unique: true,
      fields: ['followerId', 'followingId']
    }
  ]
})

// 建立与用户的关联
User.belongsToMany(User, {
  through: UserFollow,
  as: 'followers',  // 粉丝
  foreignKey: 'followingId' // 被关注者ID
})

User.belongsToMany(User, {
  through: UserFollow,
  as: 'followings',  // 关注的人
  foreignKey: 'followerId' // 关注者ID
})

module.exports = UserFollow