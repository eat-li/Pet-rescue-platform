const sequelize = require("../../database")
const { DataTypes } = require('sequelize')
const Pet = require("../User/MyPet")
const User = require("../User/User")


const Adoption = sequelize.define('adoption', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fee: {
    // 无偿，有偿，面议
    type: DataTypes.ENUM('free', 'paid', 'negotiable'),
    allowNull: false,
    comment: '类型：free(无偿)、paid(有偿)、negotiable(面议)'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    comment: '状态：pending(待处理)、approved(同意)、rejected(拒绝)'
  },
  request: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '领养要求'
  },
  other_msg: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '其他信息'
  },
  money: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: '金额'
  }
}, {
  timestamps: true
})

Adoption.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(Adoption, { foreignKey: 'userId', as: 'adoptions' });

Adoption.belongsTo(Pet, { foreignKey: 'petId', as: 'pet' });
Pet.hasMany(Adoption, { foreignKey: 'petId', as: 'adoptions' });

// Adoption.sync({ force: true })


module.exports = Adoption