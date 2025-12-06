# Frontend API Contract

> **Phase 1 Output**: 本文件定義 Pinia Stores、元件介面、工具函數與錯誤型別。

## Contract Overview

**State Management**: Pinia 2.x  
**Storage**: LocalStorage (auth/completion/packed state)  
**References**: [research.md](../research.md), [data-model.md](../data-model.md)

---

## Pinia Stores

### 1. AuthStore (登入驗證狀態)

#### Purpose
管理使用者登入狀態、密碼清單與 LocalStorage 持久化。

#### State

```typescript
interface AuthStoreState {
  /** 是否已登入 */
  isAuthenticated: boolean;
  
  /** 登入時間戳（Unix timestamp, milliseconds） */
  authTimestamp: number | null;
  
  /** 密碼清單（從 Google Sheet「登入設定」載入） */
  passwordList: AuthItem[];
  
  /** 載入狀態 */
  loading: boolean;
  
  /** 錯誤訊息 */
  error: string | null;
}
```

#### Getters

```typescript
interface AuthStoreGetters {
  /**
   * 檢查登入狀態是否有效（7 天內）
   * @returns true 若已登入且未過期
   */
  isLoginValid(state: AuthStoreState): boolean;
  
  /**
   * 取得所有有效密碼（未過期）
   * @returns 有效的 AuthItem 陣列
   */
  validPasswords(state: AuthStoreState): AuthItem[];
  
  /**
   * 計算登入剩餘時間（秒）
   * @returns 剩餘秒數，若未登入則為 0
   */
  remainingTime(state: AuthStoreState): number;
}
```

#### Actions

```typescript
interface AuthStoreActions {
  /**
   * 從 Google Sheet 載入登入設定
   * @param sheetId - Google Sheet ID
   * @param gid - 工作表 GID (預設 2)
   * @throws GoogleSheetError 若載入失敗
   */
  loadAuthConfig(sheetId: string, gid?: number): Promise<void>;
  
  /**
   * 驗證密碼
   * @param password - 使用者輸入的密碼
   * @returns true 若密碼有效（在有效密碼清單中）
   */
  validatePassword(password: string): boolean;
  
  /**
   * 執行登入
   * @param password - 使用者輸入的密碼
   * @returns true 若登入成功
   * @throws InvalidPasswordError 若密碼錯誤
   * @throws PasswordExpiredError 若所有密碼已過期
   */
  login(password: string): Promise<boolean>;
  
  /**
   * 執行登出
   * 清除 LocalStorage authState 並重設 store 狀態
   */
  logout(): void;
  
  /**
   * 從 LocalStorage 恢復登入狀態
   * 在 app 初始化時呼叫
   */
  restoreAuthState(): void;
}
```

#### Usage Example

```typescript
// 登入流程
const authStore = useAuthStore();

// 1. 載入登入設定
await authStore.loadAuthConfig(GOOGLE_SHEET_ID, 2);

// 2. 驗證密碼
const isValid = authStore.validatePassword(userInput);
if (!isValid) {
  console.error('密碼錯誤');
  return;
}

// 3. 執行登入
try {
  await authStore.login(userInput);
  router.push('/itinerary');
} catch (error) {
  if (error instanceof InvalidPasswordError) {
    console.error('密碼錯誤，請重試');
  }
}

// 4. 檢查登入狀態
if (authStore.isLoginValid) {
  console.log(`登入剩餘時間：${authStore.remainingTime} 秒`);
}

// 5. 登出
authStore.logout();
```

---

### 2. ItineraryStore (行程資料狀態)

#### Purpose
管理行程資料、日期切換、搜尋過濾與完成狀態。

#### State

```typescript
interface ItineraryStoreState {
  /** 所有行程日期 (key: YYYY-MM-DD, value: ItineraryDay) */
  days: Record<string, ItineraryDay>;
  
  /** 當前選擇的日期 (YYYY-MM-DD) */
  currentDate: string | null;
  
  /** 搜尋關鍵字 */
  searchQuery: string;
  
  /** 已完成項目 (key: itemId, value: true) */
  completedItems: Record<string, boolean>;
  
  /** 載入狀態 */
  loading: boolean;
  
  /** 錯誤訊息 */
  error: string | null;
}
```

#### Getters

```typescript
interface ItineraryStoreGetters {
  /**
   * 取得當前日期的行程項目（已套用搜尋過濾與完成狀態）
   * @returns ItineraryItem 陣列
   */
  currentDayItems(state: ItineraryStoreState): ItineraryItem[];
  
  /**
   * 取得所有可用日期清單（排序後）
   * @returns YYYY-MM-DD 字串陣列
   */
  availableDates(state: ItineraryStoreState): string[];
  
  /**
   * 取得搜尋過濾後的項目（當前日期）
   * @returns ItineraryItem 陣列
   */
  filteredItems(state: ItineraryStoreState): ItineraryItem[];
  
  /**
   * 取得所有標籤及其出現次數
   * @returns { tag: string, count: number }[]
   */
  tagStatistics(state: ItineraryStoreState): Array<{ tag: string; count: number }>;
  
  /**
   * 計算總花費（當前日期）
   * @returns 總花費數字
   */
  totalCost(state: ItineraryStoreState): number;
  
  /**
   * 計算完成進度（當前日期）
   * @returns 0-100 的百分比
   */
  completionPercentage(state: ItineraryStoreState): number;
}
```

#### Actions

```typescript
interface ItineraryStoreActions {
  /**
   * 從 Google Sheet 載入行程
   * @param sheetId - Google Sheet ID
   * @param gid - 工作表 GID (預設 0)
   * @throws GoogleSheetError 若載入失敗
   */
  loadItinerary(sheetId: string, gid?: number): Promise<void>;
  
  /**
   * 切換到指定日期
   * @param date - YYYY-MM-DD 格式
   */
  switchDate(date: string): void;
  
  /**
   * 切換到前一天
   * @returns true 若成功切換
   */
  previousDay(): boolean;
  
  /**
   * 切換到後一天
   * @returns true 若成功切換
   */
  nextDay(): boolean;
  
  /**
   * 設定搜尋關鍵字
   * @param query - 搜尋關鍵字
   */
  setSearchQuery(query: string): void;
  
  /**
   * 標記項目完成/未完成
   * @param itemId - 項目 ID
   * @param completed - 是否完成
   */
  toggleComplete(itemId: string, completed: boolean): void;
  
  /**
   * 清除所有完成狀態
   */
  clearCompletionState(): void;
  
  /**
   * 從 LocalStorage 恢復完成狀態
   */
  restoreCompletionState(): void;
}
```

#### Usage Example

```typescript
const itineraryStore = useItineraryStore();

// 1. 載入行程
await itineraryStore.loadItinerary(GOOGLE_SHEET_ID, 0);

// 2. 切換日期
itineraryStore.switchDate('2024-01-15');

// 3. 搜尋
itineraryStore.setSearchQuery('台北101');
console.log(itineraryStore.filteredItems); // 包含 "台北101" 的項目

// 4. 標記完成
itineraryStore.toggleComplete(item.id, true);

// 5. 前後日期切換
itineraryStore.nextDay();
itineraryStore.previousDay();

// 6. 統計資料
console.log(`總花費：${itineraryStore.totalCost}`);
console.log(`完成進度：${itineraryStore.completionPercentage}%`);
console.log(`標籤統計：`, itineraryStore.tagStatistics);
```

---

### 3. TravelInfoStore (旅遊資訊狀態)

#### Purpose
管理旅遊資訊（住宿、交通、打包清單等）與打包狀態。

#### State

```typescript
interface TravelInfoStoreState {
  /** 所有旅遊資訊項目 */
  items: InfoItem[];
  
  /** 當前選擇的類別（空字串表示全部） */
  selectedCategory: string;
  
  /** 已打包項目 (key: itemId, value: true) */
  packedItems: Record<string, boolean>;
  
  /** 載入狀態 */
  loading: boolean;
  
  /** 錯誤訊息 */
  error: string | null;
}
```

#### Getters

```typescript
interface TravelInfoStoreGetters {
  /**
   * 取得所有類別清單（不重複）
   * @returns 類別字串陣列
   */
  categories(state: TravelInfoStoreState): string[];
  
  /**
   * 取得過濾後的項目（依 selectedCategory）
   * @returns InfoItem 陣列
   */
  filteredItems(state: TravelInfoStoreState): InfoItem[];
  
  /**
   * 取得依類別分組的項目
   * @returns { [category: string]: InfoItem[] }
   */
  itemsByCategory(state: TravelInfoStoreState): Record<string, InfoItem[]>;
  
  /**
   * 取得打包清單項目（category="打包清單"）
   * @returns InfoItem 陣列
   */
  packingList(state: TravelInfoStoreState): InfoItem[];
  
  /**
   * 計算打包進度
   * @returns 0-100 的百分比
   */
  packingProgress(state: TravelInfoStoreState): number;
}
```

#### Actions

```typescript
interface TravelInfoStoreActions {
  /**
   * 從 Google Sheet 載入旅遊資訊
   * @param sheetId - Google Sheet ID
   * @param gid - 工作表 GID (預設 1)
   * @throws GoogleSheetError 若載入失敗
   */
  loadTravelInfo(sheetId: string, gid?: number): Promise<void>;
  
  /**
   * 設定類別過濾
   * @param category - 類別名稱（空字串表示全部）
   */
  filterByCategory(category: string): void;
  
  /**
   * 標記項目已打包/未打包
   * @param itemId - 項目 ID
   * @param packed - 是否已打包
   */
  togglePacked(itemId: string, packed: boolean): void;
  
  /**
   * 清除所有打包狀態
   */
  clearPackingState(): void;
  
  /**
   * 從 LocalStorage 恢復打包狀態
   */
  restorePackingState(): void;
}
```

#### Usage Example

```typescript
const travelInfoStore = useTravelInfoStore();

// 1. 載入旅遊資訊
await travelInfoStore.loadTravelInfo(GOOGLE_SHEET_ID, 1);

// 2. 類別過濾
travelInfoStore.filterByCategory('住宿');
console.log(travelInfoStore.filteredItems); // 僅顯示住宿類別

// 3. 標記已打包
travelInfoStore.togglePacked(item.id, true);

// 4. 打包進度
console.log(`打包進度：${travelInfoStore.packingProgress}%`);

// 5. 依類別分組顯示
Object.entries(travelInfoStore.itemsByCategory).forEach(([category, items]) => {
  console.log(`${category}：${items.length} 項`);
});
```

---

### 4. UIStore (UI 狀態)

#### Purpose
管理全域 UI 狀態（載入中、錯誤訊息、離線狀態等）。

#### State

```typescript
interface UIStoreState {
  /** 全域載入狀態 */
  loading: boolean;
  
  /** 錯誤訊息（null 表示無錯誤） */
  error: ErrorState | null;
  
  /** 是否離線 */
  isOffline: boolean;
  
  /** Toast 訊息佇列 */
  toasts: ToastMessage[];
}

interface ErrorState {
  /** 錯誤訊息 */
  message: string;
  
  /** 錯誤類型 */
  type: 'network' | 'validation' | 'auth' | 'unknown';
  
  /** 重試函數（可選） */
  retry?: () => void;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration: number; // 顯示時長（毫秒）
}
```

#### Getters

```typescript
interface UIStoreGetters {
  /**
   * 是否有錯誤
   */
  hasError(state: UIStoreState): boolean;
  
  /**
   * 取得當前錯誤訊息
   */
  errorMessage(state: UIStoreState): string | null;
}
```

#### Actions

```typescript
interface UIStoreActions {
  /**
   * 顯示錯誤訊息
   * @param error - 錯誤物件
   * @param retry - 重試函數（可選）
   */
  showError(error: Error, retry?: () => void): void;
  
  /**
   * 清除錯誤訊息
   */
  clearError(): void;
  
  /**
   * 設定離線狀態
   * @param offline - 是否離線
   */
  setOffline(offline: boolean): void;
  
  /**
   * 顯示 Toast 訊息
   * @param message - 訊息文字
   * @param type - 訊息類型
   * @param duration - 顯示時長（預設 3000ms）
   */
  showToast(message: string, type: ToastMessage['type'], duration?: number): void;
  
  /**
   * 移除 Toast 訊息
   * @param id - Toast ID
   */
  removeToast(id: string): void;
}
```

#### Usage Example

```typescript
const uiStore = useUIStore();

// 1. 顯示錯誤
try {
  await loadData();
} catch (error) {
  uiStore.showError(error as Error, () => loadData());
}

// 2. 清除錯誤
uiStore.clearError();

// 3. 顯示 Toast
uiStore.showToast('登入成功', 'success');
uiStore.showToast('網路連線失敗', 'error', 5000);

// 4. 監聽離線狀態
window.addEventListener('online', () => uiStore.setOffline(false));
window.addEventListener('offline', () => uiStore.setOffline(true));
```

---

## Component Contracts

### 1. LoginForm (登入表單元件)

#### Props

```typescript
interface LoginFormProps {
  /** 是否顯示載入狀態 */
  loading?: boolean;
  
  /** 錯誤訊息 */
  error?: string;
}
```

#### Emits

```typescript
interface LoginFormEmits {
  /** 使用者提交密碼時觸發 */
  (event: 'submit', password: string): void;
}
```

#### Slots

```typescript
interface LoginFormSlots {
  /** 標題區域（預設：「請輸入密碼」） */
  title?: () => VNode[];
  
  /** 說明文字區域（預設：空） */
  description?: () => VNode[];
}
```

#### Usage Example

```vue
<LoginForm
  :loading="authStore.loading"
  :error="authStore.error"
  @submit="handleLogin"
>
  <template #title>
    <h1>歡迎查看行程</h1>
  </template>
</LoginForm>
```

---

### 2. ItineraryDayCard (行程日卡片元件)

#### Props

```typescript
interface ItineraryDayCardProps {
  /** 行程日資料 */
  day: ItineraryDay;
  
  /** 是否為當前選擇的日期 */
  isActive?: boolean;
}
```

#### Emits

```typescript
interface ItineraryDayCardEmits {
  /** 使用者點擊卡片時觸發 */
  (event: 'click', date: string): void;
}
```

#### Usage Example

```vue
<ItineraryDayCard
  v-for="day in days"
  :key="day.date"
  :day="day"
  :is-active="day.date === currentDate"
  @click="itineraryStore.switchDate"
/>
```

---

### 3. ItineraryItemCard (行程項目卡片元件)

#### Props

```typescript
interface ItineraryItemCardProps {
  /** 行程項目資料 */
  item: ItineraryItem;
}
```

#### Emits

```typescript
interface ItineraryItemCardEmits {
  /** 使用者切換完成狀態時觸發 */
  (event: 'toggle-complete', itemId: string, completed: boolean): void;
  
  /** 使用者點擊地圖連結時觸發 */
  (event: 'open-map', mapLink: string): void;
}
```

#### Slots

```typescript
interface ItineraryItemCardSlots {
  /** 操作按鈕區域（預設：完成 checkbox + 地圖按鈕） */
  actions?: (props: { item: ItineraryItem }) => VNode[];
}
```

#### Usage Example

```vue
<ItineraryItemCard
  :item="item"
  @toggle-complete="itineraryStore.toggleComplete"
  @open-map="openInNewTab"
/>
```

---

### 4. SearchBar (搜尋列元件)

#### Props

```typescript
interface SearchBarProps {
  /** 目前搜尋關鍵字 */
  modelValue: string;
  
  /** Placeholder 文字 */
  placeholder?: string;
  
  /** 是否顯示清除按鈕 */
  clearable?: boolean;
}
```

#### Emits

```typescript
interface SearchBarEmits {
  /** 搜尋關鍵字變更時觸發 */
  (event: 'update:modelValue', value: string): void;
  
  /** 使用者按下 Enter 時觸發 */
  (event: 'search', query: string): void;
}
```

#### Usage Example

```vue
<SearchBar
  v-model="searchQuery"
  placeholder="搜尋行程標題、地點或標籤"
  clearable
  @search="handleSearch"
/>
```

---

### 5. TravelInfoCard (旅遊資訊卡片元件)

#### Props

```typescript
interface TravelInfoCardProps {
  /** 資訊項目資料 */
  item: InfoItem;
  
  /** 是否顯示打包 checkbox（僅 category="打包清單"） */
  showPackingCheckbox?: boolean;
}
```

#### Emits

```typescript
interface TravelInfoCardEmits {
  /** 使用者切換打包狀態時觸發 */
  (event: 'toggle-packed', itemId: string, packed: boolean): void;
}
```

#### Usage Example

```vue
<TravelInfoCard
  :item="item"
  :show-packing-checkbox="item.category === '打包清單'"
  @toggle-packed="travelInfoStore.togglePacked"
/>
```

---

## Utility Functions

### 1. googleSheetParser (Google Sheet CSV 解析)

```typescript
/**
 * 解析 Google Sheet CSV
 * @param csvData - CSV 字串
 * @param type - 資料類型
 * @returns 解析後的資料陣列
 * @throws ParsingError 若解析失敗
 */
function parseGoogleSheetCSV(
  csvData: string,
  type: 'itinerary' | 'travelInfo' | 'authConfig'
): ItineraryItem[] | InfoItem[] | AuthConfig;

/**
 * 取得 Google Sheet CSV 匯出 URL
 * @param sheetId - Google Sheet ID
 * @param gid - 工作表 GID
 * @returns CSV 匯出 URL
 */
function getGoogleSheetCSVUrl(sheetId: string, gid: number): string;

/**
 * 下載 Google Sheet CSV
 * @param sheetId - Google Sheet ID
 * @param gid - 工作表 GID
 * @returns CSV 字串
 * @throws NetworkError 若網路失敗
 */
async function fetchGoogleSheetCSV(sheetId: string, gid: number): Promise<string>;
```

---

### 2. authHelper (LocalStorage 驗證狀態管理)

```typescript
/**
 * 儲存登入狀態到 LocalStorage
 * @param isAuthenticated - 是否已登入
 */
function saveAuthState(isAuthenticated: boolean): void;

/**
 * 從 LocalStorage 載入登入狀態
 * @returns AuthState 或 null（若不存在或已過期）
 */
function loadAuthState(): AuthState | null;

/**
 * 清除登入狀態
 */
function clearAuthState(): void;

/**
 * 檢查登入狀態是否有效（7 天內）
 * @returns true 若已登入且未過期
 */
function isLoginValid(): boolean;
```

---

### 3. dateHelper (日期處理)

```typescript
/**
 * 格式化日期為 YYYY-MM-DD
 * @param date - Date 物件或 ISO 字串
 * @returns YYYY-MM-DD 字串
 */
function formatDate(date: Date | string): string;

/**
 * 解析日期字串為 Date 物件
 * @param dateStr - YYYY-MM-DD 字串
 * @returns Date 物件
 * @throws InvalidDateError 若格式錯誤
 */
function parseDate(dateStr: string): Date;

/**
 * 計算兩個日期之間的天數差
 * @param date1 - 第一個日期
 * @param date2 - 第二個日期
 * @returns 天數差（可為負數）
 */
function daysBetween(date1: Date | string, date2: Date | string): number;

/**
 * 取得今天的日期（YYYY-MM-DD）
 * @returns 今天的日期字串
 */
function getToday(): string;
```

---

### 4. searchHelper (搜尋邏輯)

```typescript
/**
 * 搜尋行程項目
 * @param items - 行程項目陣列
 * @param query - 搜尋關鍵字
 * @returns 過濾後的行程項目陣列
 */
function searchItineraryItems(items: ItineraryItem[], query: string): ItineraryItem[];

/**
 * 檢查項目是否符合搜尋條件
 * @param item - 行程項目
 * @param query - 搜尋關鍵字
 * @returns true 若符合
 */
function matchesSearchQuery(item: ItineraryItem, query: string): boolean;

/**
 * 取得所有標籤及其出現次數
 * @param items - 行程項目陣列
 * @returns 標籤統計陣列
 */
function getTagStatistics(items: ItineraryItem[]): Array<{ tag: string; count: number }>;
```

---

### 5. deepLinkHelper (URL 參數處理)

```typescript
/**
 * 從 URL 取得查詢參數
 * @param param - 參數名稱
 * @returns 參數值或 null
 */
function getQueryParam(param: string): string | null;

/**
 * 設定 URL 查詢參數（不刷新頁面）
 * @param params - 參數物件
 */
function setQueryParams(params: Record<string, string>): void;

/**
 * 產生深連結 URL
 * @param path - 路徑
 * @param params - 參數物件
 * @returns 完整 URL
 */
function generateDeepLink(path: string, params: Record<string, string>): string;
```

---

## Error Types

### 1. GoogleSheetError

```typescript
class GoogleSheetError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'GoogleSheetError';
  }
}

// Usage
throw new GoogleSheetError('無法載入 Google Sheet', 404);
```

---

### 2. InvalidPasswordError

```typescript
class InvalidPasswordError extends Error {
  constructor(message: string = '密碼錯誤') {
    super(message);
    this.name = 'InvalidPasswordError';
  }
}

// Usage
throw new InvalidPasswordError();
```

---

### 3. PasswordExpiredError

```typescript
class PasswordExpiredError extends Error {
  constructor(message: string = '所有密碼已過期，請聯絡管理員') {
    super(message);
    this.name = 'PasswordExpiredError';
  }
}

// Usage
throw new PasswordExpiredError();
```

---

### 4. ParsingError

```typescript
class ParsingError extends Error {
  constructor(message: string, public row?: number) {
    super(message);
    this.name = 'ParsingError';
  }
}

// Usage
throw new ParsingError('CSV 格式錯誤', 5);
```

---

## Router Guards

### Authentication Guard

```typescript
import { useAuthStore } from '@/stores/auth';

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // 檢查路由是否需要驗證
  if (to.meta.requiresAuth && !authStore.isLoginValid) {
    // 未登入或登入已過期，導向登入頁
    next({ path: '/', query: { redirect: to.fullPath } });
  } else {
    next();
  }
});
```

### Deep Link Restoration

```typescript
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  
  // 登入後，若有 redirect 參數，導向原本要訪問的頁面
  if (to.path === '/' && authStore.isLoginValid && to.query.redirect) {
    next(to.query.redirect as string);
  } else {
    next();
  }
});
```

---

## Testing Contracts

### Store Tests

```typescript
describe('AuthStore', () => {
  let authStore: ReturnType<typeof useAuthStore>;
  
  beforeEach(() => {
    setActivePinia(createPinia());
    authStore = useAuthStore();
  });
  
  test('login() 成功後應設定 isAuthenticated', async () => {
    await authStore.loadAuthConfig(SHEET_ID, 2);
    await authStore.login('ValidPassword123');
    
    expect(authStore.isAuthenticated).toBe(true);
    expect(authStore.authTimestamp).toBeGreaterThan(0);
  });
  
  test('login() 失敗應拋出 InvalidPasswordError', async () => {
    await authStore.loadAuthConfig(SHEET_ID, 2);
    
    await expect(authStore.login('WrongPassword')).rejects.toThrow(InvalidPasswordError);
  });
  
  test('logout() 應清除 LocalStorage', () => {
    authStore.login('ValidPassword123');
    authStore.logout();
    
    expect(authStore.isAuthenticated).toBe(false);
    expect(loadAuthState()).toBeNull();
  });
});
```

### Component Tests

```typescript
describe('LoginForm', () => {
  test('應在使用者輸入密碼並送出時觸發 submit 事件', async () => {
    const wrapper = mount(LoginForm);
    const input = wrapper.find('input[type="password"]');
    const form = wrapper.find('form');
    
    await input.setValue('TestPassword123');
    await form.trigger('submit');
    
    expect(wrapper.emitted('submit')).toHaveLength(1);
    expect(wrapper.emitted('submit')![0]).toEqual(['TestPassword123']);
  });
  
  test('應顯示錯誤訊息', () => {
    const wrapper = mount(LoginForm, {
      props: { error: '密碼錯誤' },
    });
    
    expect(wrapper.text()).toContain('密碼錯誤');
  });
});
```

---

## Next Steps

Phase 1 設計持續進行：
1. ✅ Generate quickstart.md（開發環境設定指南）
2. ✅ Re-validate Constitution Check（Phase 1 設計後重新檢查）
3. ✅ Git commit & push Phase 0/1 documents

**Implementation Notes**:
- 所有 Pinia stores 應實作於 `src/stores/` 目錄
- 所有元件應實作於 `src/components/` 目錄（依功能分組）
- 所有工具函數應實作於 `src/utils/` 目錄
- 所有錯誤型別應定義於 `src/types/common.ts`
