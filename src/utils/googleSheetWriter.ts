/**
 * Google Apps Script Web App 寫入工具
 *
 * 透過 Google Apps Script Web App 端點處理購買清單的 CREATE/UPDATE/DELETE 操作
 * 支援 500ms 防抖、錯誤處理、CORS
 */

import type { ShoppingItem } from '@/types/shopping'

/**
 * Web App URL（從環境變數讀取）
 */
const getWebAppUrl = (): string => {
  const url = import.meta.env.VITE_GOOGLE_APPS_SCRIPT_WEB_APP_URL
  if (!url) {
    throw new Error('VITE_GOOGLE_APPS_SCRIPT_WEB_APP_URL 環境變數未設定')
  }
  return url
}

/**
 * API 操作類型
 */
type ApiOperation = 'CREATE' | 'UPDATE' | 'DELETE'

/**
 * API 請求參數
 */
interface ApiRequest {
  operation: ApiOperation
  item?: Partial<ShoppingItem>
  itemId?: string
}

/**
 * API 回應
 */
interface ApiResponse {
  success: boolean
  message: string
  data?: unknown
}

/**
 * 防抖計時器 Map（每個項目獨立計時器）
 */
const debounceTimers = new Map<string, NodeJS.Timeout>()

/**
 * 發送請求至 Google Apps Script Web App
 *
 * @param request - API 請求參數
 * @returns API 回應
 * @throws 網路錯誤或 API 錯誤
 */
async function sendRequest(request: ApiRequest): Promise<ApiResponse> {
  const url = getWebAppUrl()

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
      mode: 'cors',
    })

    if (!response.ok) {
      throw new Error(`HTTP 錯誤: ${response.status} ${response.statusText}`)
    }

    const data: ApiResponse = await response.json()

    if (!data.success) {
      throw new Error(data.message || '未知錯誤')
    }

    return data
  } catch (error) {
    console.error('[googleSheetWriter] 請求失敗:', error)
    throw error
  }
}

/**
 * 建立購買項目
 *
 * @param item - 購買項目資料
 * @returns API 回應
 */
export async function createShoppingItem(item: Omit<ShoppingItem, 'id'>): Promise<ApiResponse> {
  return sendRequest({
    operation: 'CREATE',
    item,
  })
}

/**
 * 更新購買項目
 *
 * @param itemId - 項目 ID
 * @param updates - 要更新的欄位
 * @returns API 回應
 */
export async function updateShoppingItem(
  itemId: string,
  updates: Partial<ShoppingItem>
): Promise<ApiResponse> {
  return sendRequest({
    operation: 'UPDATE',
    itemId,
    item: updates,
  })
}

/**
 * 刪除購買項目
 *
 * @param itemId - 項目 ID
 * @returns API 回應
 */
export async function deleteShoppingItem(itemId: string): Promise<ApiResponse> {
  return sendRequest({
    operation: 'DELETE',
    itemId,
  })
}

/**
 * 防抖寫入（500ms 延遲）
 *
 * 用於頻繁更新的場景（如切換完成狀態），避免過多 API 請求
 *
 * @param key - 唯一鍵（用於區分不同項目的計時器）
 * @param operation - 操作函數
 * @returns Promise（在防抖延遲後執行）
 */
export function debouncedWrite<T>(key: string, operation: () => Promise<T>): Promise<T> {
  // 清除舊計時器
  const existingTimer = debounceTimers.get(key)
  if (existingTimer) {
    clearTimeout(existingTimer)
  }

  // 建立新 Promise
  return new Promise((resolve, reject) => {
    const timer = setTimeout(async () => {
      debounceTimers.delete(key)
      try {
        const result = await operation()
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }, 500)

    debounceTimers.set(key, timer)
  })
}

/**
 * 批次更新購買項目（用於同步離線佇列）
 *
 * @param operations - 操作陣列
 * @returns 成功與失敗的操作結果
 */
export async function batchUpdate(
  operations: ApiRequest[]
): Promise<{ success: ApiResponse[]; failed: Array<{ request: ApiRequest; error: Error }> }> {
  const results = {
    success: [] as ApiResponse[],
    failed: [] as Array<{ request: ApiRequest; error: Error }>,
  }

  for (const request of operations) {
    try {
      const response = await sendRequest(request)
      results.success.push(response)
    } catch (error) {
      results.failed.push({
        request,
        error: error as Error,
      })
    }
  }

  return results
}
