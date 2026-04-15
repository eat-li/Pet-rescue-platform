const sequelize = require("../../database")
const { DataTypes } = require('sequelize')
const { avatar } = require("../../config/config.js")


const User = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  phone: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  nickname: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: '普通用户',
    comment: '昵称'
  },
  avatar: {
    type: DataTypes.STRING(150),
    allowNull: false,
    defaultValue: avatar,
    comment: '头像'
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '账号状态 1 正常 0 禁用'
  },
  sex: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  balance: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '用户余额（元）'
  }
}, {
  timestamps: true,
})

// User.sync({
//   alter: true
// }).then( res=>{
//   console.log('User表创建成功')
// })

module.exports = User