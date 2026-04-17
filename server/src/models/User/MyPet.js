const sequelize = require("../../database")
const { DataTypes } = require('sequelize')
const User = require("./User.js")

const MyPet = sequelize.define('Pet', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nickName: {
    type: DataTypes.STRING(30),
    allowNull: false,
    comment: '昵称'
  },
  vaccineStatus: {
    type: DataTypes.ENUM('unvaccinated', 'one_dose', 'two_doses', 'three_doses', 'completed'),
    allowNull: false,
    defaultValue: 'unvaccinated',
    comment: '疫苗接种状态：unvaccinated(未接种)、one_dose(1剂)、two_doses(2剂)、three_doses(3剂),completed(全程完成)'
  },
  sex: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    comment: '宠物性别',
  },
  breed: {
    type: DataTypes.STRING(30),
    allowNull: false,
    comment: '宠物品种'
  },
  type: {
    type: DataTypes.STRING(30),
    allowNull: false,
    comment: '宠物类型'
  },
  birthday: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '出生日期'
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '宠物图片'
  },
  nature: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '宠物性格'
  },
  hobby: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '宠物爱好'
  },
  other_msg: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '其他信息'
  }
})

// 用户能够有多个宠物
User.hasMany(MyPet, {
  foreignKey: 'userId',
  onDelete: 'CASCADE',
  as: 'mypets'
})

// 一个宠物只能属于一个用户
MyPet.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user'
})

module.exports = MyPet