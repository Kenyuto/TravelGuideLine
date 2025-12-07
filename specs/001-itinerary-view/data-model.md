# Data Model

> **Phase 1 Output**: 本文件定義所有資料實體、TypeScript 介面、驗證規則與欄位映射。

## Feature Context

- **Feature**: 旅遊行程檢視網站（含登入驗證）
- **Branch**: 001-itinerary-view
- **Specification**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)

---

## Entity Relationship Overview

```
┌─────────────┐
│ AuthConfig  │  (登入設定)
│ ├── items[]│──┐
└─────────────┘  │
                 ▼
            ┌──────────┐
            │ AuthItem │  (單一密碼設定)
            └──────────┘

┌──────────────┐
│ ItineraryDay │  (單日行程)
│ ├── items[]  │──┐
└──────────────┘  │
                  ▼
            ┌───────────────┐
            │ ItineraryItem │  (行程項目)
            └───────────────┘

┌─────────────┐
│ TravelInfo  │  (旅遊資訊集合)
│ ├── items[] │──┐
└─────────────┘  │
                 ▼
            ┌──────────┐
            │ InfoItem │  (資訊項目)
            └──────────┘
```

**關聯說明**:
- `AuthConfig` → `AuthItem[]`: 一對多（一個設定包含多組密碼）
- `ItineraryDay` → `ItineraryItem[]`: 一對多（一天包含多個行程項目）
- `TravelInfo` → `InfoItem[]`: 一對多（一個集合包含多個資訊項目）

---

## 1. AuthConfig (登入設定)

### Purpose
管理所有可用密碼與其有效期限，支援多密碼機制（FR-022）與密碼過期（FR-026）。

### TypeScript Interface

```typescript
/**
 * 登入驗證設定
 * 從 Google Sheet「登入設定」tab 載入
 */
interface AuthConfig {
  /** 密碼清單 */
  items: AuthItem[];
  
  /** 最後更新時間（用於快取驗證） */
  lastUpdated: Date;
  
  /** 資料版本（未來遷移用） */
  version: string; // e.g., '1.0.0'
}
```

### Validation Rules

| 規則 | 描述 | 錯誤處理 |
|------|------|---------|
| `items` 非空 | 至少需要 1 個 AuthItem | 顯示「登入設定錯誤：未設定密碼」|
| `items` 至少 1 個有效 | `items.filter(i => i.isValid).length >= 1` | 顯示「所有密碼已過期，請聯絡管理員」|
| `lastUpdated` 有效日期 | 可解析為 Date 物件 | 使用當前時間作為 fallback |

### Default Value

```typescript
const defaultAuthConfig: AuthConfig = {
  items: [],
  lastUpdated: new Date(),
  version: '1.0.0'
};
```

---

## 2. AuthItem (單一密碼設定)

### Purpose
表示單一可用密碼及其詳細資訊（說明文字、有效期限）。

### TypeScript Interface

```typescript
/**
 * 單一密碼項目
 */
interface AuthItem {
  /** 密碼（明文或 SHA-256 hash） */
  password: string;
  
  /** 
   * 密碼用途說明（選填）
   * 範例："家人共用"、"朋友查看"
   */
  description?: string;
  
  /** 
   * 有效期限（選填，YYYY-MM-DD 格式）
   * 未設定則永久有效
   */
  expiryDate?: string;
  
  /** 
   * 是否有效（計算屬性）
   * 邏輯：!expiryDate || new Date(expiryDate) >= new Date()
   */
  isValid: boolean;
}
```

### Validation Rules

| 欄位 | 規則 | 錯誤處理 |
|------|------|---------|
| `password` | 非空字串，長度 >= 1 | 跳過該 AuthItem |
| `expiryDate` | 可選，格式 YYYY-MM-DD，需為有效日期 | 格式錯誤視為永久有效 |
| `isValid` | 自動計算，不由使用者輸入 | N/A |

### Computed Property: `isValid`

```typescript
function computeIsValid(authItem: AuthItem): boolean {
  if (!authItem.expiryDate) return true; // 未設定有效期限，永久有效
  
  const expiryDate = new Date(authItem.expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 重設為當天 00:00
  
  return expiryDate >= today;
}
```

### Google Sheet Column Mapping

| Google Sheet 欄位 | TypeScript 欄位 | 範例值 |
|------------------|----------------|--------|
| 密碼 | `password` | `TravelGroup2024` |
| 說明文字 | `description` | `家人共用` |
| 有效期限 | `expiryDate` | `2024-12-31` |

---

## 3. ItineraryDay (單日行程)

### Purpose
表示某一天的完整行程，包含多個 ItineraryItem（行程項目）。

### TypeScript Interface

```typescript
/**
 * 單日行程
 */
interface ItineraryDay {
  /** 日期（YYYY-MM-DD 格式） */
  date: string;
  
  /** 該日所有行程項目 */
  items: ItineraryItem[];
  
  /** 
   * 該日備註（選填）
   * 範例："自由活動日"、"早班飛機，提早出發"
   */
  notes?: string;
  
  /** 
   * 計算屬性：該日總花費
   * 邏輯：items.reduce((sum, item) => sum + (item.cost || 0), 0)
   */
  totalCost: number;
  
  /** 
   * 計算屬性：該日已完成項目數
   * 邏輯：items.filter(item => item.isCompleted).length
   */
  completedCount: number;
}
```

### Validation Rules

| 欄位 | 規則 | 錯誤處理 |
|------|------|---------|
| `date` | 格式 YYYY-MM-DD，需為有效日期 | 跳過該 ItineraryDay |
| `items` | 可為空陣列（該日無行程） | 顯示「該日無行程」|
| `totalCost` | 自動計算，不由使用者輸入 | N/A |
| `completedCount` | 自動計算，不由使用者輸入 | N/A |

### Default Value

```typescript
const emptyItineraryDay: ItineraryDay = {
  date: new Date().toISOString().split('T')[0],
  items: [],
  notes: undefined,
  totalCost: 0,
  completedCount: 0
};
```

---

## 4. ItineraryItem (行程項目)

### Purpose
表示單一行程項目，包含標題、時間、地點、花費、標籤等詳細資訊（FR-001）。

### TypeScript Interface

```typescript
/**
 * 行程項目
 */
interface ItineraryItem {
  /** 唯一識別碼（UUID v4） */
  id: string;
  
  /** 日期（YYYY-MM-DD 格式） */
  date: string;
  
  /** 標題（必填） */
  title: string;
  
  /** 
   * 類別（選填）
   * 常見值："交通"、"景點"、"美食"、"住宿"、"購物"
   */
  category?: string;
  
  /** 
   * 時間（選填，HH:mm 格式）
   * 範例："09:30"、"14:00"
   */
  time?: string;
  
  /** 地點名稱（選填） */
  location?: string;
  
  /** 
   * Google Maps 連結（選填）
   * 範例："https://maps.google.com/?q=台北101"
   */
  mapLink?: string;
  
  /** 花費（選填，數字，單位：當地貨幣） */
  cost?: number;
  
  /** 
   * 幣別（選填）
   * 範例："TWD"、"JPY"、"USD"
   */
  currency?: string;
  
  /** 說明（選填） */
  description?: string;
  
  /** 
   * 連結（選填，多個連結以逗號分隔）
   * 範例："https://example.com,https://booking.com/123"
   */
  links?: string;
  
  /** 
   * 標籤（選填，多個標籤以逗號分隔）
   * 範例："親子友善,室內,雨天備案"
   */
  tags?: string;
  
  /** 備註（選填） */
  notes?: string;
  
  /** 
   * 是否已完成（LocalStorage 狀態）
   * 預設 false
   */
  isCompleted: boolean;
  
  /** 
   * 計算屬性：是否為今日行程
   * 邏輯：date === new Date().toISOString().split('T')[0]
   */
  isToday: boolean;
  
  /** 
   * 計算屬性：標籤陣列
   * 邏輯：tags?.split(',').map(t => t.trim()).filter(Boolean) || []
   */
  tagList: string[];
}
```

### Validation Rules

| 欄位 | 規則 | 錯誤處理 |
|------|------|---------|
| `id` | 非空 UUID v4 | 自動生成新 UUID |
| `date` | 格式 YYYY-MM-DD，需為有效日期 | 跳過該項目 |
| `title` | 非空字串 | 顯示「行程標題不可為空」|
| `time` | 可選，格式 HH:mm (24 小時制) | 格式錯誤視為空 |
| `cost` | 可選，數字 >= 0 | 負數視為 0 |
| `mapLink` | 可選，需為有效 URL (http/https) | 格式錯誤視為空 |
| `links` | 可選，多個 URL 以逗號分隔 | 跳過無效 URL |
| `tags` | 可選，多個文字以逗號分隔 | 移除空白標籤 |

### Computed Properties

```typescript
// isToday
function computeIsToday(item: ItineraryItem): boolean {
  const today = new Date().toISOString().split('T')[0];
  return item.date === today;
}

// tagList
function computeTagList(item: ItineraryItem): string[] {
  if (!item.tags) return [];
  return item.tags
    .split(',')
    .map(tag => tag.trim())
    .filter(tag => tag.length > 0);
}
```

### Google Sheet Column Mapping

| Google Sheet 欄位 | TypeScript 欄位 | 範例值 |
|------------------|----------------|--------|
| 日期 | `date` | `2024-01-15` |
| 標題 | `title` | `台北101觀景台` |
| 類別 | `category` | `景點` |
| 時間 | `time` | `14:00` |
| 地點 | `location` | `台北101` |
| Google Maps | `mapLink` | `https://maps.google.com/?q=...` |
| 花費 | `cost` | `600` |
| 幣別 | `currency` | `TWD` |
| 說明 | `description` | `89樓觀景台，建議晴天前往` |
| 連結 | `links` | `https://taipei-101.com.tw` |
| 標籤 | `tags` | `親子友善,室內` |
| 備註 | `notes` | `提前線上購票可省時間` |

**注意事項**:
- `id` 由前端自動生成（UUID v4），Google Sheet 不需此欄位
- `isCompleted` 狀態儲存於 LocalStorage（key: `completedItems`），格式：`{ [itemId]: boolean }`

---

## 5. TravelInfo (旅遊資訊集合)

### Purpose
管理所有旅遊資訊項目（住宿、交通票券、緊急聯絡等），來自 Google Sheet「旅遊資訊」tab（FR-009）。

### TypeScript Interface

```typescript
/**
 * 旅遊資訊集合
 */
interface TravelInfo {
  /** 所有資訊項目 */
  items: InfoItem[];
  
  /** 最後更新時間 */
  lastUpdated: Date;
  
  /** 
   * 計算屬性：所有類別清單
   * 邏輯：[...new Set(items.map(i => i.category).filter(Boolean))]
   */
  categories: string[];
  
  /** 
   * 計算屬性：已打包項目數（category="打包清單"且isPacked=true）
   * 邏輯：items.filter(i => i.category === '打包清單' && i.isPacked).length
   */
  packedCount: number;
}
```

### Validation Rules

| 欄位 | 規則 | 錯誤處理 |
|------|------|---------|
| `items` | 可為空陣列（尚未設定資訊） | 顯示「尚未建立旅遊資訊」|
| `lastUpdated` | 有效 Date 物件 | 使用當前時間作為 fallback |
| `categories` | 自動計算，不由使用者輸入 | N/A |
| `packedCount` | 自動計算，不由使用者輸入 | N/A |

### Default Value

```typescript
const defaultTravelInfo: TravelInfo = {
  items: [],
  lastUpdated: new Date(),
  categories: [],
  packedCount: 0
};
```

---

## 6. InfoItem (資訊項目)

### Purpose
表示單一旅遊資訊項目，支援多種類別（住宿、交通、打包清單、緊急聯絡等）與彈性欄位。

### TypeScript Interface

```typescript
/**
 * 旅遊資訊項目
 */
interface InfoItem {
  /** 唯一識別碼（UUID v4） */
  id: string;
  
  /** 標題（必填） */
  title: string;
  
  /** 
   * 類別（必填）
   * 常見值："住宿"、"交通票券"、"打包清單"、"緊急聯絡"、"注意事項"
   */
  category: string;
  
  /** 內容說明（選填） */
  content?: string;
  
  /** 
   * 是否已打包（僅 category="打包清單"適用，LocalStorage 狀態）
   * 預設 false
   */
  isPacked?: boolean;
  
  /** 數量（選填，用於打包清單） */
  amount?: number;
  
  /** 聯絡人姓名（選填，用於緊急聯絡） */
  contactName?: string;
  
  /** 電話號碼（選填，用於緊急聯絡） */
  phone?: string;
  
  /** 地址（選填，用於住宿） */
  address?: string;
  
  /** 連結（選填，多個連結以逗號分隔） */
  links?: string;
  
  /** 備註（選填） */
  notes?: string;
  
  /** 
   * 計算屬性：連結陣列
   * 邏輯：links?.split(',').map(l => l.trim()).filter(Boolean) || []
   */
  linkList: string[];
}
```

### Validation Rules

| 欄位 | 規則 | 錯誤處理 |
|------|------|---------|
| `id` | 非空 UUID v4 | 自動生成新 UUID |
| `title` | 非空字串 | 顯示「標題不可為空」|
| `category` | 非空字串 | 使用「其他」作為預設類別 |
| `amount` | 可選，數字 >= 0 | 負數視為 0 |
| `phone` | 可選，需符合國際電話格式（允許 +、-、空格、數字） | 格式錯誤保留原值（顯示警告） |
| `links` | 可選，多個 URL 以逗號分隔 | 跳過無效 URL |

### Computed Properties

```typescript
// linkList
function computeLinkList(item: InfoItem): string[] {
  if (!item.links) return [];
  return item.links
    .split(',')
    .map(link => link.trim())
    .filter(link => link.length > 0);
}
```

### Google Sheet Column Mapping (彈性結構)

**基礎欄位** (所有類別共用):

| Google Sheet 欄位 | TypeScript 欄位 | 範例值 |
|------------------|----------------|--------|
| 標題 | `title` | `東京希爾頓飯店` |
| 類別 | `category` | `住宿` |
| 內容 | `content` | `位於新宿，交通便利` |
| 連結 | `links` | `https://hilton.com/tokyo` |
| 備註 | `notes` | `已付款，確認信在信箱` |

**類別專屬欄位**:

| 類別 | 專屬欄位 (Google Sheet) | TypeScript 欄位 | 範例值 |
|------|----------------------|----------------|--------|
| 住宿 | 地址 | `address` | `東京都新宿區西新宿6-6-2` |
| 打包清單 | 數量 | `amount` | `2` |
| 緊急聯絡 | 聯絡人姓名 | `contactName` | `王小明` |
| 緊急聯絡 | 電話 | `phone` | `+886-912-345-678` |

**注意事項**:
- `id` 由前端自動生成（UUID v4），Google Sheet 不需此欄位
- `isPacked` 狀態儲存於 LocalStorage（key: `packedItems`），格式：`{ [itemId]: boolean }`
- Google Sheet 可包含任意額外欄位（如「價格」、「預訂日期」），前端解析時保留於 `content` 或忽略

---

## LocalStorage Schema

### 1. authState (登入驗證狀態)

**Key**: `authState`

**Value** (JSON):
```typescript
interface AuthState {
  /** 是否已登入 */
  isAuthenticated: boolean;
  
  /** 登入時間戳（Unix timestamp, milliseconds） */
  authTimestamp: number;
  
  /** 版本號（未來遷移用） */
  version: string; // '1.0.0'
}
```

**範例**:
```json
{
  "isAuthenticated": true,
  "authTimestamp": 1704441600000,
  "version": "1.0.0"
}
```

**Lifecycle**:
- **寫入**: 登入成功時（validatePassword 通過）
- **讀取**: 每次頁面載入時檢查 `isLoginValid()`
- **刪除**: 登出時 或 7 天後自動失效

---

### 2. completedItems (行程完成狀態)

**Key**: `completedItems`

**Value** (JSON):
```typescript
type CompletedItems = Record<string, boolean>;
// { [itemId]: true/false }
```

**範例**:
```json
{
  "550e8400-e29b-41d4-a716-446655440000": true,
  "6ba7b810-9dad-11d1-80b4-00c04fd430c8": false
}
```

**Lifecycle**:
- **寫入**: 使用者標記行程完成/未完成時
- **讀取**: 載入行程時合併狀態（item.isCompleted = completedItems[item.id] || false）
- **清理**: 手動清除（設定頁面「重設完成狀態」按鈕）

---

### 3. packedItems (打包清單狀態)

**Key**: `packedItems`

**Value** (JSON):
```typescript
type PackedItems = Record<string, boolean>;
// { [itemId]: true/false }
```

**範例**:
```json
{
  "7c9e6679-7425-40de-944b-e07fc1f90ae7": true,
  "9a0b5e48-38b1-4f94-9c3e-3a7d8e8c3d1e": false
}
```

**Lifecycle**:
- **寫入**: 使用者標記打包項目已完成/未完成時
- **讀取**: 載入旅遊資訊時合併狀態（item.isPacked = packedItems[item.id] || false）
- **清理**: 手動清除（設定頁面「重設打包狀態」按鈕）

---

## Field Mapping Summary

### CSV Column → TypeScript Field Mapping Table

#### 行程 (Itinerary)

| CSV 欄位 | TS 欄位 | 型別 | 必填 | 預設值 |
|---------|--------|------|-----|-------|
| 日期 | `date` | string | ✅ | N/A |
| 標題 | `title` | string | ✅ | N/A |
| 類別 | `category` | string? | ❌ | undefined |
| 時間 | `time` | string? | ❌ | undefined |
| 地點 | `location` | string? | ❌ | undefined |
| Google Maps | `mapLink` | string? | ❌ | undefined |
| 花費 | `cost` | number? | ❌ | undefined |
| 幣別 | `currency` | string? | ❌ | undefined |
| 說明 | `description` | string? | ❌ | undefined |
| 連結 | `links` | string? | ❌ | undefined |
| 標籤 | `tags` | string? | ❌ | undefined |
| 備註 | `notes` | string? | ❌ | undefined |

#### 旅遊資訊 (TravelInfo)

| CSV 欄位 | TS 欄位 | 型別 | 必填 | 預設值 |
|---------|--------|------|-----|-------|
| 標題 | `title` | string | ✅ | N/A |
| 類別 | `category` | string | ✅ | '其他' |
| 內容 | `content` | string? | ❌ | undefined |
| 數量 | `amount` | number? | ❌ | undefined |
| 聯絡人姓名 | `contactName` | string? | ❌ | undefined |
| 電話 | `phone` | string? | ❌ | undefined |
| 地址 | `address` | string? | ❌ | undefined |
| 連結 | `links` | string? | ❌ | undefined |
| 備註 | `notes` | string? | ❌ | undefined |

#### 登入設定 (AuthConfig)

| CSV 欄位 | TS 欄位 | 型別 | 必填 | 預設值 |
|---------|--------|------|-----|-------|
| 密碼 | `password` | string | ✅ | N/A |
| 說明文字 | `description` | string? | ❌ | undefined |
| 有效期限 | `expiryDate` | string? | ❌ | undefined |

---

## Versioning & Migration Strategy

### Current Version: 1.0.0

**Schema Stability**:
- ✅ 所有實體欄位向後相容（新增欄位不影響舊資料）
- ✅ LocalStorage 包含 `version` 欄位，支援未來遷移

**Breaking Changes Policy** (Constitution V. Simplicity):
- **Minor Version** (1.x.0): 新增選填欄位 → 無需遷移
- **Major Version** (2.0.0): 修改必填欄位/移除欄位 → 需遷移腳本
- **Migration Guide**: 包含於 `docs/migration/` 目錄，說明手動步驟

**Example Migration (未來 2.0.0)**:
```typescript
// 假設 2.0.0 新增必填欄位 ItineraryItem.priority
function migrateFrom1to2(oldItem: ItineraryItem): ItineraryItemV2 {
  return {
    ...oldItem,
    priority: 'normal' // 預設值
  };
}
```

---

## Next Steps

Phase 1 設計持續進行：
1. ✅ Generate contracts/google-sheet-csv.md（定義 3 個工作表的詳細結構）
2. ✅ Generate contracts/frontend-api.md（定義 4 個 Pinia stores + 元件合約）
3. ✅ Generate quickstart.md（開發環境設定指南）
4. ✅ Re-validate Constitution Check（Phase 1 設計後重新檢查）

**Note**: 本 data-model.md 完成後，所有 TypeScript 介面可直接複製至 `src/types/` 目錄使用。
