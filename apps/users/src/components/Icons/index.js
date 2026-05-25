// 统一图标组件库
// 用于替换emoji，提供一致的SVG图标

import { h } from 'vue'

// 图标基础组件
const createIcon = (name, pathData, viewBox = '0 0 24 24') => {
  return {
    name,
    props: {
      size: { type: [Number, String], default: 24 },
      color: { type: String, default: 'currentColor' },
      class: { type: String, default: '' }
    },
    setup(props) {
      return () => h('svg', {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox,
        width: props.size,
        height: props.size,
        fill: props.color,
        class: props.class
      }, Array.isArray(pathData)
        ? pathData.map(d => h('path', { d }))
        : [h('path', { d: pathData })]
      )
    }
  }
}

// 爪印图标 🐾
export const PawIcon = createIcon('PawIcon', [
  'M12 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  'M7 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  'M17 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
  'M8.5 4C7.12 4 6 5.12 6 6.5S7.12 9 8.5 9 11 7.88 11 6.5 9.88 4 8.5 4z',
  'M15.5 4C14.12 4 13 5.12 13 6.5S14.12 9 15.5 9 18 7.88 18 6.5 16.88 4 15.5 4z',
  'M12 16c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
])

// 心形图标 ❤️
export const HeartIcon = createIcon('HeartIcon',
  'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
)

// 星形图标 ⭐
export const StarIcon = createIcon('StarIcon',
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
)

// 火焰图标 🔥
export const FireIcon = createIcon('FireIcon',
  'M13.5.67s.74 2.65.74 4.8c0 2.06-1.35 3.73-3.41 3.73-2.07 0-3.63-1.67-3.63-3.73l.03-.36C5.21 7.51 4 10.62 4 14c0 4.42 3.58 8 8 8s8-3.58 8-8C20 8.61 17.41 3.8 13.5.67zM11.71 19c-1.78 0-3.22-1.4-3.22-3.14 0-1.62 1.05-2.76 2.81-3.12 1.77-.36 3.6-1.21 4.62-2.58.39 1.29.59 2.65.59 4.04 0 2.65-2.15 4.8-4.8 4.8z'
)

// 图表图标 📊
export const ChartIcon = createIcon('ChartIcon',
  'M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z'
)

// 用户图标 👥
export const UsersIcon = createIcon('UsersIcon',
  'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z'
)

// 医院图标 🏥
export const HospitalIcon = createIcon('HospitalIcon',
  'M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z'
)

// 书本图标 📖
export const BookIcon = createIcon('BookIcon',
  'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z'
)

// 铃铛图标 🔔
export const BellIcon = createIcon('BellIcon',
  'M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z'
)

// 首页图标 🏠
export const HomeIcon = createIcon('HomeIcon',
  'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z'
)

// 用户单人图标 👤
export const UserIcon = createIcon('UserIcon',
  'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
)

// 男性图标 ♂
export const MaleIcon = createIcon('MaleIcon',
  'M16 2v6h-2V4.41L9.41 9H11v2H6V6H4v6h2v-2h2.59L4 14.59 5.41 16 10 11.41V14h2v-5h-2l4.59-4.59L16 2z', '0 0 20 20'
)

// 女性图标 ♀
export const FemaleIcon = createIcon('FemaleIcon',
  'M12 2C9.24 2 7 4.24 7 7c0 2.85 2.92 7.21 5 9.88 2.11-2.69 5-7 5-9.88 0-2.76-2.24-5-5-5zm0 7c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm-1 3v6h2v-6h-2z', '0 0 20 20'
)

// 注射器图标 💉
export const SyringeIcon = createIcon('SyringeIcon',
  'M11.5 2L10 3.5 14.5 8 16 6.5 11.5 2zM6 11.5L1.5 16 3 17.5 7.5 13 6 11.5zM17 7l-1.5-1.5-5 5L12 12l5-5zM8 14l-4 4 1 1 4-4-1-1z', '0 0 20 20'
)

// 位置图标 📍
export const LocationIcon = createIcon('LocationIcon',
  'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
)

// 购物车图标 🛒
export const CartIcon = createIcon('CartIcon',
  'M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z'
)

// 洗澡图标 🛁
export const BathIcon = createIcon('BathIcon',
  'M7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm11 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-2 4H6v4c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2v-4z', '0 0 24 24'
)

// 剪刀图标 ✂️
export const ScissorsIcon = createIcon('ScissorsIcon',
  'M9.64 7.64c.23-.5.36-1.05.36-1.64 0-2.21-1.79-4-4-4S2 3.79 2 6s1.79 4 4 4c.59 0 1.14-.13 1.64-.36L10 12l-2.36 2.36C7.14 14.13 6.59 14 6 14c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4c0-.59-.13-1.14-.36-1.64L12 14l7 7h3v-1L9.64 7.64zM6 8c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm0 12c-1.1 0-2-.89-2-2s.9-2 2-2 2 .89 2 2-.9 2-2 2zm6-7.5c-.28 0-.5-.22-.5-.5s.22-.5.5-.5.5.22.5.5-.22.5-.5.5zM19 3l-6 6 2 2 7-7V3h-3z'
)

// 药丸图标 💊
export const PillIcon = createIcon('PillIcon',
  'M4.22 11.29l5.07-5.07a6 6 0 018.48 8.48l-5.07 5.07a6 6 0 01-8.48-8.48zm4.24-1.41a4 4 0 105.66 5.66l.71-.71-5.66-5.66-.71.71z'
)

// 球图标 🎾
export const BallIcon = createIcon('BallIcon',
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z'
)

// 喇叭图标 📢
export const MegaphoneIcon = createIcon('MegaphoneIcon',
  'M18 11v2h4v-2h-4zm-2 6.61c.96.71 2.21 1.65 3.2 2.39.4-.53.8-1.07 1.2-1.6-.99-.74-2.24-1.68-3.2-2.4-.4.54-.8 1.08-1.2 1.61zM20.4 5.6c-.4-.53-.8-1.07-1.2-1.6-.99.74-2.24 1.68-3.2 2.4.4.53.8 1.07 1.2 1.6.96-.72 2.21-1.65 3.2-2.4zM4 9v6h4l5 5V4L8 9H4z'
)

// 评论图标 💬
export const CommentIcon = createIcon('CommentIcon',
  'M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z'
)

// 收藏图标
export const CollectionIcon = createIcon('CollectionIcon',
  'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z'
)

// 日历图标 📅
export const CalendarIcon = createIcon('CalendarIcon',
  'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM9 10H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z'
)

// 删除图标 🗑️
export const TrashIcon = createIcon('TrashIcon',
  'M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z'
)

// 时钟图标 🕐
export const ClockIcon = createIcon('ClockIcon',
  'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z'
)

// 勾选图标 ✅
export const CheckIcon = createIcon('CheckIcon',
  'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z'
)

// 关闭图标 ❌
export const CloseIcon = createIcon('CloseIcon',
  'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z'
)

// 刷新图标 🔄
export const RefreshIcon = createIcon('RefreshIcon',
  'M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z'
)

// 相机图标 📷
export const CameraIcon = createIcon('CameraIcon',
  'M12 15.2c1.77 0 3.2-1.43 3.2-3.2 0-1.77-1.43-3.2-3.2-3.2-1.77 0-3.2 1.43-3.2 3.2 0 1.77 1.43 3.2 3.2 3.2zM9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9zm3 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z'
)

// 礼物图标 🎁
export const GiftIcon = createIcon('GiftIcon',
  'M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16v2zm0-5H4V8h5.08L7 10.83 8.62 12 11 8.76l1-1.36 1 1.36L15.38 12 17 10.83 14.92 8H20v6z'
)

// 金钱图标 💰
export const MoneyIcon = createIcon('MoneyIcon',
  'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z'
)

// 握手图标 🤝
export const HandshakeIcon = createIcon('HandshakeIcon',
  'M12.22 19.85c-.18.18-.5.29-.71.29-.21 0-.53-.11-.71-.29l-5.07-5.07c-.37-.37-.37-.97 0-1.34l1.34-1.34c.37-.37.97-.37 1.34 0l3.02 3.02 7.07-7.07c.37-.37.97-.37 1.34 0l1.34 1.34c.37.37.37.97 0 1.34l-8.96 8.86z'
)

// 警告图标 ⚠️
export const WarningIcon = createIcon('WarningIcon',
  'M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z'
)

// 电话图标 📞
export const PhoneIcon = createIcon('PhoneIcon',
  'M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'
)

// 邮件图标 💌
export const MailIcon = createIcon('MailIcon',
  'M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'
)

// 游戏图标 🎮
export const GameIcon = createIcon('GameIcon',
  'M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z'
)

// 剪贴板图标 📋
export const ClipboardIcon = createIcon('ClipboardIcon',
  'M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z'
)

// 派对图标 🎉
export const PartyIcon = createIcon('PartyIcon',
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
)

// 成功图标 🟢
export const SuccessIcon = createIcon('SuccessIcon',
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z'
)

// 错误图标 🔴
export const ErrorIcon = createIcon('ErrorIcon',
  'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z'
)

// 闪光图标 ✨
export const SparkleIcon = createIcon('SparkleIcon',
  'M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z'
)

// 导出所有图标
export default {
  PawIcon,
  HeartIcon,
  StarIcon,
  FireIcon,
  ChartIcon,
  UsersIcon,
  HospitalIcon,
  BookIcon,
  BellIcon,
  HomeIcon,
  UserIcon,
  MaleIcon,
  FemaleIcon,
  SyringeIcon,
  LocationIcon,
  CartIcon,
  BathIcon,
  ScissorsIcon,
  PillIcon,
  BallIcon,
  MegaphoneIcon,
  CommentIcon,
  CollectionIcon,
  CalendarIcon,
  TrashIcon,
  ClockIcon,
  CheckIcon,
  CloseIcon,
  RefreshIcon,
  CameraIcon,
  GiftIcon,
  MoneyIcon,
  HandshakeIcon,
  WarningIcon,
  PhoneIcon,
  MailIcon,
  GameIcon,
  ClipboardIcon,
  PartyIcon,
  SuccessIcon,
  ErrorIcon,
  SparkleIcon
}
