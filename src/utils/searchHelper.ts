/**
 * searchHelper - 搜尋與過濾輔助工具
 */

import type { ItineraryItem } from '@/types/itinerary'

/**
 * 搜尋行程項目
 * @param items 行程項目列表
 * @param query 搜尋關鍵字
 * @returns 符合搜尋條件的項目
 */
export function searchItineraryItems(items: ItineraryItem[], query: string): ItineraryItem[] {
  if (!query || query.trim() === '') {
    return items
  }

  const normalizedQuery = query.toLowerCase().trim()

  return items.filter((item) => matchesSearchQuery(item, normalizedQuery))
}

/**
 * 檢查項目是否符合搜尋條件
 * @param item 行程項目
 * @param query 已正規化的搜尋關鍵字（小寫）
 * @returns 是否符合
 */
export function matchesSearchQuery(item: ItineraryItem, query: string): boolean {
  if (!query) return true

  // 搜尋標題
  if (item.title.toLowerCase().includes(query)) return true

  // 搜尋地點
  if (item.location && item.location.toLowerCase().includes(query)) return true

  // 搜尋描述
  if (item.description && item.description.toLowerCase().includes(query)) return true

  // 搜尋標籤
  if (item.tags && item.tags.toLowerCase().includes(query)) return true

  // 搜尋分類
  if (item.category && item.category.toLowerCase().includes(query)) return true

  // 搜尋備註
  if (item.notes && item.notes.toLowerCase().includes(query)) return true

  return false
}

/**
 * 取得標籤統計資料
 * @param items 行程項目列表
 * @returns 標籤統計陣列，依出現次數排序
 */
export function getTagStatistics(items: ItineraryItem[]): Array<{ tag: string; count: number }> {
  const tagCounts: Record<string, number> = {}

  items.forEach((item) => {
    item.tagList.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  return Object.entries(tagCounts)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}
