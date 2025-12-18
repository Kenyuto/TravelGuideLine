# 購買清單 Google Sheet 同步實作計劃

**日期**: 2025-12-18  
**狀態**: 規劃中  
**相關規格**: [specs/001-itinerary-view/spec.md](../specs/001-itinerary-view/spec.md)

## 概述

將購買清單功能從純前端 LocalStorage 儲存改為 Google Sheet 儲存，支援多人協作與跨裝置同步。

## 架構變更

### 現有架構（v1.0 - LocalStorage）
```
使用者 → Vue Component → Pinia Store → LocalStorage
                                   ↓
                            計算統計資訊
```

### 新架構（v2.0 - Google Sheet Sync）
```
使用者 → Vue Component → Pinia Store ←→ Google Sheet (Read: CSV)
                            ↓                    ↑
                     LocalStorage (Cache)        |
                                                  |
                                   Google Apps Script Web App (Write)
```

## 實作階段

### Phase 1: Google Sheet 設定（手動）
**負責人**: 專案維護者  
**預估時間**: 30 分鐘

1. **建立「購買清單」工作表**
   - 在現有 Google Sheet 中新增工作表
   - 名稱: `ShoppingList` 或 `購買清單`
   - 欄位定義 (12 欄):
     - A: itemId (UUID v4)
     - B: itineraryItemId (關聯行程項目)
     - C: name (項目名稱)
     - D: isCompleted (true/false)
     - E: note (備註，選填)
     - F: quantity (數量，選填)
     - G: estimatedAmount (估計金額，選填)
     - H: currency (幣別，預設 TWD)
     - I: createdBy (建立者)
     - J: createdAt (建立時間 ISO 8601)
     - K: lastUpdatedBy (最後更新者)
     - L: lastUpdatedAt (最後更新時間)

2. **建立 Google Apps Script Web App**
   - 在 Google Sheet 中開啟 Apps Script 編輯器
   - 建立 `ShoppingListAPI.gs` 檔案
   - 實作 `doPost(e)` 函數處理寫入請求
   - 部署為 Web App（執行身分：自己，存取權限：任何人）
   - 記錄 Web App URL

### Phase 2: 前端程式碼更新
**預估時間**: 3-4 小時

#### 2.1 新增 Google Sheet 寫入工具函數
**檔案**: `src/utils/googleSheetWriter.ts`

```typescript
/**
 * Google Sheet 寫入工具函數
 * 使用 Google Apps Script Web App 端點
 */

export interface WriteRequest {
  action: 'add' | 'update' | 'delete'
  data: any
}

export interface WriteResponse {
  success: boolean
  message?: string
  data?: any
}

/**
 * 寫入資料到 Google Sheet (via Apps Script Web App)
 * @param webAppUrl - Google Apps Script Web App URL
 * @param request - 寫入請求
 * @returns Promise<WriteResponse>
 */
export async function writeToGoogleSheet(
  webAppUrl: string,
  request: WriteRequest
): Promise<WriteResponse> {
  // 實作細節
}

/**
 * Debounced 寫入函數
 * 500ms debounce 避免頻繁請求
 */
export const debouncedWrite = debounce(writeToGoogleSheet, 500)
```

#### 2.2 更新 Google Sheet 解析器
**檔案**: `src/utils/googleSheetParser.ts`

新增購買清單解析函數:
```typescript
/**
 * 解析購買清單 CSV 資料
 * @param csvData - CSV 原始資料
 * @returns ShoppingItem[]
 */
export function parseShoppingListCSV(csvData: string): ShoppingItem[] {
  // 使用 PapaParse 解析
  // 轉換為 ShoppingItem 陣列
  // 處理日期欄位 (ISO 8601 → Date)
}
```

#### 2.3 更新 Shopping Store
**檔案**: `src/stores/shopping.ts`

主要變更:
- 新增 `webAppUrl` 配置 (從環境變數或設定檔讀取)
- 新增 `syncQueue` 狀態 (離線時的待同步佇列)
- 新增 `isSyncing` 狀態 (同步中指示器)
- 更新 `loadFromStorage()` → `loadFromGoogleSheet()`
- 更新所有寫入操作 (addItem/updateItem/deleteItem)
  - 先更新 LocalStorage (樂觀更新)
  - 呼叫 Google Apps Script Web App
  - 處理錯誤回滾
- 新增 `syncOfflineChanges()` (離線變更同步)
- 新增 `handleNetworkReconnect()` (網路恢復處理)

#### 2.4 更新 ShoppingList 元件
**檔案**: `src/components/shopping/ShoppingList.vue`

主要變更:
- 顯示同步狀態指示器 (`isSyncing`)
- 顯示同步錯誤訊息
- 顯示最後更新者與時間
- 離線時顯示「離線模式，變更將於連線後同步」提示

#### 2.5 更新環境配置
**檔案**: `.env.example`, `vite.config.ts`

新增環境變數:
```
VITE_GOOGLE_SHEET_ID=your_sheet_id
VITE_GOOGLE_SHEET_GID_SHOPPING=0  # 購買清單工作表 GID
VITE_GOOGLE_APPS_SCRIPT_WEB_APP_URL=https://script.google.com/macros/s/.../exec
```

### Phase 3: 離線同步機制
**預估時間**: 2 小時

#### 3.1 同步佇列管理
**檔案**: `src/utils/syncQueue.ts`

```typescript
export interface SyncQueueItem {
  id: string
  timestamp: number
  operation: 'add' | 'update' | 'delete'
  data: ShoppingItem
}

export class SyncQueue {
  private queue: SyncQueueItem[] = []
  
  add(item: SyncQueueItem): void
  remove(id: string): void
  getAll(): SyncQueueItem[]
  clear(): void
  saveToStorage(): void
  loadFromStorage(): void
}
```

#### 3.2 網路狀態監聽
**檔案**: `src/App.vue` (已存在，需更新)

新增:
- 監聽 `online` 事件
- 觸發 `shoppingStore.syncOfflineChanges()`

### Phase 4: 測試
**預估時間**: 2 小時

#### 4.1 單元測試
- `tests/unit/utils/googleSheetWriter.spec.ts`
- `tests/unit/utils/syncQueue.spec.ts`
- `tests/unit/stores/shopping.spec.ts` (更新)

#### 4.2 整合測試
- `tests/integration/shopping-sync-flow.spec.ts`
  - 測試完整讀寫流程
  - 測試離線同步
  - 測試多人協作衝突

#### 4.3 E2E 測試
- `tests/e2e/shopping-collaboration.spec.ts`
  - 模擬多使用者場景
  - 測試跨裝置同步

### Phase 5: 文件更新
**預估時間**: 1 小時

#### 5.1 更新 plan.md
- 更新 Storage 說明
- 更新專案結構
- 更新技術棧 (Google Apps Script Web App)

#### 5.2 更新 tasks.md
- 新增 Google Sheet 同步相關任務
- 更新購買清單實作任務

#### 5.3 更新 README.md
- 新增 Google Sheet 設定步驟
- 新增 Google Apps Script 部署指南
- 新增環境變數設定說明

### Phase 6: 部署與驗證
**預估時間**: 1 小時

1. 部署 Google Apps Script Web App
2. 更新環境變數
3. 部署前端到 staging
4. 驗證多人協作功能
5. 驗證離線同步功能
6. 部署到 production

## 總預估時間

- Phase 1: 0.5 小時
- Phase 2: 4 小時
- Phase 3: 2 小時
- Phase 4: 2 小時
- Phase 5: 1 小時
- Phase 6: 1 小時
- **總計**: 10.5 小時

## 風險與注意事項

### 技術風險
1. **Google Apps Script 限制**
   - 每日請求配額: 20,000 次
   - 單次執行時間限制: 6 分鐘
   - **緩解**: 使用 debounce 減少請求頻率

2. **CORS 問題**
   - Google Apps Script Web App 可能有 CORS 限制
   - **緩解**: 在 Apps Script 中正確設定 CORS headers

3. **資料一致性**
   - 多人同時編輯可能導致資料衝突
   - **緩解**: 採用 "Last Write Wins" 策略，顯示最後更新者

4. **離線同步衝突**
   - 離線期間的變更可能與線上版本衝突
   - **緩解**: 顯示衝突警告，讓使用者選擇保留哪個版本

### 使用者體驗風險
1. **同步延遲**
   - Google Apps Script 可能有 1-2 秒延遲
   - **緩解**: 樂觀更新 UI，背景同步

2. **錯誤處理**
   - 網路錯誤或 API 錯誤需清楚提示
   - **緩解**: 友善的錯誤訊息與重試機制

## 後續優化

### v2.1 - 進階功能
- 衝突解決 UI (顯示差異，讓使用者選擇)
- 即時通知 (使用 WebSocket 或 Server-Sent Events)
- 批次同步 (合併多個變更為單一請求)

### v2.2 - 效能優化
- 增量同步 (只同步變更的項目)
- 背景同步 (使用 Service Worker Background Sync API)
- 快取策略優化

## 參考資料

- [Google Apps Script Web Apps](https://developers.google.com/apps-script/guides/web)
- [Google Sheets API](https://developers.google.com/sheets/api)
- [Service Worker Background Sync](https://developers.google.com/web/updates/2015/12/background-sync)
- [Optimistic UI Updates](https://www.apollographql.com/docs/react/performance/optimistic-ui/)
