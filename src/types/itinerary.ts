/**
 * 行程資料型別
 * 對應 Google Sheet「行程」工作表（GID 0）
 */

/**
 * 單日行程
 */
export interface ItineraryDay {
  /** 日期（YYYY-MM-DD 格式） */
  date: string

  /** 該日所有行程項目 */
  items: ItineraryItem[]

  /**
   * 該日備註（選填）
   * 範例："自由活動日"、"早班飛機，提早出發"
   */
  notes?: string

  /**
   * 計算屬性：該日總花費
   * 邏輯：items.reduce((sum, item) => sum + (item.cost || 0), 0)
   */
  totalCost: number

  /**
   * 計算屬性：該日已完成項目數
   * 邏輯：items.filter(item => item.isCompleted).length
   */
  completedCount: number
}

/**
 * 行程項目
 */
export interface ItineraryItem {
  /** 唯一識別碼（UUID v4） */
  id: string

  /** 日期（YYYY-MM-DD 格式） */
  date: string

  /** 標題（必填） */
  title: string

  /**
   * 類別（選填）
   * 常見值："交通"、"景點"、"美食"、"住宿"、"購物"
   */
  category?: string

  /**
   * 時間（選填，HH:mm 格式）
   * 範例："09:30"、"14:00"
   */
  time?: string

  /** 地點名稱（選填） */
  location?: string

  /**
   * Google Maps 連結（選填）
   * 範例："https://maps.google.com/?q=台北101"
   */
  mapLink?: string

  /** 花費（選填，數字，單位：當地貨幣） */
  cost?: number

  /**
   * 幣別（選填）
   * 範例："TWD"、"JPY"、"USD"
   */
  currency?: string

  /** 說明（選填） */
  description?: string

  /**
   * 連結（選填，多個連結以逗號分隔）
   * 範例："https://example.com,https://booking.com/123"
   */
  links?: string

  /**
   * 標籤（選填，多個標籤以逗號分隔）
   * 範例："親子友善,室內,雨天備案"
   */
  tags?: string

  /** 備註（選填） */
  notes?: string

  /**
   * 是否已完成（LocalStorage 狀態）
   * 預設 false
   */
  isCompleted: boolean

  /**
   * 計算屬性：是否為今日行程
   * 邏輯：date === new Date().toISOString().split('T')[0]
   */
  isToday: boolean

  /**
   * 計算屬性：標籤陣列
   * 邏輯：tags?.split(',').map(t => t.trim()).filter(Boolean) || []
   */
  tagList: string[]
}

/**
 * 計算項目是否為今日行程
 * @param item - 行程項目
 * @returns true 若為今日
 */
export function computeIsToday(item: ItineraryItem): boolean {
  const today = new Date().toISOString().split('T')[0]
  return item.date === today
}

/**
 * 計算標籤陣列
 * @param item - 行程項目
 * @returns 標籤陣列
 */
export function computeTagList(item: ItineraryItem): string[] {
  if (!item.tags) return []
  return item.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

/**
 * 預設空白行程日
 */
export const emptyItineraryDay: ItineraryDay = {
  date: new Date().toISOString().split('T')[0],
  items: [],
  notes: undefined,
  totalCost: 0,
  completedCount: 0,
}

/**
 * LocalStorage 完成狀態型別
 */
export type CompletedItems = Record<string, boolean>
