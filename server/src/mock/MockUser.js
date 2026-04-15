const Mock = require("mockjs");
const User = require("../models/User/User.js")
const bcrypt = require('bcryptjs')

// 生成随机手机号
const generatePhone = () => {
  const prefix = ['138', '139', '135', '136', '137', '150', '151', '152', '157', '158', '159', '182', '183', '187', '188', '130', '131', '132', '155', '156', '185', '186']
  const pre = prefix[Math.floor(Math.random() * prefix.length)]
  const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0')
  return pre + suffix
}

// 生成唯一标识
const generateUniqueId = (index) => {
  return Date.now().toString(36) + index.toString(36).padStart(4, '0')
}

// 昵称库
const nicknames = [
  '快乐小猫咪', '阳光大男孩', '温柔小仙女', '帅气小哥哥', '可爱多',
  '星辰大海', '微风轻拂', '雨后彩虹', '蓝天白云', '春暖花开',
  '漫步云端', '浅笑安然', '岁月静好', '时光荏苒', '青春无悔',
  '梦想起航', '勇往直前', '不忘初心', '方得始终', '岁月静好',
  '小幸运', '大梦想家', '追风少年', '踏雪寻梅', '月下独酌',
  '清风明月', '高山流水', '云淡风轻', '花开半夏', '秋水伊人',
  '墨染青衣', '白衣飘飘', '红尘客栈', '江南烟雨', '北国之春',
  '东篱把酒', '西窗剪烛', '南柯一梦', '浮生若梦', '似水流年'
]

// 头像库（使用随机图片服务）
const avatarUrls = [
  'https://api.dicebear.com/7.x/avataaars/svg?seed=',
  'https://api.dicebear.com/7.x/bottts/svg?seed=',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=',
  'https://api.dicebear.com/7.x/notionists/svg?seed='
]

// 生成加密密码（使用与系统一致的加密方式）
const hashPassword = (pwd) => {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(pwd, salt)
}

// 创建50个用户数据
const createMockUsers = async (count = 50) => {
  const users = []
  const usedPhones = new Set()
  const usedEmails = new Set()
  const usedUsernames = new Set()

  for (let i = 0; i < count; i++) {
    const uniqueId = generateUniqueId(i)
    
    // 生成字母数字下划线用户名 (6-16位)
    const generateUsername = () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz0123456789_'
      const firstChar = 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
      const length = 6 + Math.floor(Math.random() * 11) // 6-16位
      let result = firstChar
      for (let j = 1; j < length; j++) {
        result += chars[Math.floor(Math.random() * chars.length)]
      }
      return result
    }
    
    // 确保唯一性
    let username = generateUsername()
    while (usedUsernames.has(username)) {
      username = generateUsername() + Math.floor(Math.random() * 100)
    }
    usedUsernames.add(username)

    let phone = generatePhone()
    while (usedPhones.has(phone)) {
      phone = generatePhone()
    }
    usedPhones.add(phone)

    let email = `${Mock.mock('@string("lower", 6, 12)')}@${Mock.mock('@pick(["qq.com", "163.com", "gmail.com", "outlook.com", "126.com", "sina.com", "sohu.com", "foxmail.com"])')}`
    while (usedEmails.has(email)) {
      email = `${Mock.mock('@string("lower", 8, 15)')}@${Mock.mock('@pick(["qq.com", "163.com", "gmail.com", "outlook.com", "126.com"])')}`
    }
    usedEmails.add(email)

    // 昵称使用中文（任意）
    const nickname = Mock.mock('@cname') + (Math.random() > 0.7 ? Mock.mock('@cword(1,2)') : '')
    const avatarBase = avatarUrls[Math.floor(Math.random() * avatarUrls.length)]
    
    users.push({
      username,
      phone,
      email,
      password: hashPassword('123456'),
      nickname,
      avatar: avatarBase + encodeURIComponent(username),
      status: Math.random() > 0.1, // 90% 概率为正常状态
      sex: Math.random() > 0.5,
      balance: parseFloat((Math.random() * 1000).toFixed(2))
    })
  }

  try {
    // 先清空现有数据（可选，如需保留请注释掉）
    // await User.destroy({ where: {}, truncate: true })
    
    const result = await User.bulkCreate(users)
    console.log(`✅ 成功创建 ${result.length} 个用户数据`)
    console.log('\n📋 用户列表示例（前5个）：')
    result.slice(0, 5).forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.username} | ${u.nickname} | ${u.phone} | 余额: ¥${u.balance}`)
    })
    console.log('\n🔑 所有用户默认密码: 123456')
    return result
  } catch (err) {
    console.error('❌ 创建用户失败:', err.message)
    if (err.name === 'SequelizeUniqueConstraintError') {
      console.log('💡 提示：可能是唯一字段冲突，请清空 User 表后重试')
    }
  }
}

// 执行创建
createMockUsers(50)