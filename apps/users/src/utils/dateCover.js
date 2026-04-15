const convertToChinaLocalDate = (isoTime) => {
  // 创建Date对象
  const date = new Date(isoTime);

  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    throw new Error("无效的时间格式");
  }

  // 转换为中国时区（UTC+8）
  const chinaTime = new Date(date.getTime() + 8 * 60 * 60 * 1000);

  // 获取各个时间组件
  const year = chinaTime.getUTCFullYear();
  const month = chinaTime.getUTCMonth() + 1; // 月份从0开始，需+1
  const day = chinaTime.getUTCDate();
  const hours = chinaTime.getUTCHours();
  const minutes = chinaTime.getUTCMinutes();
  const seconds = chinaTime.getUTCSeconds();

  // 补零处理，确保为两位数
  const formattedMonth = String(month).padStart(2, '0');
  const formattedDay = String(day).padStart(2, '0');
  const formattedHours = String(hours).padStart(2, '0');
  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(seconds).padStart(2, '0');

  // 返回格式化后的日期时间字符串（精确到秒）
  return `${year}-${formattedMonth}-${formattedDay} ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export default convertToChinaLocalDate