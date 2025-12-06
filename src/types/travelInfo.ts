/**
 * 旅遊資訊資料型別
 * 對應 Google Sheet「旅遊資訊」工作表（GID 1）
 */

/**
 * 旅遊資訊集合
 */
export interface TravelInfo {
  /** 所有資訊項目 */
  items: InfoItem[]

  /** 最後更新時間 */
  lastUpdated: Date

  /**
   * 計算屬性：所有類別清單
   * 邏輯：[...new Set(items.map(i => i.category).filter(Boolean))]
   */
  categories: string[]

  /**
   * 計算屬性：已打包項目數（category="打包清單"且isPacked=true）
   * 邏輯：items.filter(i => i.category === '打包清單' && i.isPacked).length
   */
  packedCount: number
}

/**
 * 旅遊資訊項目
 */
export interface InfoItem {
  /** 唯一識別碼（UUID v4） */
  id: string

  /** 標題（必填） */
  title: string

  /**
   * 類別（必填）
   * 常見值："住宿"、"交通票券"、"打包清單"、"緊急聯絡"、"注意事項"
   */
  category: string

  /** 內容說明（選填） */
  content?: string

  /**
   * 是否已打包（僅 category="打包清單"適用，LocalStorage 狀態）
   * 預設 false
   */
  isPacked?: boolean

  /** 數量（選填，用於打包清單） */
  amount?: number

  /** 聯絡人姓名（選填，用於緊急聯絡） */
  contactName?: string

  /** 電話號碼（選填，用於緊急聯絡） */
  phone?: string

  /** 地址（選填，用於住宿） */
  address?: string

  /** 連結（選填，多個連結以逗號分隔） */
  links?: string

  /** 備註（選填） */
  notes?: string

  /**
   * 計算屬性：連結陣列
   * 邏輯：links?.split(',').map(l => l.trim()).filter(Boolean) || []
   */
  linkList: string[]
}

/**
 * 計算連結陣列
 * @param item - 資訊項目
 * @returns 連結陣列
 */
export function computeLinkList(item: InfoItem): string[] {
  if (!item.links) return []
  return item.links
    .split(',')
    .map((link) => link.trim())
    .filter((link) => link.length > 0)
}

/**
 * 預設旅遊資訊
 */
export const defaultTravelInfo: TravelInfo = {
  items: [],
  lastUpdated: new Date(),
  categories: [],
  packedCount: 0,
}

/**
 * LocalStorage 打包狀態型別
 */
export type PackedItems = Record<string, boolean>
