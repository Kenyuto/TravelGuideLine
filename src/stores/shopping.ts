/**
 * ShoppingStore - 購買清單狀態管理（Google Sheet 同步版本）
 * 使用 Pinia 2.x + Google Apps Script Web App
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { ShoppingList, ShoppingItem, ShoppingListState } from '@/types/shopping'
import {
  computeTotalEstimatedAmount,
  computeCompletedCount,
  createEmptyShoppingList,
} from '@/types/shopping'
import { fetchGoogleSheetCSV, parseGoogleSheetCSV } from '@/utils/googleSheetParser'
import {
  createShoppingItem as apiCreateItem,
  updateShoppingItem as apiUpdateItem,
  deleteShoppingItem as apiDeleteItem,
  debouncedWrite,
} from '@/utils/googleSheetWriter'
import {
  addToSyncQueue,
  removeFromSyncQueue,
  incrementRetryCount,
  getSyncQueueSize,
  mergeSyncQueue,
} from '@/utils/syncQueue'

const STORAGE_KEY = 'travelguideline_shopping_lists'
const GOOGLE_SHEET_ID_KEY = 'VITE_GOOGLE_SHEET_ID'
const SHOPPING_LIST_GID = 3 // 購買清單工作表 GID

export const useShoppingStore = defineStore('shopping', () => {
  // State
  const shoppingLists = ref<Map<string, ShoppingList>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isSyncing = ref(false)
  const lastSyncTime = ref<Date | null>(null)
  const syncQueueSize = ref(0)

  // Getters
  const getShoppingList = computed(() => {
    return (itineraryItemId: string): ShoppingList => {
      if (!shoppingLists.value.has(itineraryItemId)) {
        return createEmptyShoppingList(itineraryItemId)
      }
      return shoppingLists.value.get(itineraryItemId)!
    }
  })

  const getAllShoppingLists = computed(() => {
    return Array.from(shoppingLists.value.values())
  })

  const hasPendingSync = computed(() => syncQueueSize.value > 0)

  // Actions

  /**
   * 從 Google Sheet 載入購買清單
   */
  async function loadFromGoogleSheet(): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const sheetId = import.meta.env[GOOGLE_SHEET_ID_KEY]
      if (!sheetId) {
        throw new Error('Google Sheet ID 未設定')
      }

      // 下載 CSV
      const csvData = await fetchGoogleSheetCSV(sheetId, SHOPPING_LIST_GID)

      // 解析資料
      const items = parseGoogleSheetCSV(csvData, 'shoppingList') as ShoppingItem[]

      // 依 itineraryItemId 分組
      const grouped = new Map<string, ShoppingItem[]>()
      items.forEach((item) => {
        const list = grouped.get(item.itineraryItemId) || []
        list.push(item)
        grouped.set(item.itineraryItemId, list)
      })

      // 建立 ShoppingList 物件
      const loadedLists = new Map<string, ShoppingList>()
      grouped.forEach((items, itineraryItemId) => {
        loadedLists.set(itineraryItemId, {
          itineraryItemId,
          items,
          totalEstimatedAmount: computeTotalEstimatedAmount(items),
          completedCount: computeCompletedCount(items),
        })
      })

      shoppingLists.value = loadedLists
      lastSyncTime.value = new Date()

      // 同步至 LocalStorage（離線快取）
      saveToLocalStorage()
    } catch (err) {
      console.error('[ShoppingStore] 載入 Google Sheet 失敗:', err)
      error.value = '無法載入購買清單，嘗試從本地快取載入'

      // 回退至 LocalStorage
      loadFromLocalStorage()
    } finally {
      loading.value = false
    }
  }

  /**
   * 從 LocalStorage 載入（離線快取）
   */
  function loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return

      const state: ShoppingListState = JSON.parse(data)
      const loadedLists = new Map<string, ShoppingList>()

      Object.entries(state).forEach(([itineraryItemId, items]) => {
        loadedLists.set(itineraryItemId, {
          itineraryItemId,
          items,
          totalEstimatedAmount: computeTotalEstimatedAmount(items),
          completedCount: computeCompletedCount(items),
        })
      })

      shoppingLists.value = loadedLists
    } catch (err) {
      console.error('[ShoppingStore] 載入 LocalStorage 失敗:', err)
      error.value = '無法載入購買清單'
    }
  }

  /**
   * 儲存至 LocalStorage（離線快取）
   */
  function saveToLocalStorage(): void {
    try {
      const state: ShoppingListState = {}
      shoppingLists.value.forEach((list, itineraryItemId) => {
        state[itineraryItemId] = list.items
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      console.error('[ShoppingStore] 儲存 LocalStorage 失敗:', err)
    }
  }

  /**
   * 新增購買項目
   */
  async function addItem(
    itineraryItemId: string,
    itemName: string,
    options?: {
      notes?: string
      quantity?: number
      unit?: string
      estimatedCost?: number
      createdBy?: string
    }
  ): Promise<ShoppingItem> {
    const now = new Date().toISOString()
    const newItem: ShoppingItem = {
      id: uuidv4(),
      itineraryItemId,
      itemName: itemName.trim(),
      isCompleted: false,
      quantity: options?.quantity,
      unit: options?.unit,
      estimatedCost: options?.estimatedCost,
      notes: options?.notes?.trim(),
      createdBy: options?.createdBy || 'user',
      createdAt: now,
      lastUpdatedBy: options?.createdBy || 'user',
      lastUpdatedAt: now,
    }

    // 更新本地狀態
    let list = shoppingLists.value.get(itineraryItemId)
    if (!list) {
      list = createEmptyShoppingList(itineraryItemId)
      shoppingLists.value.set(itineraryItemId, list)
    }

    list.items.push(newItem)
    list.totalEstimatedAmount = computeTotalEstimatedAmount(list.items)
    list.completedCount = computeCompletedCount(list.items)

    // 儲存至 LocalStorage
    saveToLocalStorage()

    // 同步至 Google Sheet（若線上）或加入佇列（若離線）
    try {
      if (navigator.onLine) {
        await apiCreateItem(newItem)
      } else {
        addToSyncQueue('CREATE', newItem.id, newItem)
        syncQueueSize.value = getSyncQueueSize()
      }
    } catch (err) {
      console.error('[ShoppingStore] 新增項目失敗:', err)
      addToSyncQueue('CREATE', newItem.id, newItem)
      syncQueueSize.value = getSyncQueueSize()
    }

    return newItem
  }

  /**
   * 更新購買項目
   */
  async function updateItem(
    itemId: string,
    updates: Partial<Omit<ShoppingItem, 'id' | 'itineraryItemId' | 'createdAt' | 'createdBy'>>,
    updatedBy?: string
  ): Promise<boolean> {
    // 更新本地狀態
    let found = false
    for (const list of shoppingLists.value.values()) {
      const itemIndex = list.items.findIndex((item) => item.id === itemId)
      if (itemIndex !== -1) {
        const item = list.items[itemIndex]
        Object.assign(item, updates, {
          lastUpdatedBy: updatedBy || 'user',
          lastUpdatedAt: new Date().toISOString(),
        })

        list.totalEstimatedAmount = computeTotalEstimatedAmount(list.items)
        list.completedCount = computeCompletedCount(list.items)
        found = true
        break
      }
    }

    if (!found) return false

    // 儲存至 LocalStorage
    saveToLocalStorage()

    // 同步至 Google Sheet（防抖）
    try {
      await debouncedWrite(`update-${itemId}`, async () => {
        if (navigator.onLine) {
          await apiUpdateItem(itemId, { ...updates, lastUpdatedBy: updatedBy || 'user' })
        } else {
          addToSyncQueue('UPDATE', itemId, updates)
          syncQueueSize.value = getSyncQueueSize()
        }
      })
    } catch (err) {
      console.error('[ShoppingStore] 更新項目失敗:', err)
      addToSyncQueue('UPDATE', itemId, updates)
      syncQueueSize.value = getSyncQueueSize()
    }

    return true
  }

  /**
   * 切換完成狀態
   */
  async function toggleItemComplete(itemId: string, updatedBy?: string): Promise<boolean> {
    let currentCompleteState: boolean | undefined

    // 取得當前狀態
    for (const list of shoppingLists.value.values()) {
      const item = list.items.find((i) => i.id === itemId)
      if (item) {
        currentCompleteState = item.isCompleted
        break
      }
    }

    if (currentCompleteState === undefined) return false

    // 更新為相反狀態
    return updateItem(itemId, { isCompleted: !currentCompleteState }, updatedBy)
  }

  /**
   * 刪除購買項目
   */
  async function deleteItem(itemId: string): Promise<boolean> {
    // 更新本地狀態
    let found = false
    for (const list of shoppingLists.value.values()) {
      const itemIndex = list.items.findIndex((item) => item.id === itemId)
      if (itemIndex !== -1) {
        list.items.splice(itemIndex, 1)
        list.totalEstimatedAmount = computeTotalEstimatedAmount(list.items)
        list.completedCount = computeCompletedCount(list.items)
        found = true
        break
      }
    }

    if (!found) return false

    // 儲存至 LocalStorage
    saveToLocalStorage()

    // 同步至 Google Sheet
    try {
      if (navigator.onLine) {
        await apiDeleteItem(itemId)
      } else {
        addToSyncQueue('DELETE', itemId)
        syncQueueSize.value = getSyncQueueSize()
      }
    } catch (err) {
      console.error('[ShoppingStore] 刪除項目失敗:', err)
      addToSyncQueue('DELETE', itemId)
      syncQueueSize.value = getSyncQueueSize()
    }

    return true
  }

  /**
   * 同步離線佇列
   */
  async function syncOfflineChanges(): Promise<void> {
    if (!navigator.onLine) {
      console.warn('[ShoppingStore] 離線狀態，無法同步')
      return
    }

    const queue = mergeSyncQueue() // 合併重複操作
    if (queue.length === 0) {
      console.log('[ShoppingStore] 無待同步項目')
      return
    }

    isSyncing.value = true
    console.log(`[ShoppingStore] 開始同步 ${queue.length} 個項目...`)

    for (const item of queue) {
      try {
        switch (item.operation) {
          case 'CREATE':
            await apiCreateItem(item.data as ShoppingItem)
            break
          case 'UPDATE':
            await apiUpdateItem(item.itemId!, item.data!)
            break
          case 'DELETE':
            await apiDeleteItem(item.itemId!)
            break
        }

        // 成功：從佇列移除
        removeFromSyncQueue(item.id)
        console.log(`[ShoppingStore] 同步成功: ${item.operation} ${item.itemId}`)
      } catch (err) {
        console.error(`[ShoppingStore] 同步失敗: ${item.operation} ${item.itemId}`, err)
        // 失敗：增加重試次數
        incrementRetryCount(item.id, (err as Error).message)
      }
    }

    syncQueueSize.value = getSyncQueueSize()
    isSyncing.value = false
    console.log('[ShoppingStore] 同步完成')

    // 重新載入以確保資料一致性
    await loadFromGoogleSheet()
  }

  /**
   * 處理網路重連
   */
  function handleNetworkReconnection(): void {
    console.log('[ShoppingStore] 網路已恢復，開始同步離線變更')
    syncOfflineChanges()
  }

  /**
   * 清空特定清單
   */
  function clearList(itineraryItemId: string): void {
    shoppingLists.value.delete(itineraryItemId)
    saveToLocalStorage()
  }

  /**
   * 清空所有清單
   */
  function clearAllLists(): void {
    shoppingLists.value.clear()
    localStorage.removeItem(STORAGE_KEY)
  }

  // 初始化：載入同步佇列大小
  syncQueueSize.value = getSyncQueueSize()

  return {
    // State
    shoppingLists,
    loading,
    error,
    isSyncing,
    lastSyncTime,
    syncQueueSize,
    // Getters
    getShoppingList,
    getAllShoppingLists,
    hasPendingSync,
    // Actions
    loadFromGoogleSheet,
    loadFromLocalStorage,
    saveToLocalStorage,
    addItem,
    updateItem,
    toggleItemComplete,
    deleteItem,
    syncOfflineChanges,
    handleNetworkReconnection,
    clearList,
    clearAllLists,
  }
})
