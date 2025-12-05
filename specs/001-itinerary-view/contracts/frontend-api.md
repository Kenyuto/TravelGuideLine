# 前端介面合約：Vue 3 組件與 API

**功能分支**: `001-itinerary-view`  
**版本**: v1.0.0  
**建立日期**: 2025-12-05

---

## 合約總覽

本檔案定義前端 Vue 3 組件介面、Store API、工具函數等合約。

**相關文件**：
- [資料模型定義 data-model.md](../data-model.md)
- [Google Sheet CSV 合約 google-sheet-csv.md](./google-sheet-csv.md)

---

## Pinia Store 合約

### 1. ItineraryStore（行程資料狀態管理）

```typescript
import { defineStore } from 'pinia';

export const useItineraryStore = defineStore('itinerary', {
  state: () => ({
    /** 所有行程日期資料 */
    days: [] as ItineraryDay[],
    
    /** 當前選定日期（YYYY-MM-DD） */
    currentDate: '' as string,
    
    /** 搜尋關鍵字 */
    searchQuery: '' as string,
    
    /** 選定的分類過濾（空陣列表示全部顯示） */
    categoryFilters: [] as ItemCategory[],
    
    /** 選定的標籤過濾（空陣列表示全部顯示） */
    tagFilters: [] as string[],
    
    /** 所有可用標籤清單（自動從行程項目統計生成） */
    availableTags: [] as string[],
    
    /** 載入狀態 */
    loading: false,
    
    /** 錯誤訊息 */
    error: null as string | null,
    
    /** 最後更新時間 */
    lastUpdated: null as Date | null
  }),
  
  getters: {
    /** 取得當前日期的行程 */
    currentDayItinerary(state): ItineraryDay | undefined {
      return state.days.find(day => day.date === state.currentDate);
    },
    
    /** 取得過濾後的行程項目 */
    filteredItems(state): ItineraryItem[] {
      const currentDay = this.currentDayItinerary;
      if (!currentDay) return [];
      
      let items = currentDay.items;
      
      // 搜尋過濾
      if (state.searchQuery.trim()) {
        const query = state.searchQuery.toLowerCase();
        items = items.filter(item =>
          item.title.toLowerCase().includes(query) ||
          item.notes?.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query)
        );
      }
      
      // 分類過濾
      if (state.categoryFilters.length > 0) {
        items = items.filter(item =>
          state.categoryFilters.includes(item.category)
        );
      }
      
      // 標籤過濾（OR 邏輯）
      if (state.tagFilters.length > 0) {
        items = items.filter(item =>
          item.tags?.some(tag => state.tagFilters.includes(tag))
        );
      }
      
      return items;
    },
    
    /** 取得行程日期範圍 */
    dateRange(state): { start: string; end: string } | null {
      if (state.days.length === 0) return null;
      const dates = state.days.map(d => d.date).sort();
      return { start: dates[0], end: dates[dates.length - 1] };
    },
    
    /** 取得所有日期清單 */
    allDates(state): string[] {
      return state.days.map(d => d.date).sort();
    }
  },
  
  actions: {
    /** 載入行程資料 */
    async loadItinerary(sheetId: string, gid: number = 0): Promise<void> {
      this.loading = true;
      this.error = null;
      
      try {
        const days = await fetchItineraryFromSheet(sheetId, gid);
        this.days = days;
        this.availableTags = this.extractAllTags();
        this.lastUpdated = new Date();
        
        // 設定預設日期
        if (!this.currentDate && days.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const todayExists = days.some(d => d.date === today);
          this.currentDate = todayExists ? today : days[0].date;
        }
      } catch (err) {
        this.error = err instanceof Error ? err.message : '載入行程失敗';
        console.error('載入行程錯誤：', err);
      } finally {
        this.loading = false;
      }
    },
    
    /** 切換日期 */
    setCurrentDate(date: string): void {
      if (this.allDates.includes(date)) {
        this.currentDate = date;
      } else {
        console.warn(`日期 ${date} 不在行程範圍內`);
      }
    },
    
    /** 切換到下一天 */
    goToNextDay(): void {
      const dates = this.allDates;
      const currentIndex = dates.indexOf(this.currentDate);
      if (currentIndex < dates.length - 1) {
        this.currentDate = dates[currentIndex + 1];
      }
    },
    
    /** 切換到前一天 */
    goToPreviousDay(): void {
      const dates = this.allDates;
      const currentIndex = dates.indexOf(this.currentDate);
      if (currentIndex > 0) {
        this.currentDate = dates[currentIndex - 1];
      }
    },
    
    /** 設定搜尋關鍵字（帶防抖） */
    setSearchQuery(query: string): void {
      this.searchQuery = query;
    },
    
    /** 切換分類過濾 */
    toggleCategoryFilter(category: ItemCategory): void {
      const index = this.categoryFilters.indexOf(category);
      if (index === -1) {
        this.categoryFilters.push(category);
      } else {
        this.categoryFilters.splice(index, 1);
      }
    },
    
    /** 切換標籤過濾 */
    toggleTagFilter(tag: string): void {
      const index = this.tagFilters.indexOf(tag);
      if (index === -1) {
        this.tagFilters.push(tag);
      } else {
        this.tagFilters.splice(index, 1);
      }
    },
    
    /** 清除所有過濾 */
    clearFilters(): void {
      this.searchQuery = '';
      this.categoryFilters = [];
      this.tagFilters = [];
    },
    
    /** 切換行程項目完成狀態 */
    toggleItemCompleted(itemId: string): void {
      const item = this.findItemById(itemId);
      if (item) {
        item.isCompleted = !item.isCompleted;
        saveCompletedState(itemId, item.isCompleted);
      }
    },
    
    /** 從所有行程項目提取標籤 */
    extractAllTags(): string[] {
      const tagSet = new Set<string>();
      this.days.forEach(day => {
        day.items.forEach(item => {
          item.tags?.forEach(tag => tagSet.add(tag));
        });
      });
      return Array.from(tagSet).sort();
    },
    
    /** 根據 ID 查找行程項目 */
    findItemById(itemId: string): ItineraryItem | undefined {
      for (const day of this.days) {
        const item = day.items.find(i => i.id === itemId);
        if (item) return item;
      }
      return undefined;
    }
  }
});
```

---

### 2. TravelInfoStore（旅遊資訊狀態管理）

```typescript
import { defineStore } from 'pinia';

export const useTravelInfoStore = defineStore('travelInfo', {
  state: () => ({
    /** 所有旅遊資訊項目 */
    items: [] as InfoItem[],
    
    /** 選定的分類過濾（空陣列表示全部顯示） */
    categoryFilters: [] as InfoCategory[],
    
    /** 載入狀態 */
    loading: false,
    
    /** 錯誤訊息 */
    error: null as string | null,
    
    /** 最後更新時間 */
    lastUpdated: null as Date | null
  }),
  
  getters: {
    /** 取得過濾後的資訊項目 */
    filteredItems(state): InfoItem[] {
      if (state.categoryFilters.length === 0) {
        return state.items.sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
      }
      return state.items
        .filter(item => state.categoryFilters.includes(item.category))
        .sort((a, b) => (a.sortOrder ?? 999) - (b.sortOrder ?? 999));
    },
    
    /** 依分類分組 */
    itemsByCategory(state): Record<InfoCategory, InfoItem[]> {
      return state.items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
      }, {} as Record<InfoCategory, InfoItem[]>);
    },
    
    /** 取得物品清單統計（已準備 / 總數） */
    packingStats(state): { packed: number; total: number } {
      const packingItems = state.items.filter(i => i.category === 'packing');
      const packed = packingItems.filter(i => i.isPacked).length;
      return { packed, total: packingItems.length };
    }
  },
  
  actions: {
    /** 載入旅遊資訊資料 */
    async loadTravelInfo(sheetId: string, gid: number): Promise<void> {
      this.loading = true;
      this.error = null;
      
      try {
        const info = await fetchTravelInfoFromSheet(sheetId, gid);
        this.items = info.items;
        this.lastUpdated = new Date();
      } catch (err) {
        this.error = err instanceof Error ? err.message : '載入旅遊資訊失敗';
        console.error('載入旅遊資訊錯誤：', err);
      } finally {
        this.loading = false;
      }
    },
    
    /** 切換分類過濾 */
    toggleCategoryFilter(category: InfoCategory): void {
      const index = this.categoryFilters.indexOf(category);
      if (index === -1) {
        this.categoryFilters.push(category);
      } else {
        this.categoryFilters.splice(index, 1);
      }
    },
    
    /** 清除分類過濾 */
    clearFilters(): void {
      this.categoryFilters = [];
    },
    
    /** 切換物品清單項目勾選狀態 */
    toggleItemPacked(itemId: string): void {
      const item = this.items.find(i => i.id === itemId);
      if (item && item.category === 'packing') {
        item.isPacked = !item.isPacked;
        savePackedState(itemId, item.isPacked);
      }
    }
  }
});
```

---

### 3. UIStore（UI 狀態管理）

```typescript
import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui', {
  state: () => ({
    /** 離線模式橫幅顯示 */
    showOfflineBanner: false,
    
    /** 側邊選單展開（行動裝置） */
    sidebarOpen: false,
    
    /** Toast 通知列表 */
    toasts: [] as Toast[]
  }),
  
  actions: {
    /** 顯示 Toast 通知 */
    showToast(message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000): void {
      const toast: Toast = {
        id: Date.now().toString(),
        message,
        type,
        duration
      };
      this.toasts.push(toast);
      
      setTimeout(() => {
        this.removeToast(toast.id);
      }, duration);
    },
    
    /** 移除 Toast 通知 */
    removeToast(id: string): void {
      const index = this.toasts.findIndex(t => t.id === id);
      if (index !== -1) this.toasts.splice(index, 1);
    },
    
    /** 切換側邊選單 */
    toggleSidebar(): void {
      this.sidebarOpen = !this.sidebarOpen;
    },
    
    /** 關閉側邊選單 */
    closeSidebar(): void {
      this.sidebarOpen = false;
    }
  }
});

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration: number;
}
```

---

## Vue 組件合約

### 1. ItineraryCard（行程卡片）

```typescript
<script setup lang="ts">
interface Props {
  /** 行程項目資料 */
  item: ItineraryItem;
  
  /** 是否顯示完整資訊（預設 false 僅顯示關鍵資訊） */
  expanded?: boolean;
}

interface Emits {
  /** 點擊卡片事件 */
  (e: 'click', item: ItineraryItem): void;
  
  /** 切換完成狀態事件 */
  (e: 'toggle-completed', itemId: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  expanded: false
});

const emit = defineEmits<Emits>();
</script>
```

**插槽 (Slots)**：
- `actions`：卡片操作區域（如：分享按鈕、編輯按鈕）

---

### 2. DateNavigator（日期導覽）

```typescript
<script setup lang="ts">
interface Props {
  /** 當前選定日期 */
  currentDate: string;
  
  /** 所有可用日期清單 */
  availableDates: string[];
}

interface Emits {
  /** 日期變更事件 */
  (e: 'change', date: string): void;
  
  /** 前一天事件 */
  (e: 'previous'): void;
  
  /** 後一天事件 */
  (e: 'next'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
</script>
```

---

### 3. SearchBar（搜尋列）

```typescript
<script setup lang="ts">
interface Props {
  /** 搜尋關鍵字 */
  modelValue: string;
  
  /** 占位文字 */
  placeholder?: string;
  
  /** 防抖延遲（毫秒） */
  debounce?: number;
}

interface Emits {
  /** 搜尋關鍵字變更事件（防抖後觸發） */
  (e: 'update:modelValue', value: string): void;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜尋行程...',
  debounce: 300
});

const emit = defineEmits<Emits>();
</script>
```

---

### 4. FilterChips（過濾標籤）

```typescript
<script setup lang="ts">
interface Props {
  /** 可選項目清單 */
  options: string[];
  
  /** 已選擇項目清單 */
  selected: string[];
  
  /** 顯示模式（單選 / 多選） */
  mode?: 'single' | 'multiple';
}

interface Emits {
  /** 切換選擇事件 */
  (e: 'toggle', option: string): void;
  
  /** 清除所有選擇事件 */
  (e: 'clear'): void;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'multiple'
});

const emit = defineEmits<Emits>();
</script>
```

---

## 工具函數合約

### 1. Google Sheet 資料載入

```typescript
/**
 * 從 Google Sheet 載入行程資料
 * @param sheetId Google Sheet ID
 * @param gid 工作表 ID（預設 0）
 * @returns Promise<ItineraryDay[]>
 */
export async function fetchItineraryFromSheet(
  sheetId: string,
  gid: number = 0
): Promise<ItineraryDay[]>;

/**
 * 從 Google Sheet 載入旅遊資訊資料
 * @param sheetId Google Sheet ID
 * @param gid 工作表 ID
 * @returns Promise<TravelInfo>
 */
export async function fetchTravelInfoFromSheet(
  sheetId: string,
  gid: number
): Promise<TravelInfo>;
```

---

### 2. 本地狀態持久化

```typescript
/**
 * 儲存行程項目完成狀態至 LocalStorage
 * @param itemId 行程項目 ID
 * @param completed 完成狀態
 */
export function saveCompletedState(itemId: string, completed: boolean): void;

/**
 * 讀取行程項目完成狀態
 * @param itemId 行程項目 ID
 * @returns boolean
 */
export function loadCompletedState(itemId: string): boolean;

/**
 * 儲存物品清單勾選狀態至 LocalStorage
 * @param itemId 物品項目 ID
 * @param packed 勾選狀態
 */
export function savePackedState(itemId: string, packed: boolean): void;

/**
 * 讀取物品清單勾選狀態
 * @param itemId 物品項目 ID
 * @returns boolean
 */
export function loadPackedState(itemId: string): boolean;
```

---

### 3. 日期工具

```typescript
/**
 * 格式化日期為顯示文字
 * @param date ISO 日期字串（YYYY-MM-DD）
 * @param format 格式類型
 * @returns 格式化後的字串
 */
export function formatDate(
  date: string,
  format: 'full' | 'short' | 'weekday' = 'full'
): string;

// 範例：
// formatDate('2024-01-15', 'full') => '2024 年 1 月 15 日（星期一）'
// formatDate('2024-01-15', 'short') => '1/15'
// formatDate('2024-01-15', 'weekday') => '星期一'
```

---

## 錯誤處理合約

### 錯誤類型定義

```typescript
/** 應用程式錯誤基類 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public userMessage: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/** 網路錯誤 */
export class NetworkError extends AppError {
  constructor(message: string) {
    super('NETWORK_ERROR', message, '無法連線，請檢查網路或稍後再試');
  }
}

/** 資料解析錯誤 */
export class ParseError extends AppError {
  constructor(message: string, public row?: number) {
    super(
      'PARSE_ERROR',
      message,
      row ? `資料格式錯誤（行 ${row}），請聯絡管理員` : '資料格式錯誤，請聯絡管理員'
    );
  }
}

/** 資料驗證錯誤 */
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(
      'VALIDATION_ERROR',
      message,
      field ? `欄位「${field}」資料無效` : '資料驗證失敗'
    );
  }
}
```

---

## 測試合約

### Unit Tests（Vitest）

```typescript
// Store 測試範例
describe('ItineraryStore', () => {
  it('應正確載入行程資料', async () => {
    const store = useItineraryStore();
    await store.loadItinerary('test-sheet-id');
    expect(store.days.length).toBeGreaterThan(0);
  });
  
  it('應正確切換日期', () => {
    const store = useItineraryStore();
    store.days = [{ date: '2024-01-15', items: [], notes: '' }];
    store.setCurrentDate('2024-01-15');
    expect(store.currentDate).toBe('2024-01-15');
  });
});

// 組件測試範例
describe('ItineraryCard', () => {
  it('應顯示行程標題', () => {
    const item: ItineraryItem = { id: '1', title: '測試', category: 'attraction' };
    const wrapper = mount(ItineraryCard, { props: { item } });
    expect(wrapper.text()).toContain('測試');
  });
});
```

---

**版本**: v1.0.0  
**下一步**: 產出 quickstart.md（開發環境設定指南）
