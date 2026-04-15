const sequelize = require('../../database/index')
const { DataTypes } = require('sequelize')
const User = require('../User/User')
const PetServiceOrder = require('./PetServiceOrder')
const MyPet = require('../User/MyPet')

/**
 * 宠物服务预约订单
 * 用户对某项服务进行预约
 */
const ServiceBooking = sequelize.define('service_booking', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 预约日期
  appointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    comment: '预约日期 (YYYY-MM-DD)'
  },
  // 预约时间段
  appointmentTime: {
    type: DataTypes.STRING(20),
    allowNull: false,
    comment: '预约时间段，如 09:00-10:00'
  },
  // 宠物名称（允许手动填写，不强制绑定系统宠物）
  petName: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '宠物名称'
  },
  // 宠物体重（kg），影响服务定价
  petWeight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    comment: '宠物体重 (kg)'
  },
  // 联系方式
  contact: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '联系电话'
  },
  // 订单总价（快照，不随服务价格变动）
  total_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '预约总价（价格快照）'
  },
  // 备注
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '用户备注'
  },
  // 订单状态
  status: {
    type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending',
    comment: '状态：pending(待确认)、confirmed(已确认)、completed(已完成)、cancelled(已取消)'
  },
  // 取消原因
  cancelReason: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '取消原因'
  }
}, {
  timestamps: true
})

// ── 关联关系 ───────────────────────────────────────────────

// 用户 → 预约订单 (1:N)
User.hasMany(ServiceBooking, { foreignKey: 'userId', as: 'service_bookings' })
ServiceBooking.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// 宠物服务 → 预约订单 (1:N)
PetServiceOrder.hasMany(ServiceBooking, { foreignKey: 'serviceId', as: 'bookings' })
ServiceBooking.belongsTo(PetServiceOrder, { foreignKey: 'serviceId', as: 'service' })

// 宠物（可选关联，用户可不绑定系统宠物）
MyPet.hasMany(ServiceBooking, { foreignKey: 'petId', as: 'service_bookings' })
ServiceBooking.belongsTo(MyPet, { foreignKey: 'petId', as: 'pet' })

// ServiceBooking.sync({ alter: true }).then(() => console.log('service_booking 表同步成功'))

module.exports = ServiceBooking
