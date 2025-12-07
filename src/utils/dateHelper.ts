/**
 * 日期處理工具函數
 */

/**
 * 格式化日期為 YYYY-MM-DD
 * @param date - Date 物件或 ISO 字串
 * @returns YYYY-MM-DD 字串
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date

  if (isNaN(d.getTime())) {
    throw new Error(`無效的日期：${date}`)
  }

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

/**
 * 解析日期字串為 Date 物件
 * @param dateStr - YYYY-MM-DD 字串
 * @returns Date 物件
 * @throws Error 若格式錯誤
 */
export function parseDate(dateStr: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error(`日期格式錯誤（需為 YYYY-MM-DD）：${dateStr}`)
  }

  const date = new Date(dateStr)

  if (isNaN(date.getTime())) {
    throw new Error(`無效的日期：${dateStr}`)
  }

  return date
}

/**
 * 計算兩個日期之間的天數差
 * @param date1 - 第一個日期
 * @param date2 - 第二個日期
 * @returns 天數差（date2 - date1，可為負數）
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? parseDate(date1) : date1
  const d2 = typeof date2 === 'string' ? parseDate(date2) : date2

  const diffTime = d2.getTime() - d1.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * 取得今天的日期（YYYY-MM-DD）
 * @returns 今天的日期字串
 */
export function getToday(): string {
  return formatDate(new Date())
}
