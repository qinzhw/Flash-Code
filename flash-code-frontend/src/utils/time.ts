/**
 * 时间格式化工具
 */

const pad = (value: number) => String(value).padStart(2, '0')

/**
 * 将时间格式化为 YYYY-MM-DD HH:mm:ss
 */
export const formatDateTime = (time?: string): string => {
  if (!time) {
    return '-'
  }
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
