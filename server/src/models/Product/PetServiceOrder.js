const sequelize = require("../../database/index")
const {DataTypes} = require("sequelize")

const PetServiceOrder = sequelize.define("PetServiceOrder", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
  // 服务名称（如“基础洗澡护理”“全身美容造型”）
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '服务名称'
  },
  type: {
    type: DataTypes.ENUM(
      'basic_care',
      'beauty_styling',
      'health_medical',
      'training_service',
      'special_experience'
    ),
    allowNull: false,
    comment: '服务类型：basic_care(基础护理)、beauty_styling(美容造型)、health_medical(健康医疗)、training_service(训练服务)、special_experience(特色体验)'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2), // 金额, 精确到分
    allowNull: false,
    comment: '价格'
  },
  weight:{
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: '体重'
  },
  status: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    comment: "0 下架 1 上架"
  },
  content:{
      type: DataTypes.TEXT,
      allowNull: false,
      comment: '内容'
  },
  image:{
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: '服务图片URL'
  }
},{
  timestamps: true
})

module.exports = PetServiceOrder