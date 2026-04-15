const { avatar } = require("../../config/config.js")
const sequelize = require("../../database")
const { DataTypes } = require('sequelize')

const Admin = sequelize.define('Admin', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  account: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: "账号名，唯一值"
  },
  password: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: avatar
  },
  loginState: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
  },
  sex: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: "admin"
  }
}, {
  timestamps: true,
  paranoid: true
})

module.exports = Admin