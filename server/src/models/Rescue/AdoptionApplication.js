const sequelize = require("../../database")
const { DataTypes } = require('sequelize')
const Adoption = require("./Adoption")
const User = require("../User/User")

const AdoptionApplication = sequelize.define('adoption_application', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '申请人姓名'
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '联系方式'
  },
  experience: {
    type: DataTypes.ENUM('none', 'little', 'some', 'rich'),
    allowNull: true,
    comment: '养宠经验：none无经验，little少量，some有经验，rich丰富'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '申请理由'
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '状态：pending待处理，approved已通过，rejected已拒绝'
  }
}, {
  timestamps: true
})

AdoptionApplication.belongsTo(Adoption, { foreignKey: 'adoptionId', as: 'adoption' })
Adoption.hasMany(AdoptionApplication, { foreignKey: 'adoptionId', as: 'applications' })

AdoptionApplication.belongsTo(User, { foreignKey: 'applicantId', as: 'applicant' })
User.hasMany(AdoptionApplication, { foreignKey: 'applicantId', as: 'adoptionApplications' })

module.exports = AdoptionApplication
