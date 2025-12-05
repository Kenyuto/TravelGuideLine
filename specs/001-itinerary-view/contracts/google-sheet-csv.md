# 資料合約：Google Sheet 結構定義

**功能分支**: `001-itinerary-view`  
**版本**: v1.0.0  
**建立日期**: 2025-12-05

---

## 合約總覽

本檔案定義 Google Sheet 的 CSV 結構與前端資料介面合約。

**相關文件**：
- [資料模型定義 data-model.md](../data-model.md)
- [功能規格 spec.md](../spec.md)

---

## Google Sheet 結構要求

### 工作表配置

| 工作表名稱 | 用途 | 必填 | gid 範例 |
|-----------|------|------|---------|
| `行程` 或 `Itinerary` | 每日行程資料 | ✅ | 0（預設第一個工作表） |
| `旅遊資訊` 或 `TravelInfo` | 旅遊資訊資料 | ❌ | 123456（依實際 gid） |

### CSV 匯出 URL 格式

```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
```

**參數說明**：
- `SHEET_ID`：Google Sheet 唯一識別碼（可從分享連結取得）
- `GID`：工作表 ID（預設 0；可從工作表 URL `#gid=123456` 取得）

**範例**：
```
https://docs.google.com/spreadsheets/d/1ABC...XYZ/export?format=csv&gid=0
```

---

## CSV 合約：行程工作表

### 第一行（Header Row）必填欄位

系統支援**中英文欄位名稱**（擇一即可），優先順序：英文 > 中文 > 大小寫不敏感。

| 英文欄位名 | 中文欄位名 | 資料型別 | 必填 | 備註 |
|-----------|-----------|---------|------|------|
| `date` | `日期` | String (YYYY-MM-DD) | ✅ | ISO 8601 格式 |
| `title` | `標題` | String | ✅ | 最大 100 字元 |
| `category` | `分類` | Enum | ✅ | `景點`/`attraction`, `餐廳`/`restaurant`, `交通`/`transport`, `住宿`/`accommodation` |
| `timeSlot` | `時間段` | String | ❌ | 如：`09:00 - 11:00` |
| `emoji` | `Emoji` | String | ❌ | 單一 Emoji（如：🏛️） |
| `location` | `位置` | String | ❌ | 地點名稱 |
| `googleMapsUrl` | `Google地圖` | URL | ❌ | 完整 URL（建議餐廳必填） |
| `phoneNumber` | `電話` | String | ❌ | 國際格式（如：+886-2-1234-5678） |
| `website` | `官網` | URL | ❌ | 完整 URL |
| `openingHours` | `營業時間` | String | ❌ | 如：`10:00 - 22:00` |
| `checkInTime` | `入住時間` | String | ❌ | 僅住宿類別（如：`15:00`） |
| `checkOutTime` | `退房時間` | String | ❌ | 僅住宿類別（如：`11:00`） |
| `cost` | `費用` | Number | ❌ | 數值（如：1200） |
| `currency` | `幣別` | String | ❌ | 預設 `TWD`（支援：JPY, USD, EUR, CNY 等） |
| `pricePerPerson` | `單人價` | Boolean | ❌ | `是`/`Yes`/`TRUE`/`1` → `true`；其他 → `false` |
| `paymentStatus` | `付款狀態` | Enum | ❌ | `已付款`/`paid`, `待付款`/`pending`, `現場付款`/`on-site` |
| `reservationStatus` | `預約狀態` | Enum | ❌ | `已預約`/`confirmed`, `待預約`/`pending`, `免預約`/`not-required` |
| `confirmationNumber` | `預約編號` | String | ❌ | 訂單號或預約號 |
| `transportType` | `交通工具` | String | ❌ | 僅交通類別（如：`高鐵`, `計程車`） |
| `ticketNumber` | `車次` | String | ❌ | 僅交通類別（如：`801`） |
| `seatNumber` | `座位` | String | ❌ | 僅交通類別（如：`12A`） |
| `roomType` | `房型` | String | ❌ | 僅住宿類別（如：`雙人房`） |
| `address` | `地址` | String | ❌ | 詳細地址 |
| `mealTime` | `餐廳時段` | Enum | ❌ | 僅餐廳類別：`早餐`/`breakfast` 🌅, `午餐`/`lunch` ☀️, `晚餐`/`dinner` 🌙 |
| `tags` | `標籤` | Array (CSV) | ❌ | 逗號分隔（如：`必訪,美食推薦`） |
| `rating` | `評分` | Number | ❌ | 1-5（可含小數） |
| `ratingSource` | `評分來源` | String | ❌ | 如：`Google`, `個人` |
| `imageUrl` | `圖片` | URL | ❌ | 完整 URL |
| `imageAlt` | `圖片說明` | String | ❌ | 無障礙替代文字 |
| `referenceLinks` | `參考連結` | Array (CSV) | ❌ | 逗號分隔 URL |
| `notes` | `備註` | String | ❌ | 最大 500 字元 |

### CSV 範例（行程工作表）

```csv
日期,標題,分類,時間段,Emoji,位置,Google地圖,電話,營業時間,費用,幣別,餐廳時段,標籤,評分,評分來源,圖片,備註
2024-01-15,鼎泰豐（信義店）,餐廳,12:00 - 13:30,🥟,台北市信義區,https://maps.google.com/?q=鼎泰豐信義店,+886-2-2345-6789,11:00 - 21:00,800,TWD,午餐,美食推薦;米其林必比登,4.5,Google,https://example.com/dintaifung.jpg,建議提前預約
2024-01-15,台北101觀景台,景點,14:00 - 16:00,🏙️,信義區,https://maps.google.com/?q=台北101,+886-2-8101-8800,09:00 - 22:00,600,TWD,,,必訪;地標,4.8,Google,,記得帶相機
2024-01-15,高鐵 台北→台中,交通,17:00 - 18:00,🚄,台北車站,https://maps.google.com/?q=台北車站,,,700,TWD,,,,,高鐵,803,12A,,,記得提前 30 分鐘到站
```

**注意事項**：
- CSV 格式使用 UTF-8 編碼
- 逗號分隔值（若內容包含逗號，需用雙引號包裹）
- 空值留空（不需填入 `null` 或 `-`）
- 陣列欄位（`tags`, `referenceLinks`）使用分號（`;`）或逗號（`,`）分隔

---

## CSV 合約：旅遊資訊工作表

### 第一行（Header Row）必填欄位

| 英文欄位名 | 中文欄位名 | 資料型別 | 必填 | 備註 |
|-----------|-----------|---------|------|------|
| `title` | `標題` | String | ✅ | 最大 100 字元 |
| `category` | `分類` | Enum | ✅ | `攜帶物品`/`packing`, `注意事項`/`notes`, `緊急聯絡`/`emergency`, `預算`/`budget`, `其他`/`other` |
| `content` | `內容` | String | ✅ | 最大 1000 字元 |
| `emoji` | `Emoji` | String | ❌ | 單一 Emoji |
| `quantity` | `數量` | String | ❌ | 僅攜帶物品分類（如：`2 件`） |
| `priority` | `優先級` | Enum | ❌ | 僅攜帶物品分類：`必備`/`must-have`, `建議`/`recommended`, `可選`/`optional` |
| `contactName` | `聯絡人` | String | ❌ | 僅緊急聯絡分類 |
| `phoneNumber` | `電話` | String | ❌ | 僅緊急聯絡分類 |
| `relationship` | `關係` | String | ❌ | 僅緊急聯絡分類（如：`旅伴`, `導遊`） |
| `amount` | `金額` | Number | ❌ | 僅預算分類 |
| `currency` | `幣別` | String | ❌ | 預設 `TWD` |
| `budgetCategory` | `預算類別` | String | ❌ | 僅預算分類（如：`交通`, `住宿`） |
| `imageUrl` | `圖片` | URL | ❌ | 完整 URL |
| `referenceLinks` | `參考連結` | Array (CSV) | ❌ | 逗號分隔 URL |
| `notes` | `備註` | String | ❌ | 最大 500 字元 |
| `sortOrder` | `排序` | Number | ❌ | 數值越小越前（預設 999） |

### CSV 範例（旅遊資訊工作表）

```csv
標題,分類,內容,Emoji,數量,優先級,聯絡人,電話,關係,金額,幣別,預算類別,排序,備註
護照,攜帶物品,確認有效期限需大於 6 個月,📘,1 本,必備,,,,,,,,1,放於隨身包
轉接頭,攜帶物品,日本使用 A 型插座,🔌,1 個,建議,,,,,,,,5,
飯店緊急聯絡,緊急聯絡,24 小時服務櫃台,🏨,,,ABC 飯店,+81-3-1234-5678,飯店,,,,10,
交通預算,預算,含高鐵、地鐵、計程車,💴,,,,,,,15000,TWD,交通,20,
```

---

## 前端資料介面合約

### 解析後資料結構（TypeScript）

參考 [data-model.md](../data-model.md) 中的 TypeScript 定義：

- `ItineraryDay`: 每日行程物件
- `ItineraryItem`: 行程項目物件
- `TravelInfo`: 旅遊資訊物件
- `InfoItem`: 旅遊資訊項目物件

### API 介面（前端函數）

#### 1. 載入行程資料

```typescript
/**
 * 從 Google Sheet 載入行程資料
 * @param sheetId Google Sheet 唯一識別碼
 * @param gid 工作表 ID（預設 0）
 * @returns Promise<ItineraryDay[]>
 */
async function loadItinerary(
  sheetId: string, 
  gid: number = 0
): Promise<ItineraryDay[]>;
```

**錯誤處理**：
- 網路錯誤：顯示「無法連線至 Google Sheet，請檢查網路或稍後再試」
- 解析錯誤：顯示「行程資料格式錯誤（行 X），請聯絡管理員」
- 必填欄位缺失：記錄錯誤並跳過該筆資料

#### 2. 載入旅遊資訊資料

```typescript
/**
 * 從 Google Sheet 載入旅遊資訊資料
 * @param sheetId Google Sheet 唯一識別碼
 * @param gid 工作表 ID
 * @returns Promise<TravelInfo>
 */
async function loadTravelInfo(
  sheetId: string, 
  gid: number
): Promise<TravelInfo>;
```

**錯誤處理**：
- 工作表不存在：顯示空狀態「暫無旅遊資訊」
- 其他錯誤：同行程資料錯誤處理

#### 3. 欄位映射與驗證

```typescript
/**
 * 將 CSV Row 映射為 ItineraryItem
 * @param row CSV 解析後的物件（Header Row 作為鍵）
 * @param fieldMappingVersion 欄位映射表版本號（預設 v1.0.0）
 * @returns ItineraryItem | null（無效資料返回 null）
 */
function mapToItineraryItem(
  row: Record<string, string>, 
  fieldMappingVersion: string = 'v1.0.0'
): ItineraryItem | null;
```

**映射邏輯**：
1. 欄位名稱正規化（移除空白、轉小寫）
2. 中英文欄位名稱映射（優先英文）
3. 型別轉換（數值、布林、陣列）
4. 驗證必填欄位與型別
5. 記錄未知欄位告警

---

## 測試合約

### Contract Tests（使用 Vitest）

#### 測試範圍

1. **CSV 解析正確性**：驗證 PapaParse 解析結果符合預期
2. **欄位映射正確性**：驗證中英文欄位名稱映射無誤
3. **型別轉換正確性**：驗證數值、布林、陣列轉換邏輯
4. **必填欄位驗證**：驗證缺少必填欄位時返回 `null` 並記錄錯誤
5. **容錯處理**：驗證未知欄位、型別錯誤、空值處理邏輯

#### 測試範例

```typescript
import { describe, it, expect } from 'vitest';
import { mapToItineraryItem } from './mappers';

describe('ItineraryItem 欄位映射', () => {
  it('應正確映射中文欄位名稱', () => {
    const row = {
      '日期': '2024-01-15',
      '標題': '鼎泰豐',
      '分類': '餐廳',
      '費用': '800',
      '幣別': 'TWD'
    };
    const item = mapToItineraryItem(row);
    expect(item).not.toBeNull();
    expect(item?.title).toBe('鼎泰豐');
    expect(item?.category).toBe('restaurant');
    expect(item?.cost).toBe(800);
    expect(item?.currency).toBe('TWD');
  });

  it('應忽略未知欄位並記錄告警', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn');
    const row = {
      '標題': '測試',
      '分類': '景點',
      '未知欄位': '測試值'
    };
    mapToItineraryItem(row);
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('未知欄位')
    );
  });

  it('應在缺少必填欄位時返回 null', () => {
    const row = { '標題': '測試' }; // 缺少 category
    const item = mapToItineraryItem(row);
    expect(item).toBeNull();
  });
});
```

---

## 版本控制

### 合約版本

- **當前版本**: v1.0.0
- **版本策略**: 遵循語義化版本（Semantic Versioning）
  - **MAJOR**：不相容變更（欄位重新命名、型別變更、移除欄位）
  - **MINOR**：向後相容新增（新欄位、新分類選項）
  - **PATCH**：修正與釐清（文件更新、範例修正）

### 變更日誌

| 版本 | 日期 | 變更說明 |
|------|------|---------|
| v1.0.0 | 2025-12-05 | 初始合約版本：定義行程與旅遊資訊 CSV 結構 |

---

**下一步**: 產出 quickstart.md（開發環境設定指南）
