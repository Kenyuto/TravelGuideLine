/**
 * 購買清單資料型別
 * 對應行程卡片的購買項目管理
 */

/**
 * 購買項目
 */
export interface ShoppingItem {
  /** 唯一識別碼（UUID v4） */
  id: string

  /** 所屬行程項目 ID */
  itineraryItemId: string

  /** 項目名稱（必填） */
  name: string

  /** 完成狀態（已勾選／未勾選） */
  isCompleted: boolean

  /** 備註（選填） */
  note?: string

  /** 數量（選填） */
  quantity?: number

  /** 預估金額（選填） */
  estimatedAmount?: number

  /** 幣別（選填，預設 TWD） */
  currency?: string

  /** 創建使用者（選填） */
  createdBy?: string

  /** 創建時間 */
  createdAt: Date

  /** 最後更新使用者（選填） */
  lastUpdatedBy?: string

  /** 最後更新時間 */
  lastUpdatedAt: Date
}

/**
 * 購買清單
 */
export interface ShoppingList {
  /** 所屬行程項目 ID */
  itineraryItemId: string

  /** 購買項目陣列 */
  items: ShoppingItem[]

  /** 計算屬性：預估總金額 */
  totalEstimatedAmount: number

  /** 計算屬性：已完成項目數 */
  completedCount: number
}

/**
 * 計算預估總金額
 * @param items - 購買項目陣列
 * @returns 預估總金額
 */
export function computeTotalEstimatedAmount(items: ShoppingItem[]): number {
  return items.reduce((sum, item) => sum + (item.estimatedAmount || 0), 0)
}

/**
 * 計算已完成項目數
 * @param items - 購買項目陣列
 * @returns 已完成項目數
 */
export function computeCompletedCount(items: ShoppingItem[]): number {
  return items.filter((item) => item.isCompleted).length
}

/**
 * LocalStorage 購買清單狀態型別
 */
export type ShoppingListState = Record<string, ShoppingItem[]>

/**
 * 創建空白購買清單
 * @param itineraryItemId - 行程項目 ID
 * @returns 空白購買清單
 */
export function createEmptyShoppingList(itineraryItemId: string): ShoppingList {
  return {
    itineraryItemId,
    items: [],
    totalEstimatedAmount: 0,
    completedCount: 0,
  }
}
