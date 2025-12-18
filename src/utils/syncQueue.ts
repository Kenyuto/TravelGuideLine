/**
 * 離線同步佇列管理
 *
 * 管理離線期間的操作，支援 FIFO 順序、自動重試、衝突解決（Last Write Wins）
 */

import type { ShoppingItem } from '@/types/shopping'

/**
 * 同步操作類型
 */
export type SyncOperation = 'CREATE' | 'UPDATE' | 'DELETE'

/**
 * 同步佇列項目
 */
export interface SyncQueueItem {
  id: string // 佇列項目唯一 ID
  operation: SyncOperation
  itemId?: string // 購買項目 ID（UPDATE/DELETE 需要）
  data?: Partial<ShoppingItem> // 項目資料（CREATE/UPDATE 需要）
  timestamp: string // ISO 8601 時間戳記
  retryCount: number // 重試次數
  lastError?: string // 最後錯誤訊息
}

/**
 * LocalStorage 鍵名
 */
const STORAGE_KEY = 'shoppingListSyncQueue'

/**
 * 最大重試次數
 */
const MAX_RETRY_COUNT = 3

/**
 * 載入同步佇列
 * @returns 同步佇列項目陣列
 */
export function loadSyncQueue(): SyncQueueItem[] {
  try {
    const json = localStorage.getItem(STORAGE_KEY)
    if (!json) return []

    const queue = JSON.parse(json) as SyncQueueItem[]
    return Array.isArray(queue) ? queue : []
  } catch (error) {
    console.error('[syncQueue] 載入佇列失敗:', error)
    return []
  }
}

/**
 * 儲存同步佇列
 * @param queue - 同步佇列項目陣列
 */
export function saveSyncQueue(queue: SyncQueueItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
  } catch (error) {
    console.error('[syncQueue] 儲存佇列失敗:', error)
  }
}

/**
 * 新增項目至同步佇列
 * @param operation - 操作類型
 * @param itemId - 項目 ID（UPDATE/DELETE 需要）
 * @param data - 項目資料（CREATE/UPDATE 需要）
 */
export function addToSyncQueue(
  operation: SyncOperation,
  itemId?: string,
  data?: Partial<ShoppingItem>
): void {
  const queue = loadSyncQueue()

  // 檢查是否已存在相同項目的操作（去重）
  const existingIndex = queue.findIndex(
    (item) => item.operation === operation && item.itemId === itemId
  )

  const queueItem: SyncQueueItem = {
    id: `${operation}-${itemId || Date.now()}`,
    operation,
    itemId,
    data,
    timestamp: new Date().toISOString(),
    retryCount: 0,
  }

  if (existingIndex !== -1) {
    // 更新現有項目（Last Write Wins）
    queue[existingIndex] = {
      ...queue[existingIndex],
      data: data || queue[existingIndex].data,
      timestamp: queueItem.timestamp,
      retryCount: 0, // 重置重試次數
      lastError: undefined,
    }
  } else {
    // 新增至佇列末端（FIFO）
    queue.push(queueItem)
  }

  saveSyncQueue(queue)
  console.log('[syncQueue] 已加入佇列:', queueItem)
}

/**
 * 從同步佇列移除項目
 * @param id - 佇列項目 ID
 */
export function removeFromSyncQueue(id: string): void {
  const queue = loadSyncQueue()
  const filtered = queue.filter((item) => item.id !== id)
  saveSyncQueue(filtered)
  console.log('[syncQueue] 已移除:', id)
}

/**
 * 更新佇列項目的重試次數與錯誤訊息
 * @param id - 佇列項目 ID
 * @param error - 錯誤訊息
 */
export function incrementRetryCount(id: string, error: string): void {
  const queue = loadSyncQueue()
  const item = queue.find((item) => item.id === id)

  if (item) {
    item.retryCount += 1
    item.lastError = error

    // 若超過最大重試次數，從佇列移除
    if (item.retryCount >= MAX_RETRY_COUNT) {
      console.error(`[syncQueue] 項目 ${id} 超過最大重試次數，已移除:`, error)
      removeFromSyncQueue(id)
      return
    }

    saveSyncQueue(queue)
    console.log(`[syncQueue] 重試次數更新: ${id} (${item.retryCount}/${MAX_RETRY_COUNT})`)
  }
}

/**
 * 清空同步佇列
 */
export function clearSyncQueue(): void {
  localStorage.removeItem(STORAGE_KEY)
  console.log('[syncQueue] 佇列已清空')
}

/**
 * 取得佇列大小
 * @returns 佇列項目數量
 */
export function getSyncQueueSize(): number {
  return loadSyncQueue().length
}

/**
 * 合併佇列中的操作（優化策略）
 *
 * 規則：
 * - DELETE 後的 CREATE/UPDATE 可移除（項目已刪除）
 * - CREATE 後的 UPDATE 可合併為單一 CREATE
 * - UPDATE 可合併為最後一次 UPDATE（Last Write Wins）
 *
 * @returns 合併後的佇列
 */
export function mergeSyncQueue(): SyncQueueItem[] {
  const queue = loadSyncQueue()
  const merged = new Map<string, SyncQueueItem>()

  queue.forEach((item) => {
    const key = item.itemId || item.id

    if (item.operation === 'DELETE') {
      // DELETE 操作：移除所有相關操作，只保留 DELETE
      merged.set(key, item)
    } else if (item.operation === 'CREATE') {
      const existing = merged.get(key)
      if (!existing || existing.operation !== 'DELETE') {
        // 若無 DELETE，保留 CREATE
        merged.set(key, item)
      }
    } else if (item.operation === 'UPDATE') {
      const existing = merged.get(key)
      if (existing?.operation === 'CREATE') {
        // CREATE + UPDATE => 合併為 CREATE
        merged.set(key, {
          ...existing,
          data: { ...existing.data, ...item.data },
          timestamp: item.timestamp,
        })
      } else if (!existing || existing.operation !== 'DELETE') {
        // Last Write Wins
        merged.set(key, item)
      }
    }
  })

  const mergedQueue = Array.from(merged.values())
  saveSyncQueue(mergedQueue)
  console.log(`[syncQueue] 佇列已合併: ${queue.length} => ${mergedQueue.length}`)
  return mergedQueue
}
