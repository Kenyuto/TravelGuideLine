# Google Sheet CSV Contract

> **Phase 1 Output**: 本文件定義 Google Sheets 資料結構、CSV 匯出格式與合約測試。

## Contract Overview

**Data Source**: Google Sheets (單一 spreadsheet，多個 worksheets)  
**Export Format**: CSV (使用 `/export?format=csv&gid={GID}`)  
**Parser**: PapaParse 5.x  
**References**: [research.md](../research.md), [data-model.md](../data-model.md)

---

## Worksheet Structure

### Overview

| 工作表名稱 | GID | 用途 | 欄位數 | 更新頻率 |
|-----------|-----|------|-------|---------|
| 行程 | 0 | 每日行程項目 | 12 | 規劃階段頻繁 |
| 旅遊資訊 | 1 | 住宿/交通/打包清單等 | 9+ | 規劃階段中等 |
| 登入設定 | 2 | 密碼與有效期限 | 3 | 首次設定 + 偶爾更新 |

**CSV Export URL Format**:
```
https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
```

---

## 1. 行程 (Itinerary) - GID 0

### Purpose
儲存每日行程項目，包含時間、地點、花費、標籤等詳細資訊。

### Column Definition

| 欄位名稱 | 型別 | 必填 | 格式 | 範例 | 說明 |
|---------|------|-----|------|------|------|
| 日期 | Date | ✅ | YYYY-MM-DD | `2024-01-15` | 行程日期 |
| 標題 | Text | ✅ | - | `台北101觀景台` | 行程項目名稱 |
| 類別 | Text | ❌ | - | `景點` | 常見值：交通/景點/美食/住宿/購物 |
| 時間 | Time | ❌ | HH:mm | `14:00` | 24 小時制 |
| 地點 | Text | ❌ | - | `台北101` | 地點名稱 |
| Google Maps | URL | ❌ | http(s):// | `https://maps.google.com/?q=...` | Google Maps 連結 |
| 花費 | Number | ❌ | >= 0 | `600` | 金額（不含千分位符號） |
| 幣別 | Text | ❌ | ISO 4217 | `TWD` | 貨幣代碼 |
| 說明 | Text | ❌ | - | `89樓觀景台，建議晴天前往` | 詳細說明 |
| 連結 | Text | ❌ | URL,URL | `https://taipei-101.com.tw` | 多個連結以逗號分隔 |
| 標籤 | Text | ❌ | Tag,Tag | `親子友善,室內` | 多個標籤以逗號分隔 |
| 備註 | Text | ❌ | - | `提前線上購票可省時間` | 額外備註 |

### CSV Example

```csv
日期,標題,類別,時間,地點,Google Maps,花費,幣別,說明,連結,標籤,備註
2024-01-15,台北101觀景台,景點,14:00,台北101,https://maps.google.com/?q=台北101,600,TWD,89樓觀景台，建議晴天前往,https://taipei-101.com.tw,親子友善,室內,提前線上購票可省時間
2024-01-15,鼎泰豐信義店,美食,12:00,信義區,https://maps.google.com/?q=鼎泰豐信義,800,TWD,小籠包必點,https://dintaifung.com.tw,美食推薦,現場排隊,建議11:30前抵達避開人潮
2024-01-16,故宮博物院,景點,10:00,士林區,https://maps.google.com/?q=故宮,350,TWD,中華文化寶庫,https://www.npm.gov.tw,文化,室內,週一休館
```

### Parsing Logic (PapaParse)

```typescript
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

interface RawItineraryRow {
  '日期': string;
  '標題': string;
  '類別'?: string;
  '時間'?: string;
  '地點'?: string;
  'Google Maps'?: string;
  '花費'?: string;
  '幣別'?: string;
  '說明'?: string;
  '連結'?: string;
  '標籤'?: string;
  '備註'?: string;
}

function parseItinerary(csvData: string): ItineraryItem[] {
  const result = Papa.parse<RawItineraryRow>(csvData, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(), // 移除空白
  });

  return result.data
    .filter(row => row['日期'] && row['標題']) // 過濾無效列
    .map(row => ({
      id: uuidv4(),
      date: row['日期'],
      title: row['標題'],
      category: row['類別'] || undefined,
      time: row['時間'] || undefined,
      location: row['地點'] || undefined,
      mapLink: row['Google Maps'] || undefined,
      cost: row['花費'] ? parseFloat(row['花費']) : undefined,
      currency: row['幣別'] || undefined,
      description: row['說明'] || undefined,
      links: row['連結'] || undefined,
      tags: row['標籤'] || undefined,
      notes: row['備註'] || undefined,
      isCompleted: false, // 預設未完成，稍後從 LocalStorage 合併
      isToday: false, // 計算屬性，稍後設定
      tagList: [], // 計算屬性，稍後設定
    }));
}
```

### Contract Tests

```typescript
describe('Google Sheet CSV - 行程', () => {
  test('正常解析包含所有欄位的 CSV', () => {
    const csv = `日期,標題,類別,時間,地點,Google Maps,花費,幣別,說明,連結,標籤,備註
2024-01-15,台北101,景點,14:00,台北101,https://maps.google.com,600,TWD,觀景台,https://taipei-101.com.tw,親子,提前購票`;
    
    const items = parseItinerary(csv);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      date: '2024-01-15',
      title: '台北101',
      category: '景點',
      time: '14:00',
      cost: 600,
      currency: 'TWD',
    });
  });

  test('跳過空白列與缺少必填欄位的列', () => {
    const csv = `日期,標題
2024-01-15,台北101

,無日期
2024-01-16,`;
    
    const items = parseItinerary(csv);
    expect(items).toHaveLength(1); // 僅第一列有效
    expect(items[0].title).toBe('台北101');
  });

  test('選填欄位為空時應為 undefined', () => {
    const csv = `日期,標題,類別,時間
2024-01-15,台北101,,`;
    
    const items = parseItinerary(csv);
    expect(items[0].category).toBeUndefined();
    expect(items[0].time).toBeUndefined();
  });

  test('花費欄位自動轉換為數字', () => {
    const csv = `日期,標題,花費
2024-01-15,台北101,600`;
    
    const items = parseItinerary(csv);
    expect(items[0].cost).toBe(600);
    expect(typeof items[0].cost).toBe('number');
  });

  test('自動生成 UUID v4 作為 id', () => {
    const csv = `日期,標題
2024-01-15,台北101
2024-01-16,故宮`;
    
    const items = parseItinerary(csv);
    expect(items[0].id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(items[0].id).not.toBe(items[1].id);
  });
});
```

---

## 2. 旅遊資訊 (TravelInfo) - GID 1

### Purpose
儲存住宿、交通票券、打包清單、緊急聯絡等多類別資訊，支援彈性欄位。

### Column Definition

**基礎欄位** (所有類別共用):

| 欄位名稱 | 型別 | 必填 | 格式 | 範例 | 說明 |
|---------|------|-----|------|------|------|
| 標題 | Text | ✅ | - | `東京希爾頓飯店` | 資訊項目名稱 |
| 類別 | Text | ✅ | - | `住宿` | 常見值：住宿/交通票券/打包清單/緊急聯絡/注意事項 |
| 內容 | Text | ❌ | - | `位於新宿，交通便利` | 詳細說明 |
| 連結 | Text | ❌ | URL,URL | `https://hilton.com/tokyo` | 多個連結以逗號分隔 |
| 備註 | Text | ❌ | - | `已付款，確認信在信箱` | 額外備註 |

**類別專屬欄位**:

| 欄位名稱 | 適用類別 | 型別 | 必填 | 格式 | 範例 |
|---------|---------|------|-----|------|------|
| 地址 | 住宿 | Text | ❌ | - | `東京都新宿區西新宿6-6-2` |
| 數量 | 打包清單 | Number | ❌ | >= 0 | `2` |
| 聯絡人姓名 | 緊急聯絡 | Text | ❌ | - | `王小明` |
| 電話 | 緊急聯絡 | Text | ❌ | +country-number | `+886-912-345-678` |

### CSV Example

```csv
標題,類別,內容,地址,數量,聯絡人姓名,電話,連結,備註
東京希爾頓飯店,住宿,位於新宿，交通便利,東京都新宿區西新宿6-6-2,,,,,https://hilton.com/tokyo,已付款
JR Pass 7日券,交通票券,全國新幹線通用,,,,,,https://jrpass.com,成田機場領取
護照,打包清單,隨身攜帶,,1,,,,
台灣駐日代表處,緊急聯絡,,,,,台北經濟文化代表處,+81-3-3280-7811,https://www.roc-taiwan.org/jp/,上班時間09:00-17:00
防曬乳,打包清單,SPF50+,,2,,,,
```

### Parsing Logic (PapaParse)

```typescript
interface RawTravelInfoRow {
  '標題': string;
  '類別': string;
  '內容'?: string;
  '地址'?: string;
  '數量'?: string;
  '聯絡人姓名'?: string;
  '電話'?: string;
  '連結'?: string;
  '備註'?: string;
}

function parseTravelInfo(csvData: string): InfoItem[] {
  const result = Papa.parse<RawTravelInfoRow>(csvData, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  return result.data
    .filter(row => row['標題'] && row['類別']) // 過濾無效列
    .map(row => ({
      id: uuidv4(),
      title: row['標題'],
      category: row['類別'],
      content: row['內容'] || undefined,
      address: row['地址'] || undefined,
      amount: row['數量'] ? parseInt(row['數量'], 10) : undefined,
      contactName: row['聯絡人姓名'] || undefined,
      phone: row['電話'] || undefined,
      links: row['連結'] || undefined,
      notes: row['備註'] || undefined,
      isPacked: false, // 預設未打包，稍後從 LocalStorage 合併
      linkList: [], // 計算屬性，稍後設定
    }));
}
```

### Contract Tests

```typescript
describe('Google Sheet CSV - 旅遊資訊', () => {
  test('正常解析住宿類別', () => {
    const csv = `標題,類別,內容,地址,連結
東京希爾頓,住宿,新宿區,東京都新宿區西新宿6-6-2,https://hilton.com`;
    
    const items = parseTravelInfo(csv);
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: '東京希爾頓',
      category: '住宿',
      address: '東京都新宿區西新宿6-6-2',
    });
  });

  test('正常解析打包清單類別', () => {
    const csv = `標題,類別,數量
護照,打包清單,1
防曬乳,打包清單,2`;
    
    const items = parseTravelInfo(csv);
    expect(items).toHaveLength(2);
    expect(items[0].amount).toBe(1);
    expect(items[1].amount).toBe(2);
  });

  test('正常解析緊急聯絡類別', () => {
    const csv = `標題,類別,聯絡人姓名,電話
台灣駐日代表處,緊急聯絡,台北經濟文化代表處,+81-3-3280-7811`;
    
    const items = parseTravelInfo(csv);
    expect(items[0]).toMatchObject({
      contactName: '台北經濟文化代表處',
      phone: '+81-3-3280-7811',
    });
  });

  test('跳過缺少必填欄位的列', () => {
    const csv = `標題,類別
東京希爾頓,住宿
,無類別
無標題,交通`;
    
    const items = parseTravelInfo(csv);
    expect(items).toHaveLength(1); // 僅第一列有效
  });

  test('數量欄位自動轉換為整數', () => {
    const csv = `標題,類別,數量
護照,打包清單,1`;
    
    const items = parseTravelInfo(csv);
    expect(items[0].amount).toBe(1);
    expect(typeof items[0].amount).toBe('number');
  });
});
```

---

## 3. 登入設定 (AuthConfig) - GID 2

### Purpose
儲存可用密碼及其有效期限，支援多密碼機制與自動過期。

### Column Definition

| 欄位名稱 | 型別 | 必填 | 格式 | 範例 | 說明 |
|---------|------|-----|------|------|------|
| 密碼 | Text | ✅ | - | `TravelGroup2024` | 密碼（明文或 SHA-256 hash） |
| 說明文字 | Text | ❌ | - | `家人共用` | 密碼用途說明 |
| 有效期限 | Date | ❌ | YYYY-MM-DD | `2024-12-31` | 留空則永久有效 |

### CSV Example

```csv
密碼,說明文字,有效期限
TravelGroup2024,家人共用,2024-12-31
FriendPass2024,朋友查看,2024-06-30
AdminMasterKey,管理員專用,
```

### Parsing Logic (PapaParse)

```typescript
interface RawAuthRow {
  '密碼': string;
  '說明文字'?: string;
  '有效期限'?: string;
}

function parseAuthConfig(csvData: string): AuthConfig {
  const result = Papa.parse<RawAuthRow>(csvData, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  });

  const items = result.data
    .filter(row => row['密碼']) // 過濾無效列
    .map(row => {
      const expiryDate = row['有效期限'] || undefined;
      const isValid = computeIsValid({ expiryDate } as AuthItem);
      
      return {
        password: row['密碼'],
        description: row['說明文字'] || undefined,
        expiryDate,
        isValid,
      };
    });

  return {
    items,
    lastUpdated: new Date(),
    version: '1.0.0',
  };
}

function computeIsValid(authItem: Partial<AuthItem>): boolean {
  if (!authItem.expiryDate) return true; // 未設定有效期限，永久有效
  
  const expiryDate = new Date(authItem.expiryDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return expiryDate >= today;
}
```

### Contract Tests

```typescript
describe('Google Sheet CSV - 登入設定', () => {
  test('正常解析包含所有欄位的 CSV', () => {
    const csv = `密碼,說明文字,有效期限
TravelGroup2024,家人共用,2024-12-31`;
    
    const config = parseAuthConfig(csv);
    expect(config.items).toHaveLength(1);
    expect(config.items[0]).toMatchObject({
      password: 'TravelGroup2024',
      description: '家人共用',
      expiryDate: '2024-12-31',
    });
  });

  test('未設定有效期限的密碼應標記為永久有效', () => {
    const csv = `密碼,說明文字,有效期限
AdminMasterKey,管理員專用,`;
    
    const config = parseAuthConfig(csv);
    expect(config.items[0].isValid).toBe(true);
    expect(config.items[0].expiryDate).toBeUndefined();
  });

  test('過期密碼應標記為無效', () => {
    const csv = `密碼,說明文字,有效期限
ExpiredPass,已過期,2020-01-01`;
    
    const config = parseAuthConfig(csv);
    expect(config.items[0].isValid).toBe(false);
  });

  test('當日有效期限應視為有效', () => {
    const today = new Date().toISOString().split('T')[0];
    const csv = `密碼,說明文字,有效期限
TodayPass,當日有效,${today}`;
    
    const config = parseAuthConfig(csv);
    expect(config.items[0].isValid).toBe(true);
  });

  test('跳過缺少密碼的列', () => {
    const csv = `密碼,說明文字,有效期限
ValidPass,有效,
,無密碼,2024-12-31`;
    
    const config = parseAuthConfig(csv);
    expect(config.items).toHaveLength(1);
  });

  test('版本號應為 1.0.0', () => {
    const csv = `密碼,說明文字,有效期限
TestPass,,`;
    
    const config = parseAuthConfig(csv);
    expect(config.version).toBe('1.0.0');
  });
});
```

---

## Error Handling Strategy

### Network Errors

```typescript
async function fetchGoogleSheetCSV(sheetId: string, gid: number): Promise<string> {
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return await response.text();
  } catch (error) {
    if (error instanceof TypeError) {
      // 網路錯誤（無網路、CORS、DNS 失敗）
      throw new Error('網路連線失敗，請檢查網路狀態');
    }
    throw error;
  }
}
```

### Parsing Errors

```typescript
function safeParseCSV<T>(csvData: string, options: Papa.ParseConfig): T[] {
  const result = Papa.parse<T>(csvData, options);
  
  if (result.errors.length > 0) {
    console.warn('CSV parsing warnings:', result.errors);
    // 僅記錄警告，不阻擋解析（允許部分資料載入）
  }
  
  return result.data;
}
```

### Validation Errors

```typescript
function validateItineraryItem(item: Partial<ItineraryItem>): string[] {
  const errors: string[] = [];
  
  if (!item.date) errors.push('缺少日期');
  if (!item.title) errors.push('缺少標題');
  if (item.cost !== undefined && item.cost < 0) errors.push('花費不可為負數');
  
  return errors;
}
```

---

## CORS Considerations

### Google Sheets CORS Policy

✅ **CORS Enabled**: Google Sheets CSV export endpoint 支援跨域請求，無需額外設定。

**Test URL** (驗證 CORS):
```bash
curl -I "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/export?format=csv&gid=0"
# 應包含: Access-Control-Allow-Origin: *
```

### Fallback Strategy (如 CORS 失敗)

```typescript
// Option 1: 使用 CORS Proxy (僅開發環境)
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const url = `${CORS_PROXY}https://docs.google.com/spreadsheets/...`;

// Option 2: 要求使用者手動匯出 CSV 並上傳（離線備案）
```

---

## Performance Considerations

### CSV Size Estimation

| 工作表 | 預估列數 | 預估檔案大小 | 解析時間 (估計) |
|-------|---------|-------------|---------------|
| 行程 | 50-200 | 10-50 KB | < 100ms |
| 旅遊資訊 | 20-50 | 5-15 KB | < 50ms |
| 登入設定 | 3-10 | < 1 KB | < 10ms |

**Total**: < 200ms 解析時間（符合 Constitution Performance 要求）

### Caching Strategy

```typescript
// Service Worker (Workbox) 快取策略
runtimeCaching: [{
  urlPattern: /.*docs\.google\.com.*export\?format=csv.*/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'google-sheets-csv',
    expiration: {
      maxAgeSeconds: 7 * 24 * 60 * 60, // 7 天
    },
    cacheableResponse: {
      statuses: [0, 200],
    },
  },
}]
```

---

## Next Steps

Phase 1 設計持續進行：
1. ✅ Generate contracts/frontend-api.md（定義 4 個 Pinia stores + 元件合約）
2. ✅ Generate quickstart.md（開發環境設定指南）
3. ✅ Re-validate Constitution Check（Phase 1 設計後重新檢查）

**Contract Tests Integration**: 
- 本文件所有 contract tests 應整合至 `tests/integration/google-sheet.spec.ts`
- 使用實際 CSV 範例檔案（`tests/fixtures/sample-itinerary.csv`）進行測試
