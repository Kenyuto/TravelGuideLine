# Research & Technical Decisions

> **Phase 0 Output**: 本文件記錄所有技術決策、權衡評估與最佳實踐研究結果。

## Feature Context

- **Feature**: 旅遊行程檢視網站（含登入驗證）
- **Branch**: 001-itinerary-view
- **Specification**: [spec.md](./spec.md)

---

## Technical Decisions

### 1. Frontend Framework: Vue 3 (Composition API)

**Decision**: 採用 Vue 3.4+ with Composition API

**Rationale**:
- **Composition API 優勢**: 邏輯重用（composables）、型別推斷更好、程式碼組織更清晰
- **生態系成熟度**: Pinia (狀態管理)、Vue Router 4、Vite 原生支援
- **效能表現**: Proxy-based reactivity、Tree-shaking 支援、bundle size 小於 React
- **學習曲線**: 團隊已熟悉 Vue 3，降低開發時間

**Alternatives Considered**:
- ❌ **React 18**: Context API 冗長、狀態管理需額外 Redux/Zustand、bundle size 較大
- ❌ **Svelte 4**: 生態系較小、第三方套件選擇少、團隊需學習成本
- ❌ **Vanilla JS**: 無 reactive system、需手動 DOM 操作、開發效率低

**References**:
- [Vue 3 Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Vue 3 Performance](https://vuejs.org/guide/best-practices/performance.html)

---

### 2. Build Tool: Vite 5.x

**Decision**: 採用 Vite 5.x 作為建置工具

**Rationale**:
- **開發體驗**: HMR (Hot Module Replacement) 極快，啟動時間 < 1 秒
- **生產建置**: 使用 Rollup，支援 code splitting、tree-shaking、asset optimization
- **原生 ESM**: 利用瀏覽器原生 ES Modules，減少 bundle overhead
- **PWA 支援**: vite-plugin-pwa 提供完整 Workbox 整合

**Alternatives Considered**:
- ❌ **Webpack 5**: 配置複雜、啟動時間慢（> 5 秒）、HMR 效能較差
- ❌ **Parcel 2**: 零配置但客製化選項少、plugin 生態系不如 Vite

**References**:
- [Vite Guide](https://vitejs.dev/guide/)
- [Vite Plugin PWA](https://vite-pwa-org.netlify.app/)

---

### 3. Type System: TypeScript 5.x (Strict Mode)

**Decision**: 採用 TypeScript 5.x with strict mode enabled

**Rationale**:
- **型別安全**: 編譯期捕捉錯誤（空值檢查、型別不符）
- **開發體驗**: IDE 自動完成、重構工具、inline documentation
- **維護性**: 大型專案可讀性高、減少執行時錯誤
- **生態系**: Vue 3 原生 TypeScript 支援、Pinia 完整型別推斷

**Strict Mode Options**:
```json
{
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "noFallthroughCasesInSwitch": true
}
```

**Alternatives Considered**:
- ❌ **JSDoc**: 型別覆蓋率低、無編譯期檢查、IDE 支援較弱
- ❌ **無型別**: 執行時錯誤多、重構困難、團隊協作風險高

**References**:
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Vue TypeScript Guide](https://vuejs.org/guide/typescript/overview.html)

---

### 4. State Management: Pinia 2.x + LocalStorage

**Decision**: 採用 Pinia 2.x 作為全域狀態管理，LocalStorage 作為持久化層

**Rationale**:
- **Pinia 優勢**: Vue 3 官方推薦、TypeScript 支援完整、DevTools 整合、模組化設計
- **LocalStorage 選擇**: 
  - 符合規格要求（登入狀態 7 天持久化，FR-013）
  - 純前端架構（無 backend session）
  - 5MB 容量足夠（auth state < 10KB, completion state < 50KB）
  - 同步 API 簡單（不需 async IndexedDB）

**Store Structure**:
```typescript
// AuthStore: 登入驗證狀態
state: { isAuthenticated, authTimestamp, passwordList }
actions: { loadAuthConfig, validatePassword, login, logout }

// ItineraryStore: 行程資料
state: { days, currentDate, searchQuery, completedItems }
actions: { loadItinerary, switchDate, search, toggleComplete }

// TravelInfoStore: 旅遊資訊
state: { items, selectedCategory, packedItems }
actions: { loadTravelInfo, filterByCategory, togglePacked }

// UIStore: UI 狀態
state: { loading, error, isOffline }
actions: { showError, clearError, setOffline }
```

**Alternatives Considered**:
- ❌ **Vuex 4**: 語法冗長（mutations/actions 分離）、TypeScript 支援差
- ❌ **Composition API only**: 分散的 reactive state，難以跨元件共享、無 DevTools

**References**:
- [Pinia Documentation](https://pinia.vuejs.org/)
- [LocalStorage Best Practices](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)

---

### 5. Google Sheet Data Parsing: PapaParse 5.x (CSV)

**Decision**: 使用 PapaParse 5.x 解析 Google Sheets CSV export

**Rationale**:
- **CSV 優勢**: 
  - 檔案大小比 JSON 小 30-40%（無欄位名稱重複）
  - Google Sheets 原生支援 `/export?format=csv`
  - 瀏覽器快取友善（純文字）
- **PapaParse 優勢**:
  - 自動型別偵測（數字、日期）
  - 錯誤處理完善（跳過空白列、處理引號）
  - Stream parsing 支援（未來可處理大型行程）
  - 11KB gzipped（輕量）

**CSV Export URL Format**:
```javascript
const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
// gid=0: 行程 (Itinerary)
// gid=1: 旅遊資訊 (TravelInfo)
// gid=2: 登入設定 (AuthConfig)
```

**Alternatives Considered**:
- ❌ **Google Sheets API v4**: 需 API key、配額限制、CORS 問題、違反無後端限制
- ❌ **JSON export**: 檔案大 30-40%、需額外轉換步驟（Apps Script）
- ❌ **手動 CSV parsing**: 需處理引號、換行、特殊字元，維護成本高

**References**:
- [PapaParse Documentation](https://www.papaparse.com/docs)
- [Google Sheets CSV Export](https://support.google.com/docs/answer/183965)

---

### 6. Multi-Sheet Strategy: GID Parameter

**Decision**: 使用 Google Sheets `gid` 參數切換不同工作表

**Rationale**:
- **單一 spreadsheet 管理**: 所有資料（行程 + 旅遊資訊 + 登入設定）在同一 Google Sheet
- **簡化權限控制**: 只需分享一個連結，不需管理多個 spreadsheets
- **版本控制**: 所有資料變更在同一歷史記錄
- **使用者體驗**: 編輯資料不需切換多個 Google Sheet 視窗

**GID Mapping**:
| 工作表名稱 | GID | 用途 | 更新頻率 |
|-----------|-----|------|---------|
| 行程 | 0 (預設) | ItineraryItem[] | 行程規劃階段 |
| 旅遊資訊 | 1 | InfoItem[] | 行程規劃階段 |
| 登入設定 | 2 | AuthConfig | 首次設定 + 密碼更新 |

**Alternatives Considered**:
- ❌ **多個 spreadsheets**: 權限管理複雜、URL 設定繁瑣、版本控制困難
- ❌ **單一工作表 + 分隔符**: 解析邏輯複雜、錯誤率高、使用者體驗差

**References**:
- [Google Sheets GID Parameter](https://webapps.stackexchange.com/questions/71957/what-is-the-gid-in-a-google-spreadsheet)

---

### 7. PWA Cache Strategy: Workbox (vite-plugin-pwa)

**Decision**: 採用 Workbox with NetworkFirst + CacheFirst 混合策略

**Rationale**:
- **vite-plugin-pwa 優勢**: 
  - 零配置基礎設定（manifest.json、service worker 自動生成）
  - Workbox 整合（成熟的快取策略）
  - 自動產生 PWA icons
  - TypeScript 支援
- **快取策略設計**:
  ```javascript
  // NetworkFirst: 資料檔案（CSV）
  runtimeCaching: [{
    urlPattern: /.*\.googleapis\.com.*csv.*/,
    handler: 'NetworkFirst',
    options: {
      cacheName: 'sheet-data',
      expiration: { maxAgeSeconds: 7 * 24 * 60 * 60 } // 7 天
    }
  }]
  
  // CacheFirst: 靜態資源（JS/CSS/Images）
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
  ```

**Offline Behavior**:
1. **首次載入**: 下載所有資料並快取
2. **再次訪問**: 優先使用網路（獲取最新資料），失敗則使用快取
3. **完全離線**: 使用快取資料，顯示「離線模式」提示

**Alternatives Considered**:
- ❌ **手動 Service Worker**: 維護成本高、容易出錯、無自動更新機制
- ❌ **CacheFirst everywhere**: 資料不即時（使用者看到舊行程）
- ❌ **NetworkOnly**: 無離線支援，違反 PWA 規格（FR-004）

**References**:
- [Workbox Strategies](https://developer.chrome.com/docs/workbox/modules/workbox-strategies/)
- [vite-plugin-pwa Guide](https://vite-pwa-org.netlify.app/guide/)

---

### 8. Testing Strategy: Vitest + Playwright

**Decision**: 採用 Vitest (unit/integration) + Playwright (E2E) 分層測試

**Rationale**:
- **Vitest 優勢**:
  - Vite 原生整合（共用 config、快速執行）
  - Jest-compatible API（熟悉語法）
  - ESM 原生支援（無需 transform）
  - 執行速度快（< 5 秒）
- **Playwright 優勢**:
  - 跨瀏覽器測試（Chrome, Firefox, Safari）
  - 內建 test runner（無需額外設定）
  - 截圖與影片錄製（除錯友善）
  - 網路攔截（測試 offline 模式）

**Test Coverage Requirements** (Constitution Testing Standards):
```typescript
// Unit Tests (utils/, stores/)
- googleSheetParser.ts: CSV 解析、欄位映射、錯誤處理
- authHelper.ts: LocalStorage 狀態管理、密碼驗證、過期檢查
- searchHelper.ts: 關鍵字搜尋、標籤過濾、日期範圍
- dateHelper.ts: 日期格式化、範圍計算

// Integration Tests (stores/ + components/)
- AuthStore: loadAuthConfig → validatePassword → login → logout
- ItineraryStore: loadItinerary → switchDate → search → toggleComplete
- TravelInfoStore: loadTravelInfo → filterByCategory → togglePacked

// E2E Tests (完整使用者旅程)
- login.spec.ts: 正確密碼登入 → 錯誤密碼 → 密碼過期 → 登出
- itinerary.spec.ts: 載入行程 → 切換日期 → 搜尋 → 標記完成 → 深連結
- offline.spec.ts: 首次載入 → 離線 → 快取資料顯示 → 重新上線
```

**Alternatives Considered**:
- ❌ **Jest**: 需 Babel transform、ESM 支援差、執行速度慢
- ❌ **Cypress**: 僅 Chrome-based 瀏覽器、test runner 較重、學習曲線高
- ❌ **Puppeteer**: 僅 Chrome、無內建 test runner、需額外斷言庫

**References**:
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [Vue Testing Handbook](https://lmiller1990.github.io/vue-testing-handbook/)

---

### 9. Routing: Vue Router 4.x (Hash Mode)

**Decision**: 採用 Vue Router 4.x with Hash mode (`#/`)

**Rationale**:
- **Hash Mode 優勢**:
  - 無需伺服器配置（純靜態部署）
  - 支援所有靜態主機（GitHub Pages, Netlify, Vercel）
  - 深連結不需 server rewrite rules
- **路由結構**:
  ```javascript
  const routes = [
    { path: '/', component: LoginView, meta: { requiresAuth: false } },
    { path: '/itinerary', component: ItineraryView, meta: { requiresAuth: true } },
    { path: '/travel-info', component: TravelInfoView, meta: { requiresAuth: true } }
  ];
  ```
- **Auth Guard**:
  ```javascript
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    if (to.meta.requiresAuth && !authStore.isLoginValid) {
      next('/');
    } else {
      next();
    }
  });
  ```

**Deep Link Support** (FR-008 Clarified):
```
https://example.com/#/itinerary?date=2024-01-15
https://example.com/#/travel-info?category=住宿
```

**Alternatives Considered**:
- ❌ **History Mode**: 需伺服器 rewrite rules（違反純前端限制）
- ❌ **無路由**: URL 無法分享、瀏覽器前後鍵失效、SEO 差（雖本專案不需 SEO）

**References**:
- [Vue Router 4](https://router.vuejs.org/)
- [Hash vs History Mode](https://router.vuejs.org/guide/essentials/history-mode.html)

---

### 10. UI Framework: Tailwind CSS 3.x (Mobile-First RWD)

**Decision**: 採用 Tailwind CSS 3.x with mobile-first responsive design

**Rationale**:
- **Tailwind 優勢**:
  - Utility-first（快速開發、無 CSS 命名煩惱）
  - PurgeCSS 內建（生產 bundle < 10KB）
  - 客製化容易（tailwind.config.js）
  - JIT mode（即時編譯任意值）
- **RWD Breakpoints**:
  ```javascript
  // Tailwind 預設斷點
  sm: '640px',   // 手機橫向
  md: '768px',   // 平板直向
  lg: '1024px',  // 平板橫向/筆電
  xl: '1280px'   // 桌機
  ```
- **Mobile-First 策略**:
  ```html
  <!-- 預設手機版樣式，向上覆寫 -->
  <div class="p-4 md:p-6 lg:p-8">
    <h1 class="text-xl md:text-2xl lg:text-3xl">行程</h1>
  </div>
  ```

**Alternatives Considered**:
- ❌ **Bootstrap 5**: Class 名稱冗長、客製化困難、bundle size 大（> 50KB）
- ❌ **Custom CSS**: 命名困難（BEM 冗長）、維護成本高、無 PurgeCSS
- ❌ **CSS-in-JS (Styled Components)**: Runtime overhead、SSR 複雜度（本專案無 SSR）

**References**:
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Mobile-First Design](https://tailwindcss.com/docs/responsive-design)

---

### 11. Performance Optimization Strategy

**Decision**: 採用 Code Splitting + Lazy Loading + Preload 組合

**Rationale**:
- **Code Splitting**:
  ```javascript
  // Vue Router lazy loading
  const ItineraryView = () => import('./views/ItineraryView.vue');
  const TravelInfoView = () => import('./views/TravelInfoView.vue');
  ```
  - 減少首次載入 bundle size（只載入 LoginView）
  - 登入後再載入行程與旅遊資訊元件
  
- **Preload Critical Resources**:
  ```html
  <link rel="preload" href="/auth-config.csv" as="fetch" crossorigin>
  <link rel="prefetch" href="/itinerary.csv">
  ```
  - LoginView 預載入 AuthConfig（登入驗證需要）
  - 背景預取 Itinerary CSV（登入成功後立即可用）

- **Asset Optimization**:
  - Vite 自動處理：圖片壓縮、CSS minify、JS terser
  - PWA icons 多尺寸生成（192x192, 512x512）

**Performance Targets**:
| Metric | Target | Measure |
|--------|--------|---------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Largest Contentful Paint | < 2.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Login Validation | < 1s | Custom timing |
| Date Switch | < 500ms | Custom timing |
| Search Filter | < 200ms | Custom timing |

**Monitoring Strategy**:
- **Development**: Vite bundle analyzer、Vue DevTools performance
- **CI/CD**: Lighthouse CI（每次 PR 檢查效能分數）
- **Production**: Web Vitals API（Real User Monitoring）

**Alternatives Considered**:
- ❌ **無 code splitting**: 首次載入 > 5s（包含所有元件）
- ❌ **積極 prefetch 所有資源**: 浪費頻寬（使用者可能不訪問 TravelInfo）
- ❌ **Server-side rendering (SSR)**: 違反純前端限制、增加複雜度

**References**:
- [Vite Code Splitting](https://vitejs.dev/guide/features.html#code-splitting)
- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)

---

## Authentication Considerations

### Client-Side Password Validation Strategy

**Decision**: 採用 LocalStorage + SHA-256 hash (optional) 的友善隱私機制

**Security Model**:
- **威脅模型**: 私人旅遊行程分享（家人/朋友），非公開網站或機密資料
- **可接受風險**:
  1. ✅ CSV URL 可見（網路檢查工具）→ 接受（Google Sheet 已設為「知道連結的人可檢視」）
  2. ✅ LocalStorage 可繞過（開發者工具）→ 接受（無敏感個資）
  3. ✅ 網路攔截（HTTPS 中間人攻擊）→ 緩解（強制 HTTPS）
- **不可接受風險**:
  ❌ 密碼明文儲存於程式碼 → 緩解（密碼存於 Google Sheet「登入設定」tab）
  ❌ 無限次重試 → 接受（規格明確無鎖定機制，FR-023）

**Implementation Strategy**:
```typescript
interface AuthItem {
  password: string;           // 原始密碼（從 Google Sheet 載入）
  description?: string;       // 密碼用途說明
  expiryDate?: string;        // YYYY-MM-DD 格式
  isValid: boolean;           // 計算屬性（檢查是否過期）
}

// 驗證邏輯
function validatePassword(input: string, authConfig: AuthConfig): boolean {
  const validPasswords = authConfig.items.filter(item => item.isValid);
  return validPasswords.some(item => item.password === input);
}

// LocalStorage schema
interface AuthState {
  isAuthenticated: boolean;
  authTimestamp: number;      // Unix timestamp
  version: string;            // '1.0.0' (未來遷移用)
}
```

**密碼過期處理** (FR-026):
1. 載入 Google Sheet「登入設定」tab
2. 解析每個 AuthItem 的 `expiryDate`
3. 計算 `isValid = !expiryDate || new Date(expiryDate) >= new Date()`
4. 僅驗證 `isValid === true` 的密碼

**7 天登入持久化** (FR-013):
```typescript
function isLoginValid(): boolean {
  const authState = loadAuthState();
  if (!authState || !authState.isAuthenticated) return false;
  
  const now = Date.now();
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  return (now - authState.authTimestamp) < sevenDays;
}
```

**Optional SHA-256 Enhancement** (未來改進):
- Google Sheet 可儲存 SHA-256 hash 而非明文密碼
- 前端驗證：`hash(input) === storedHash`
- 優點：CSV 洩漏不直接暴露密碼
- 缺點：需使用者手動產生 hash（增加設定複雜度）

**Security Tradeoff Documentation** (spec.md Q4):
> 此機制適用於私人旅遊分享（家人朋友），**不適用於公開網站或機密資料**。  
> 設計理念：在免費部署（無後端成本）限制下，提供基本存取控制。

**Alternatives Considered**:
- ❌ **OAuth (Google Login)**: 需後端驗證 token、違反純前端限制
- ❌ **JWT**: 需後端簽發、無法純前端實作
- ❌ **完全無驗證**: 不符合規格要求（User Story 0, P0 priority）

**References**:
- [LocalStorage Security](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#local-storage)
- [Web Crypto API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)

---

## Risk Assessment

| 風險 | 機率 | 影響 | 緩解策略 | 責任方 |
|------|------|------|---------|--------|
| Google Sheets API 配額限制 | 低 | 高 | 使用 CSV export（無配額限制） | 已緩解 |
| 密碼在 CSV 中被發現 | 中 | 低 | 文件說明使用情境、建議定期更換密碼 | 使用者 |
| LocalStorage 7 天過期未登出 | 高 | 低 | 自動檢查 `isLoginValid()`，過期自動導向登入頁 | 已緩解 |
| 離線模式資料過舊 | 中 | 中 | 重新上線時 NetworkFirst 更新快取、顯示「最後更新時間」 | 已緩解 |
| 多密碼管理混亂 | 低 | 低 | 要求每個密碼加上 `description` 說明用途 | 使用者 |
| PWA 未自動更新 | 低 | 中 | Workbox 自動檢查更新、提示「有新版本」 | 已緩解 |
| TypeScript strict mode 開發速度慢 | 中 | 低 | 初期投入設定型別、中後期減少 bug 時間 | 開發團隊 |
| E2E 測試 flaky | 中 | 中 | Playwright retry 機制、避免硬編碼 sleep | 開發團隊 |

---

## Best Practices Research

### Vue 3 Composition API Patterns
- **Composables**: 提取可重用邏輯（useAuth, useItinerary, useSearch）
- **Ref vs Reactive**: 簡單值用 `ref`、物件用 `reactive`
- **Watch vs WatchEffect**: 需舊值時用 `watch`、副作用用 `watchEffect`
- **Provide/Inject**: 跨層級傳遞 theme 或 config（本專案可能不需要）

**References**:
- [Vue 3 Composition API Best Practices](https://vuejs.org/guide/reusability/composables.html)

### Pinia Store Patterns
- **State Normalization**: 避免巢狀物件、使用 Map/Record 結構
- **Getters Memoization**: 複雜計算使用 getters（自動快取）
- **Actions Error Handling**: 統一錯誤處理模式（try-catch + UIStore.showError）
- **Persist Plugin**: 使用 `pinia-plugin-persistedstate` 簡化 LocalStorage 同步

**References**:
- [Pinia Core Concepts](https://pinia.vuejs.org/core-concepts/)

### Tailwind CSS Patterns
- **Component Classes**: 使用 `@apply` 提取重複樣式到 `@layer components`
- **Custom Utilities**: 專案特定工具類（如 `.card-shadow`）定義於 `@layer utilities`
- **Dark Mode**: 未來支援可使用 `class` 策略（手動切換）

**References**:
- [Tailwind Best Practices](https://tailwindcss.com/docs/reusing-styles)

### Testing Patterns
- **AAA Pattern**: Arrange（準備）→ Act（執行）→ Assert（斷言）
- **Test Doubles**: Mock 外部依賴（fetch, localStorage）、Spy 追蹤函數呼叫
- **Accessibility Testing**: Playwright `axe-core` 整合、ARIA 屬性檢查

**References**:
- [Testing Library Principles](https://testing-library.com/docs/guiding-principles/)

---

## Constitution Compliance Re-Check

### Code Quality ✅
- ESLint + Prettier 已規劃
- TypeScript strict mode 已選擇
- JSDoc 註解於 Phase 1 定義於 contracts/frontend-api.md

### Testing Standards ✅
- TDD 流程已規劃
- Unit tests 覆蓋 utils/ 與 stores/
- Contract tests 覆蓋 Google Sheet schema
- Integration tests 覆蓋 stores + components
- E2E tests 覆蓋完整使用者旅程

### UX Consistency ✅
- 術語統一（規格已定義）
- 錯誤訊息可操作（重試按鈕）
- Accessibility 考慮（RWD、ARIA）

### Performance ⚠️
- 首次載入 2-3s 仍超出 500ms 預算（已於 Complexity Tracking 正當化）
- 本地操作 < 200ms 符合要求

### Simplicity ✅
- 純前端架構（無後端）
- 標準化技術棧（無過度工程）
- 友善隱私機制（最簡驗證方案）

---

## Next Steps

Phase 0 完成後，進入 **Phase 1: Design**：
1. ✅ Generate data-model.md（6 個實體定義 + TypeScript interfaces）
2. ✅ Generate contracts/google-sheet-csv.md（3 個工作表結構）
3. ✅ Generate contracts/frontend-api.md（4 個 Pinia stores + 元件合約）
4. ✅ Generate quickstart.md（開發環境設定指南）
5. ✅ Re-validate Constitution Check（Phase 1 設計後重新檢查）

**Phase 2 (NOT part of /speckit.plan)**: Task generation via `/speckit.tasks` command
