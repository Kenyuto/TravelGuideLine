# 技術研究報告：旅遊行程檢視網站

**功能分支**: `001-itinerary-view`  
**研究日期**: 2025-12-05  
**研究目的**: 解決 Technical Context 中的 NEEDS CLARIFICATION 項目，確定技術選型與架構策略

---

## 研究項目總覽

| 項目 | 狀態 | 決策 |
|------|------|------|
| 前端框架選擇 | ✅ 完成 | Vue 3 (Composition API) |
| 建構工具選擇 | ✅ 完成 | Vite |
| 型別系統策略 | ✅ 完成 | TypeScript |
| 狀態管理方案 | ✅ 完成 | Pinia + LocalStorage |
| Google Sheet 解析 | ✅ 完成 | PapaParse (CSV) |
| 多工作表策略 | ✅ 完成 | URL 模式匹配 + gid 參數 |
| PWA 快取策略 | ✅ 完成 | Workbox |
| 測試框架選擇 | ✅ 完成 | Vitest + Playwright |
| 路由方案選擇 | ✅ 完成 | Vue Router |
| RWD 斷點設計 | ✅ 完成 | Tailwind CSS 標準斷點 |
| 效能優化策略 | ✅ 完成 | 資源分割 + Lazy Load |

---

## 1. 前端框架選擇

### 決策：Vue 3 (Composition API)

### 理由
1. **學習曲線與生態系**：Vue 3 文檔完善（繁體中文支援）、社群活躍、適合單頁應用
2. **Composition API**：提供更好的邏輯重用與型別推斷（配合 TypeScript）
3. **效能**：Vue 3 虛擬 DOM 優化、編譯時優化（靜態提升、Patch Flag）優於 Vue 2
4. **RWD 友善**：內建響應式系統簡化狀態同步與 UI 更新
5. **生態系整合**：Vite（官方建議）、Vue Router（官方路由）、Pinia（官方狀態管理）整合良好

### 替代方案考量
- **React 18**：生態系更大，但需額外配置 TypeScript、狀態管理複雜度較高（Redux Toolkit vs Zustand）
- **Vanilla JS**：學習成本低，但缺乏組件化、狀態管理需手動實作，不利長期維護
- **Svelte**：編譯時框架，包體積小，但生態系較小、部署平台支援度較 Vue/React 低

### 技術細節
- **版本**：Vue 3.4+（最新穩定版）
- **模式**：Composition API（不使用 Options API）
- **組件策略**：SFC (Single File Component) + `<script setup>` 語法糖

---

## 2. 建構工具選擇

### 決策：Vite

### 理由
1. **開發體驗**：熱模組替換（HMR）極快（< 50ms）、原生 ES Modules 支援
2. **建構速度**：Rollup 打包，生產環境優化完善（Tree Shaking、Code Splitting）
3. **Vue 官方建議**：Vue 3 官方推薦建構工具，配置簡單（`npm create vite@latest`）
4. **部署友善**：產出靜態檔案，直接支援 GitHub Pages / Cloudflare Pages / Vercel

### 替代方案考量
- **Webpack**：配置複雜、建構速度較慢（尤其大型專案），不適合小型快速迭代專案
- **Parcel**：零配置優勢，但生態系較小、進階優化能力不如 Vite

### 技術細節
- **版本**：Vite 5.x（最新穩定版）
- **外掛**：@vitejs/plugin-vue（Vue SFC 支援）、vite-plugin-pwa（PWA 支援）
- **產出**：dist/ 靜態檔案（HTML + JS + CSS + Assets）

---

## 3. 型別系統策略

### 決策：TypeScript

### 理由
1. **型別安全**：編譯時捕捉錯誤（欄位拼寫、型別不匹配），符合 Constitution Code Quality 原則
2. **IDE 支援**：VSCode 自動補全、重構工具、即時錯誤提示
3. **可維護性**：介面定義清晰（`ItineraryItem`, `TravelInfo`），降低團隊協作成本
4. **Vue 3 整合**：Composition API 提供完整型別推斷，配合 TypeScript 體驗極佳

### 替代方案考量
- **JSDoc**：註解式型別，無編譯檢查，易遺漏錯誤
- **無型別**：開發速度快，但重構風險高、除錯困難

### 技術細節
- **版本**：TypeScript 5.x
- **嚴格模式**：`strict: true`（啟用所有嚴格檢查）
- **配置**：tsconfig.json 繼承 Vue 官方推薦配置
- **型別定義位置**：`src/types/` 資料夾（`itinerary.ts`, `travelInfo.ts`）

---

## 4. 狀態管理方案

### 決策：Pinia + LocalStorage

### 理由
1. **Pinia 優勢**：
   - Vue 3 官方狀態管理庫（取代 Vuex 4）
   - TypeScript 原生支援、DevTools 整合、Composition API 風格一致
   - 模組化設計：`useItineraryStore`, `useTravelInfoStore`, `useUIStore`
2. **LocalStorage 用途**：
   - 持久化本地狀態（`isCompleted`, `isPacked`、快取版本號）
   - 跨分頁同步（Storage Event 監聽）
   - 不跨裝置（符合規格 Clarification）

### 替代方案考量
- **Vuex 4**：官方舊方案，但 TypeScript 支援較弱、配置繁瑣
- **純 LocalStorage**：無響應式系統，需手動觸發 UI 更新
- **IndexedDB**：過度設計（本專案資料量 < 1MB）

### 技術細節
- **Pinia Stores**：
  - `itineraryStore`：行程資料、日期導覽、搜尋過濾邏輯
  - `travelInfoStore`：旅遊資訊資料、分類過濾邏輯
  - `uiStore`：Loading 狀態、錯誤訊息、離線模式橫幅
- **LocalStorage Schema**：
  ```json
  {
    "travelGuide": {
      "completed": { "2024-01-01-景點-台北101": true },
      "packed": { "item-護照": true, "item-相機": false },
      "cacheVersion": "v1.0.0",
      "lastUpdate": "2024-01-01T12:00:00Z"
    }
  }
  ```

---

## 5. Google Sheet 解析策略

### 決策：PapaParse (CSV 格式)

### 理由
1. **CSV 優勢**：
   - 公開 Sheet 可直接匯出 CSV（URL 模式：`/export?format=csv&gid=<sheet_id>`）
   - 無需 Google API 金鑰、無配額限制、無 CORS 問題
   - 檔案小（純文字）、解析快
2. **PapaParse 優勢**：
   - 輕量（<50KB）、支援 Header Row 自動映射
   - 容錯能力強（引號跳脫、換行處理）
   - TypeScript 型別定義完善（`@types/papaparse`）

### 替代方案考量
- **JSON 格式**：Google Sheet 無官方 JSON 匯出；需第三方服務（不穩定）或 Apps Script（需維護）
- **Google Sheets API**：需 API Key（安全風險）、配額限制（每日 100 次）、CORS 配置複雜

### 技術細節
- **PapaParse 配置**：
  ```typescript
  Papa.parse<ItineraryRow>(csvUrl, {
    download: true,
    header: true, // 自動將第一行作為欄位名稱
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(), // 移除空白
    complete: (results) => { /* 處理資料 */ },
    error: (error) => { /* 錯誤處理 */ }
  });
  ```
- **CSV URL 模式**：
  ```
  https://docs.google.com/spreadsheets/d/{SHEET_ID}/export?format=csv&gid={GID}
  ```

---

## 6. 多工作表（Multi-Sheet）策略

### 決策：URL 模式匹配 + gid 參數

### 理由
1. **Google Sheet 結構**：單一 Google Sheet 包含多個工作表（Sheet1, Sheet2, ...）
2. **gid 參數**：每個工作表有唯一 `gid`（工作表 ID），可透過 URL 參數指定
3. **實作策略**：
   - 預設工作表名稱：「行程」(gid 預設 0)、「旅遊資訊」(gid 需查詢)
   - 配置檔指定多個 gid（`config.ts`）
   - 分別載入兩個 CSV

### 替代方案考量
- **第二個 Google Sheet**：增加配置複雜度、使用者需維護兩個 Sheet URL
- **單一工作表合併**：資料結構混亂、欄位映射複雜

### 技術細節
- **配置檔範例**：
  ```typescript
  export const config = {
    googleSheetId: '1ABC...XYZ',
    sheets: {
      itinerary: { name: '行程', gid: 0 },
      travelInfo: { name: '旅遊資訊', gid: 123456 }
    }
  };
  ```
- **載入邏輯**：
  ```typescript
  const itineraryUrl = buildSheetUrl(config.googleSheetId, config.sheets.itinerary.gid);
  const travelInfoUrl = buildSheetUrl(config.googleSheetId, config.sheets.travelInfo.gid);
  ```

---

## 7. PWA 快取策略

### 決策：Workbox

### 理由
1. **Workbox 優勢**：
   - Google 官方 Service Worker 工具庫、配置簡單
   - 預快取（Precache）+ 執行時快取（Runtime Cache）策略完善
   - Vite 整合良好（`vite-plugin-pwa`）
2. **快取策略**：
   - **Precache**（預快取）：CSS/JS/字型（版本化，自動更新）
   - **Runtime Cache**（執行時快取）：Google Sheet CSV（Cache-First 策略 + 過期時間 1 小時）
   - **圖片快取**：Cache-First + 失敗 Fallback（替代圖）

### 替代方案考量
- **手動 Service Worker**：彈性高但維護成本高、容易出錯（快取版本管理、更新邏輯複雜）

### 技術細節
- **Workbox 策略**：
  ```javascript
  // 預快取（建構時生成）
  precacheAndRoute(self.__WB_MANIFEST);

  // Google Sheet CSV（執行時快取，1 小時過期）
  registerRoute(
    ({ url }) => url.hostname === 'docs.google.com',
    new CacheFirst({
      cacheName: 'google-sheets',
      plugins: [
        new ExpirationPlugin({ maxAgeSeconds: 3600 }),
        new CacheableResponsePlugin({ statuses: [0, 200] })
      ]
    })
  );

  // 圖片（快取優先 + Fallback）
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'images',
      plugins: [
        new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 86400 })
      ]
    })
  );
  ```
- **離線偵測**：
  ```javascript
  self.addEventListener('fetch', (event) => {
    event.respondWith(
      caches.match(event.request).then((response) => {
        if (response) return response;
        return fetch(event.request).catch(() => {
          // 顯示離線頁面或快取資料
          return caches.match('/offline.html');
        });
      })
    );
  });
  ```

---

## 8. 測試框架選擇

### 決策：Vitest + Playwright

### 理由
1. **Vitest 優勢**（單元測試 + 整合測試）：
   - Vite 官方測試框架、配置零成本（共用 Vite 配置）
   - 快速（ESM 原生支援、並行執行）
   - Jest 相容 API（易遷移）、Vue 測試工具整合（@vue/test-utils）
2. **Playwright 優勢**（E2E 測試）：
   - 跨瀏覽器支援（Chromium, Firefox, WebKit）
   - 行動裝置模擬（RWD 測試）
   - 截圖 + 錄影功能（除錯利器）

### 替代方案考量
- **Jest**：配置繁瑣、需額外轉換器（Babel/ts-jest）、執行速度較慢
- **Cypress**：E2E 強大但僅支援 Chromium-based 瀏覽器、執行速度較慢

### 技術細節
- **測試分層**：
  - **Unit Tests** (Vitest)：Google Sheet 解析、欄位映射、搜尋過濾邏輯、日期導覽
  - **Component Tests** (Vitest + @vue/test-utils)：卡片元件、日期選擇器、搜尋框
  - **E2E Tests** (Playwright)：完整使用者旅程（載入 → 切換日期 → 搜尋 → 深連結 → 離線模式）
- **測試覆蓋率目標**：
  - 關鍵邏輯（解析、映射、狀態管理）：≥ 90%
  - UI 元件：≥ 70%
  - 整體：≥ 80%

---

## 9. 路由方案選擇

### 決策：Vue Router 4

### 理由
1. **官方方案**：Vue 3 官方路由庫、型別完整、DevTools 整合
2. **深連結支援**：Query 參數處理簡單（`?date=2024-01-01&item=taipei-101`）
3. **History Mode**：HTML5 History API（無 `#` 符號），部署需配置 Fallback
4. **Lazy Loading**：路由層級 Code Splitting（改善首次載入）

### 替代方案考量
- **原生 History API**：無型別安全、路由邏輯需手動實作、不利維護

### 技術細節
- **路由配置**：
  ```typescript
  const routes = [
    { path: '/', component: () => import('./views/ItineraryView.vue') },
    { path: '/travel-info', component: () => import('./views/TravelInfoView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' } // 404 Fallback
  ];
  ```
- **深連結處理**：
  ```typescript
  const route = useRoute();
  const targetDate = route.query.date as string; // YYYY-MM-DD
  const targetItem = route.query.item as string; // slug
  ```
- **部署配置**（GitHub Pages / Vercel）：
  - 需設定 404.html 或 Rewrite 規則以支援 History Mode

---

## 10. RWD 斷點設計

### 決策：Tailwind CSS 標準斷點

### 理由
1. **Utility-First CSS**：開發速度快、產出檔案小（PurgeCSS 自動移除未使用樣式）
2. **標準斷點**（符合業界標準）：
   - `sm`: 640px（小型平板直向）
   - `md`: 768px（平板橫向）
   - `lg`: 1024px（小型桌機）
   - `xl`: 1280px（標準桌機）
   - `2xl`: 1536px（大型桌機）
3. **Mobile-First**：預設樣式為行動裝置，向上疊加桌機樣式

### 替代方案考量
- **Bootstrap**：包體積大（~200KB）、自訂困難、過時設計風格
- **手寫 CSS**：彈性高但維護成本高、命名一致性難保證

### 技術細節
- **斷點策略**：
  - **Mobile (< 640px)**：單欄卡片、全寬按鈕、折疊選單
  - **Tablet (640px - 1024px)**：雙欄卡片、側邊選單
  - **Desktop (≥ 1024px)**：三欄卡片、固定側邊欄、展開所有選單
- **關鍵樣式範例**：
  ```html
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- 行動：1 欄 | 平板：2 欄 | 桌機：3 欄 -->
  </div>
  ```

---

## 11. 效能優化策略

### 決策：資源分割 + Lazy Load + HTTP/2

### 理由
1. **首次載入延遲問題**：Constitution 要求 < 500ms，但規格目標 2-3s（合理權衡）
2. **優化策略**：
   - **Code Splitting**：路由層級分割（Vue Router Lazy Import）+ 動態 Import（Intersection Observer）
   - **圖片 Lazy Load**：IntersectionObserver API + `loading="lazy"` 屬性
   - **HTTP/2 Server Push**：部署平台（Cloudflare/Vercel）原生支援
   - **Resource Hints**：`<link rel="preload">` 關鍵資源（字型、首屏 CSS）

### 替代方案考量
- **SSR (Server-Side Rendering)**：需後端（違反純前端架構約束）
- **SSG (Static Site Generation)**：資料動態（Google Sheet），不適合預渲染

### 技術細節
- **Vite 配置（資源分割）**：
  ```javascript
  export default {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia'],
            'parser': ['papaparse']
          }
        }
      }
    }
  };
  ```
- **圖片 Lazy Load 元件**：
  ```vue
  <template>
    <img v-lazy="imageUrl" :alt="imageAlt" @error="handleImageError" />
  </template>
  ```
- **Lighthouse CI**：每次 PR 自動執行 Lighthouse 檢查（FCP, LCP, TTI 指標）

---

## 研究結論

### 核心技術堆疊

| 層級 | 技術選型 | 版本 |
|------|---------|------|
| 前端框架 | Vue 3 (Composition API) | 3.4+ |
| 建構工具 | Vite | 5.x |
| 型別系統 | TypeScript | 5.x |
| 狀態管理 | Pinia + LocalStorage | 2.x |
| 路由 | Vue Router | 4.x |
| 樣式框架 | Tailwind CSS | 3.x |
| Google Sheet 解析 | PapaParse | 5.x |
| PWA | Workbox (vite-plugin-pwa) | 0.17+ |
| 測試 | Vitest + Playwright | 1.x + 1.40+ |

### 未解決問題（Phase 1 處理）

1. **欄位映射表設計**：具體欄位名稱映射規則（data-model.md）
2. **CSV 欄位命名規範**：Google Sheet 欄位標準命名（contracts/）
3. **錯誤處理策略**：具體錯誤碼與使用者提示文案（quickstart.md）
4. **部署流程**：CI/CD 配置與部署平台選擇（GitHub Actions + Cloudflare Pages）

### 風險評估

| 風險 | 嚴重性 | 緩解策略 |
|------|--------|---------|
| Google Sheet CSV 格式變更 | 中 | 版本化映射表 + 寬鬆解析 + 錯誤告警 |
| 首次載入超出 500ms 預算 | 低 | 已提供優化策略（Code Splitting + Lazy Load），實測後調整 |
| 離線模式快取過期 | 低 | 橫幅提示 + 手動重新整理按鈕 |
| 跨瀏覽器相容性 | 極低 | Playwright E2E 測試覆蓋主流瀏覽器 |

---

**研究完成日期**: 2025-12-05  
**下一步**: 進入 Phase 1，產出 data-model.md、contracts/、quickstart.md
