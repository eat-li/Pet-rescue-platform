const sequelize = require('../../database/index')
const { DataTypes } = require('sequelize')
const User = require('../User/User')
const PetServiceOrder = require('./PetServiceOrder')

/**
 * 购物车条目
 * 用户将服务加入购物车，等待统一预约
 */
const CartItem = sequelize.define('cart_item', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  // 宠物体重（影响最终价格）
  petWeight: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true,
    comment: '宠物体重 (kg)，用于价格参考'
  },
  // 备注
  notes: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '备注'
  },
  // 是否被选中（结算时使用）
  selected: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    comment: '是否选中'
  }
}, {
  timestamps: true
})

// ── 关联关系 ───────────────────────────────────────────────

// 用户 → 购物车条目 (1:N)
User.hasMany(CartItem, { foreignKey: 'userId', as: 'cart_items' })
CartItem.belongsTo(User, { foreignKey: 'userId', as: 'user' })

// 宠物服务 → 购物车条目 (1:N)
PetServiceOrder.hasMany(CartItem, { foreignKey: 'serviceId', as: 'cart_items' })
CartItem.belongsTo(PetServiceOrder, { foreignKey: 'serviceId', as: 'service' })

// CartItem.sync({ alter: true }).then(() => console.log('cart_item 表同步成功'))

module.exports = CartItem
