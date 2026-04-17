const sequelize = require("../../database")
const { DataTypes } = require('sequelize')
const Admin = require("./Admin")

const Notice = sequelize.define('Notice', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  cover: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '公告封面'
  },
  status: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否显示'
  }
}, {
  timestamps: true
})

// 一个管理员能发表多个公告
Admin.hasMany(Notice, {
  foreignKey: 'adminId',
  as: 'notices'
})
Notice.belongsTo(Admin, {
  foreignKey: 'adminId',
  as: 'admin'
})
// Notice.sync({alter: true}).then
// ( res=>{
//   console.log('Notice表创建成功')
// })

module.exports = Notice