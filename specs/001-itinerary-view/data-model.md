# 資料模型定義：旅遊行程檢視網站

**功能分支**: `001-itinerary-view`  
**版本**: v1.0.0  
**建立日期**: 2025-12-05  
**依據**: [功能規格 spec.md](./spec.md) 關鍵實體定義

---

## 版本歷史

| 版本 | 日期 | 變更說明 |
|------|------|---------|
| v1.0.0 | 2025-12-05 | 初始版本：定義 ItineraryDay, ItineraryItem, TravelInfo, InfoItem 及欄位映射表 |

---

## 資料模型總覽

本專案包含四個核心實體：

1. **ItineraryDay**：代表每日行程（日期 + 行程項目列表）
2. **ItineraryItem**：代表單一行程項目（景點/餐廳/交通/住宿卡片）
3. **TravelInfo**：代表旅遊資訊整體資料（資訊項目列表）
4. **InfoItem**：代表單一旅遊資訊項目（攜帶物品/注意事項/緊急聯絡/預算）

---

## 1. ItineraryDay（每日行程）

### TypeScript 定義

```typescript
interface ItineraryDay {
  /** 行程日期（YYYY-MM-DD 格式） */
  date: string;
  
  /** 該日所有行程項目 */
  items: ItineraryItem[];
  
  /** 日期備註（可選，如：「休息日」、「彈性安排」） */
  notes?: string;
}
```

### 驗證規則

- `date` 必須符合 ISO 8601 格式（YYYY-MM-DD）
- `items` 陣列可為空（表示當日無安排行程）
- `notes` 最大長度 500 字元

### 範例

```json
{
  "date": "2024-01-15",
  "items": [ /* ItineraryItem 陣列 */ ],
  "notes": "今日行程較鬆散，可依天氣調整順序"
}
```

---

## 2. ItineraryItem（行程項目）

### TypeScript 定義

```typescript
/** 行程項目分類 */
type ItemCategory = 'attraction' | 'restaurant' | 'transport' | 'accommodation';

/** 餐廳時段 */
type MealTime = 'breakfast' | 'lunch' | 'dinner';

/** 預約狀態 */
type ReservationStatus = 'confirmed' | 'pending' | 'not-required';

/** 付款狀態 */
type PaymentStatus = 'paid' | 'pending' | 'on-site';

interface ItineraryItem {
  // ========== 基本資訊 ==========
  /** 唯一識別碼（用於深連結與完成狀態追蹤） */
  id: string;
  
  /** 項目標題 */
  title: string;
  
  /** 分類 */
  category: ItemCategory;
  
  /** 時間段（如：「09:00 - 11:00」） */
  timeSlot?: string;
  
  /** Emoji 圖示（如：🏛️ 🍜 🚆 🏨） */
  emoji?: string;
  
  // ========== 位置相關 ==========
  /** 位置名稱 */
  location?: string;
  
  /** Google Maps 超連結（餐廳建議必填） */
  googleMapsUrl?: string;
  
  // ========== 聯絡資訊 ==========
  /** 聯絡電話（適用餐廳／飯店） */
  phoneNumber?: string;
  
  /** 官網連結 */
  website?: string;
  
  // ========== 時間資訊 ==========
  /** 營業／開放時間（如：「10:00 - 22:00」） */
  openingHours?: string;
  
  /** 入住時間（僅住宿類別） */
  checkInTime?: string;
  
  /** 退房時間（僅住宿類別） */
  checkOutTime?: string;
  
  // ========== 費用相關 ==========
  /** 費用金額 */
  cost?: number;
  
  /** 幣別（預設 TWD） */
  currency?: string;
  
  /** 是否為單人價格 */
  pricePerPerson?: boolean;
  
  /** 付款狀態 */
  paymentStatus?: PaymentStatus;
  
  // ========== 預約資訊 ==========
  /** 預約狀態 */
  reservationStatus?: ReservationStatus;
  
  /** 預約／訂單編號 */
  confirmationNumber?: string;
  
  // ========== 交通細節（僅交通類別） ==========
  /** 交通工具類型（如：「高鐵」、「計程車」） */
  transportType?: string;
  
  /** 車次／班次 */
  ticketNumber?: string;
  
  /** 座位號 */
  seatNumber?: string;
  
  // ========== 住宿細節（僅住宿類別） ==========
  /** 房型（如：「雙人房」、「豪華套房」） */
  roomType?: string;
  
  /** 詳細地址 */
  address?: string;
  
  // ========== 餐廳細節（僅餐廳類別） ==========
  /** 餐廳時段 */
  mealTime?: MealTime;
  
  // ========== 標籤與評分 ==========
  /** 標籤陣列（如：["必訪", "美食推薦", "親子友善"]） */
  tags?: string[];
  
  /** 評分（1-5 星或數值） */
  rating?: number;
  
  /** 評分來源（如：「Google」、「個人」） */
  ratingSource?: string;
  
  // ========== 多媒體與參考 ==========
  /** 圖片 URL */
  imageUrl?: string;
  
  /** 圖片替代文字（無障礙） */
  imageAlt?: string;
  
  /** 參考連結陣列（部落格遊記／訂票網址） */
  referenceLinks?: string[];
  
  // ========== 備註與狀態 ==========
  /** 備註 */
  notes?: string;
  
  /** 是否已完成（本地狀態，不存於 Google Sheet） */
  isCompleted?: boolean;
}
```

### 驗證規則

- `id` 格式建議：`{date}-{category}-{slug}`（如：`2024-01-15-attraction-taipei-101`）
- `title` 必填，最大長度 100 字元
- `category` 必填，僅接受四種分類
- `googleMapsUrl` 若提供，必須為有效 URL（以 `https://` 開頭）
- `cost` 若提供，必須為非負數
- `currency` 預設 `TWD`，可選：`JPY`, `USD`, `EUR`, `CNY` 等
- `rating` 若提供，範圍 1-5（含小數點）
- `tags` 陣列元素最大長度 20 字元，最多 10 個標籤
- `mealTime` 僅在 `category === 'restaurant'` 時有效

### 範例

```json
{
  "id": "2024-01-15-restaurant-din-tai-fung",
  "title": "鼎泰豐（信義店）",
  "category": "restaurant",
  "timeSlot": "12:00 - 13:30",
  "emoji": "🥟",
  "location": "台北市信義區",
  "googleMapsUrl": "https://maps.google.com/?q=鼎泰豐信義店",
  "phoneNumber": "+886-2-2345-6789",
  "openingHours": "11:00 - 21:00",
  "cost": 800,
  "currency": "TWD",
  "pricePerPerson": true,
  "mealTime": "lunch",
  "tags": ["美食推薦", "米其林必比登"],
  "rating": 4.5,
  "ratingSource": "Google",
  "imageUrl": "https://example.com/dintaifung.jpg",
  "imageAlt": "鼎泰豐小籠包",
  "notes": "建議提前預約，尖峰時段需排隊 30 分鐘以上",
  "isCompleted": false
}
```

---

## 3. TravelInfo（旅遊資訊）

### TypeScript 定義

```typescript
interface TravelInfo {
  /** 所有旅遊資訊項目 */
  items: InfoItem[];
  
  /** 最後更新時間（ISO 8601 格式） */
  lastUpdated: string;
}
```

### 驗證規則

- `items` 陣列可為空（表示無旅遊資訊）
- `lastUpdated` 必須符合 ISO 8601 格式（YYYY-MM-DDTHH:mm:ssZ）

### 範例

```json
{
  "items": [ /* InfoItem 陣列 */ ],
  "lastUpdated": "2024-01-10T15:30:00Z"
}
```

---

## 4. InfoItem（旅遊資訊項目）

### TypeScript 定義

```typescript
/** 旅遊資訊分類 */
type InfoCategory = 'packing' | 'notes' | 'emergency' | 'budget' | 'other';

/** 物品優先級（僅攜帶物品分類） */
type Priority = 'must-have' | 'recommended' | 'optional';

interface InfoItem {
  // ========== 基本資訊 ==========
  /** 唯一識別碼（用於物品清單勾選狀態追蹤） */
  id: string;
  
  /** 項目標題 */
  title: string;
  
  /** 分類 */
  category: InfoCategory;
  
  /** 內容描述 */
  content: string;
  
  /** Emoji 圖示 */
  emoji?: string;
  
  // ========== 物品清單專屬（僅 packing 分類） ==========
  /** 是否已準備（本地狀態，不存於 Google Sheet） */
  isPacked?: boolean;
  
  /** 數量（如：「2 件」） */
  quantity?: string;
  
  /** 優先級 */
  priority?: Priority;
  
  // ========== 聯絡資訊專屬（僅 emergency 分類） ==========
  /** 聯絡人姓名 */
  contactName?: string;
  
  /** 聯絡電話 */
  phoneNumber?: string;
  
  /** 關係（如：「旅伴」、「當地導遊」） */
  relationship?: string;
  
  // ========== 預算專屬（僅 budget 分類） ==========
  /** 預算金額 */
  amount?: number;
  
  /** 幣別（預設 TWD） */
  currency?: string;
  
  /** 預算類別（如：「交通」、「住宿」、「餐飲」） */
  budgetCategory?: string;
  
  // ========== 多媒體與參考 ==========
  /** 圖片 URL */
  imageUrl?: string;
  
  /** 參考連結陣列 */
  referenceLinks?: string[];
  
  // ========== 備註與排序 ==========
  /** 備註 */
  notes?: string;
  
  /** 排序權重（數值越小越前） */
  sortOrder?: number;
}
```

### 驗證規則

- `id` 格式建議：`{category}-{slug}`（如：`packing-passport`, `emergency-hotel`）
- `title` 必填，最大長度 100 字元
- `category` 必填，僅接受五種分類
- `content` 必填，最大長度 1000 字元
- `priority` 僅在 `category === 'packing'` 時有效
- `contactName`, `phoneNumber`, `relationship` 僅在 `category === 'emergency'` 時有效
- `amount`, `currency`, `budgetCategory` 僅在 `category === 'budget'` 時有效
- `sortOrder` 預設為 999（最後）

### 範例

```json
{
  "id": "packing-passport",
  "title": "護照",
  "category": "packing",
  "content": "確認有效期限需大於 6 個月",
  "emoji": "📘",
  "isPacked": true,
  "quantity": "1 本",
  "priority": "must-have",
  "notes": "放於隨身包，勿託運",
  "sortOrder": 1
}
```

---

## 欄位映射表（Google Sheet ↔ 前端）

### 行程工作表（Sheet: 「行程」）

| Google Sheet 欄位名稱 | TypeScript 屬性 | 必填 | 預設值 | 備註 |
|---------------------|----------------|------|--------|------|
| `日期` / `date` | `date` | ✅ | - | YYYY-MM-DD |
| `標題` / `title` | `title` | ✅ | - | - |
| `分類` / `category` | `category` | ✅ | - | 中文映射：景點=attraction, 餐廳=restaurant, 交通=transport, 住宿=accommodation |
| `時間段` / `timeSlot` | `timeSlot` | ❌ | - | - |
| `Emoji` / `emoji` | `emoji` | ❌ | 依分類預設 | 🏛️🍜🚆🏨 |
| `位置` / `location` | `location` | ❌ | - | - |
| `Google地圖` / `googleMapsUrl` | `googleMapsUrl` | ❌ | - | 完整 URL |
| `電話` / `phoneNumber` | `phoneNumber` | ❌ | - | - |
| `官網` / `website` | `website` | ❌ | - | - |
| `營業時間` / `openingHours` | `openingHours` | ❌ | - | - |
| `入住時間` / `checkInTime` | `checkInTime` | ❌ | - | - |
| `退房時間` / `checkOutTime` | `checkOutTime` | ❌ | - | - |
| `費用` / `cost` | `cost` | ❌ | - | 數值 |
| `幣別` / `currency` | `currency` | ❌ | TWD | - |
| `單人價` / `pricePerPerson` | `pricePerPerson` | ❌ | false | 是/否 映射為 true/false |
| `付款狀態` / `paymentStatus` | `paymentStatus` | ❌ | - | 已付款=paid, 待付款=pending, 現場付款=on-site |
| `預約狀態` / `reservationStatus` | `reservationStatus` | ❌ | - | 已預約=confirmed, 待預約=pending, 免預約=not-required |
| `預約編號` / `confirmationNumber` | `confirmationNumber` | ❌ | - | - |
| `交通工具` / `transportType` | `transportType` | ❌ | - | - |
| `車次` / `ticketNumber` | `ticketNumber` | ❌ | - | - |
| `座位` / `seatNumber` | `seatNumber` | ❌ | - | - |
| `房型` / `roomType` | `roomType` | ❌ | - | - |
| `地址` / `address` | `address` | ❌ | - | - |
| `餐廳時段` / `mealTime` | `mealTime` | ❌ | - | 早餐=breakfast, 午餐=lunch, 晚餐=dinner |
| `標籤` / `tags` | `tags` | ❌ | [] | 逗號分隔（如：「必訪,美食推薦」） |
| `評分` / `rating` | `rating` | ❌ | - | 數值 1-5 |
| `評分來源` / `ratingSource` | `ratingSource` | ❌ | - | - |
| `圖片` / `imageUrl` | `imageUrl` | ❌ | - | 完整 URL |
| `圖片說明` / `imageAlt` | `imageAlt` | ❌ | - | - |
| `參考連結` / `referenceLinks` | `referenceLinks` | ❌ | [] | 逗號分隔 URL |
| `備註` / `notes` | `notes` | ❌ | - | - |

### 旅遊資訊工作表（Sheet: 「旅遊資訊」）

| Google Sheet 欄位名稱 | TypeScript 屬性 | 必填 | 預設值 | 備註 |
|---------------------|----------------|------|--------|------|
| `標題` / `title` | `title` | ✅ | - | - |
| `分類` / `category` | `category` | ✅ | - | 中文映射：攜帶物品=packing, 注意事項=notes, 緊急聯絡=emergency, 預算=budget, 其他=other |
| `內容` / `content` | `content` | ✅ | - | - |
| `Emoji` / `emoji` | `emoji` | ❌ | - | - |
| `數量` / `quantity` | `quantity` | ❌ | - | - |
| `優先級` / `priority` | `priority` | ❌ | - | 必備=must-have, 建議=recommended, 可選=optional |
| `聯絡人` / `contactName` | `contactName` | ❌ | - | - |
| `電話` / `phoneNumber` | `phoneNumber` | ❌ | - | - |
| `關係` / `relationship` | `relationship` | ❌ | - | - |
| `金額` / `amount` | `amount` | ❌ | - | 數值 |
| `幣別` / `currency` | `currency` | ❌ | TWD | - |
| `預算類別` / `budgetCategory` | `budgetCategory` | ❌ | - | - |
| `圖片` / `imageUrl` | `imageUrl` | ❌ | - | 完整 URL |
| `參考連結` / `referenceLinks` | `referenceLinks` | ❌ | [] | 逗號分隔 URL |
| `備註` / `notes` | `notes` | ❌ | - | - |
| `排序` / `sortOrder` | `sortOrder` | ❌ | 999 | 數值 |

---

## 欄位映射邏輯

### 中英文欄位名稱兼容

系統支援以下欄位名稱映射策略（按優先順序）：

1. **英文欄位名稱**（如：`title`, `category`, `cost`）
2. **中文欄位名稱**（如：`標題`, `分類`, `費用`）
3. **大小寫不敏感**（如：`Title`, `TITLE`, `title` 皆可）
4. **忽略前後空白**（如：` 標題 ` → `標題`）

### 中文分類映射

| 中文 | 英文 |
|------|------|
| 景點 | attraction |
| 餐廳 | restaurant |
| 交通 | transport |
| 住宿 | accommodation |
| 攜帶物品 | packing |
| 注意事項 | notes |
| 緊急聯絡 | emergency |
| 預算 | budget |
| 其他 | other |

### 布林值映射

| Google Sheet 值 | TypeScript 值 |
|-----------------|---------------|
| `是` / `Yes` / `TRUE` / `1` | `true` |
| `否` / `No` / `FALSE` / `0` / 空白 | `false` |

### 陣列欄位解析

- **分隔符號**：逗號（`,`）
- **範例**：`必訪,美食推薦,親子友善` → `["必訪", "美食推薦", "親子友善"]`
- **容錯處理**：忽略前後空白、空值（如：`必訪, ,美食推薦` → `["必訪", "美食推薦"]`）

---

## 容錯策略

### 未知欄位處理

- **策略**：忽略未知欄位並記錄告警（Console Warning）
- **範例**：Google Sheet 新增 `新欄位` 欄位 → 解析時忽略，不影響其他資料

### 必填欄位缺失

- **行為**：記錄錯誤（Console Error）並標記該筆資料為無效
- **範例**：行程項目缺少 `title` → 該項目不顯示，其他項目正常顯示

### 型別錯誤

- **行為**：嘗試轉換，失敗則使用預設值並記錄告警
- **範例**：
  - `cost` 欄位為非數值 → 解析為 `undefined`
  - `rating` 欄位為 `6` → 解析為 `5`（限制範圍 1-5）

---

## 本地狀態管理（LocalStorage Schema）

### 儲存結構

```json
{
  "travelGuide": {
    "version": "v1.0.0",
    "completed": {
      "2024-01-15-restaurant-din-tai-fung": true,
      "2024-01-16-attraction-taipei-101": false
    },
    "packed": {
      "packing-passport": true,
      "packing-camera": false
    },
    "cacheMetadata": {
      "lastUpdate": "2024-01-15T10:30:00Z",
      "fieldMappingVersion": "v1.0.0",
      "sheetIds": {
        "itinerary": 0,
        "travelInfo": 123456
      }
    }
  }
}
```

### 鍵名規則

- **完成狀態鍵**：`completed.{itineraryItem.id}`
- **物品清單鍵**：`packed.{infoItem.id}`
- **快取元資料**：`cacheMetadata`

---

## 版本升級策略

### 欄位新增（向後相容）

- **行為**：舊版本資料不受影響，新欄位預設值為 `undefined`
- **範例**：v1.1.0 新增 `accessibility` 欄位 → v1.0.0 資料仍可正常顯示

### 欄位重新命名（不相容變更）

- **行為**：更新欄位映射表版本號（如：v1.0.0 → v2.0.0），提供遷移指南
- **範例**：`費用` 重新命名為 `價格` → 更新映射表，保留兩者相容性

### 欄位刪除（不相容變更）

- **行為**：標記為 Deprecated，至少保留一個版本週期（6 個月），後續移除
- **範例**：v1.0.0 標記 `oldField` 為 Deprecated → v2.0.0 移除

---

**資料模型版本**: v1.0.0  
**下一步**: 產出 contracts/ 資料夾（Google Sheet CSV 結構範例與前端介面合約）
