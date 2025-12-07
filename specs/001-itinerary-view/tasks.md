# 任務清單：旅遊行程檢視網站（含登入驗證）

**功能**: 001-itinerary-view  
**分支**: 001-itinerary-view  
**輸入**: 來自 `/specs/001-itinerary-view/` 的設計文件

**前置條件**: 
- ✅ plan.md（實作計畫與技術棧）
- ✅ spec.md（5 個使用者故事：P0 登入、P1 行程檢視、P2 搜尋/過濾、P2 旅遊資訊、P3 深連結）
- ✅ research.md（11 項技術決策）
- ✅ data-model.md（6 個實體：AuthConfig、AuthItem、ItineraryDay、ItineraryItem、TravelInfo、InfoItem）
- ✅ contracts/google-sheet-csv.md（3 個工作表：行程 GID 0、旅遊資訊 GID 1、登入設定 GID 2）
- ✅ contracts/frontend-api.md（4 個 Pinia stores、5 個元件、5 個工具函數、4 個錯誤型別）

**測試**: 依據 Constitution 要求包含測試（unit + integration + E2E 覆蓋）

**組織方式**: 任務依使用者故事分組，以利獨立實作與測試

---

## 格式：`- [ ] [TID] [P?] [Story?] 描述與檔案路徑`

- **[P]**：可平行執行（不同檔案，無未完成任務的相依性）
- **[Story]**：此任務屬於哪個使用者故事（US0、US1、US2、US3、US4）
- 所有任務皆包含明確的檔案路徑

---

## Phase 1: 專案設置（共用基礎設施）

**目的**：專案初始化與基本結構

- [X] T001 建立專案目錄結構（src/、tests/、public/、docs/）
- [X] T002 初始化 Vue 3 + Vite 5.x + TypeScript 5.x 專案，依據 package.json 安裝相依套件
- [X] T003 [P] 設定 ESLint + Prettier 支援 Vue 3 + TypeScript 嚴格模式
- [X] T004 [P] 在 vitest.config.ts 中設定 Vitest 1.x 進行單元/整合測試
- [X] T005 [P] 在 playwright.config.ts 中設定 Playwright 1.40+ 進行 E2E 測試
- [X] T006 [P] 在 tailwind.config.js 中設定 Tailwind CSS 3.x 及 mobile-first 配置
- [X] T007 [P] 建立 .env.example 檔案，包含 VITE_GOOGLE_SHEET_ID 佔位符
- [X] T008 [P] 設定 Git pre-commit hooks（lint-staged + Husky）以確保程式碼品質

---

## Phase 2: 基礎架構（必須優先完成）

**目的**：建立在任何使用者故事實作前必須完成的核心基礎設施

**⚠️ 重要**：此階段完成前，無法開始任何使用者故事的工作

- [X] T009 在 src/types/auth.ts 中建立 TypeScript 型別（AuthConfig、AuthItem）
- [X] T010 [P] 在 src/types/itinerary.ts 中建立 TypeScript 型別（ItineraryDay、ItineraryItem）
- [X] T011 [P] 在 src/types/travelInfo.ts 中建立 TypeScript 型別（TravelInfo、InfoItem）
- [X] T012 [P] 在 src/types/common.ts 中建立 TypeScript 型別（4 個錯誤型別：GoogleSheetError、InvalidPasswordError、PasswordExpiredError、ParsingError）
- [X] T013 在 src/utils/googleSheetParser.ts 中實作 googleSheetParser 工具函數（3 個函數：parseGoogleSheetCSV、getGoogleSheetCSVUrl、fetchGoogleSheetCSV，使用 PapaParse 5.x）
- [X] T014 [P] 在 src/utils/dateHelper.ts 中實作 dateHelper 工具函數（4 個函數：formatDate、parseDate、daysBetween、getToday）
- [X] T015 [P] 在 src/utils/authHelper.ts 中實作 authHelper 工具函數（4 個函數：saveAuthState、loadAuthState、clearAuthState、isLoginValid，支援 7 天有效期）
- [X] T016 在 src/router/index.ts 中建立 Vue Router 4.x 配置（Hash 模式，3 個路由：/、/itinerary、/travel-info）
- [X] T017 建立主要 App.vue 檔案，包含 RouterView 與全域 loading/error 狀態
- [X] T018 建立 main.ts 進入點，包含 Pinia + Router + App 掛載

**檢查點**：基礎設施就緒 - 使用者故事現在可以開始平行實作

---

## Phase 3: 使用者故事 0 — 登入驗證（優先座：P0）🔒 安全閘道

**目標**：實作驗證閘道，從 Google Sheet 驗證密碼，7 天登入持續性，無限重試

**獨立測試**： 
- 直接訪問 / → 顯示登入頁面及密碼輸入框
- 有效密碼（Google Sheet 「登入設定」中的任何一個）→ 進入 /itinerary 頁面
- 無效密碼 → 顯示錯誤「密碼錯誤，請重新輸入」，允許無限重試
- 7 天內 → 自動登入，直接前往 /itinerary
- 7 天後 → 登入過期，顯示登入頁面
- Google Sheet 「登入設定」遺失/空白 → 顯示錯誤「無法載入登入設定，請聯絡管理員」

### 使用者故事 0 實作

- [X] T019 [P] [US0] 在 src/stores/auth.ts 中建立 AuthStore（3 個 state：isAuthenticated/authTimestamp/passwordList，3 個 getters：isLoginValid/validPasswords/remainingTime，5 個 actions：loadAuthConfig/validatePassword/login/logout/restoreAuthState）
- [X] T020 [P] [US0] 在 src/views/LoginView.vue 中建立 LoginView 頁面（頁面版配包含標題、說明槽位、密碼輸入框、錯誤顯示）
- [X] T021 [P] [US0] 在 src/components/auth/LoginForm.vue 中建立 LoginForm 元件（props: loading/error，emits: submit，slots: title/description）
- [X] T022 [US0] 在 src/router/index.ts 中實作驗證路由守衛（檢查 isLoginValid，若未驗證則重導向至 / 並帶查詢參數）
- [X] T023 [US0] 在 src/router/index.ts 中實作深連結還原守衛（登入後還原 redirect 參數）
- [X] T024 [US0] 在 LoginView 中增加登入/登出功能（呼叫 AuthStore actions、處理錯誤、成功時導航至 /itinerary）

### 使用者故事 0 測試

- [ ] T025 [P] [US0] 在 tests/unit/stores/auth.spec.ts 中為 AuthStore 撰寫單元測試（測試 loadAuthConfig、validatePassword、login/logout、isLoginValid 7 天過期）
- [ ] T026 [P] [US0] 在 tests/unit/utils/authHelper.spec.ts 中為 authHelper 撰寫單元測試（測試 saveAuthState、loadAuthState、clearAuthState、7 天 TTL 計算）
- [ ] T027 [US0] 在 tests/integration/auth-flow.spec.ts 中為登入流程撰寫整合測試（測試完整登入流程：載入配置 → 驗證 → 登入 → 檢查 LocalStorage → 登出）
- [ ] T028 [US0] 在 tests/e2e/login.spec.ts 中為登入場景撰寫 E2E 測試（spec.md 中的 6 個場景：未驗證、有效密碼、無效密碼、7 天內、7 天後、配置遺失）

**檢查點**：使用者故事 0 完成 - 驗證閘道運作正常、登入頁面可存取、密碼驗證正常、7 天持續性已驗證

---

## Phase 4: 使用者故事 1 — 檢視每日行程（優先座：P1）🎯 MVP 核心

**目標**：以卡片式 UI 顯示每日行程、Emoji 顯示、日期導航（左/右）、支援 RWD

**獨立測試**： 
- 有效的 Google Sheet 含行程資料 → 顯示卡片式行程，包含 Emoji 與關鍵資訊
- 多日旅遊 → 滑動/標籤導航正常，日期切換 <1s，內容一致
- 行動與桌面 → 清晰顯示，响應式版面配置

### 使用者故事 1 實作

- [X] T029 [P] [US1] 在 src/stores/itinerary.ts 中建立 ItineraryStore（6 個 state: days/currentDate/searchQuery/completedItems/loading/error，6 個 getters: currentDayItems/availableDates/filteredItems/tagStatistics/totalCost/completionPercentage，8 個 actions: loadItinerary/switchDate/previousDay/nextDay/setSearchQuery/toggleComplete/clearCompletionState/restoreCompletionState）
- [X] T030 [P] [US1] 在 src/views/ItineraryView.vue 中建立 ItineraryView 頁面（頁面版配包含日期導航、日行程卡片列表、loading/error 狀態）
- [X] T031 [P] [US1] 在 src/components/itinerary/ItineraryDayCard.vue 中建立 ItineraryDayCard 元件（props: day/isActive，emits: click，顯示日期標題及總費用與完成統計）
- [X] T032 [P] [US1] 在 src/components/itinerary/ItineraryItemCard.vue 中建立 ItineraryItemCard 元件（props: item，emits: toggle-complete/open-map，slots: actions，顯示 12 個欄位及 Emoji、分類特定欄位）
- [X] T033 [US1] 在 ItineraryView 中實作日期導航邏輯（previousDay/nextDay 按鈕、鍵盤箭頭、觸控滑動，使用 hammerjs 或原生 touch events）
- [X] T034 [US1] 在 ItineraryItemCard 中整合 Google Maps 連結（行動版在新分頁開啟，原生開啟 Google Maps app）
- [X] T035 [US1] 在 ItineraryItemCard 中新增完成狀態切換（勾選框及視覺回饋：勾選圖示 + 灰階）
- [X] T036 [US1] 在 ItineraryStore 初始化時還原完成狀態（從 LocalStorage 呼叫 restoreCompletionState）

### 使用者故事 1 測試

- [ ] T037 [P] [US1] 在 tests/unit/stores/itinerary.spec.ts 中為 ItineraryStore 撰寫單元測試（測試 loadItinerary、switchDate、previousDay/nextDay、filteredItems、totalCost、completionPercentage、toggleComplete）
- [ ] T038 [P] [US1] 在 tests/unit/utils/dateHelper.spec.ts 中為 dateHelper 撰寫單元測試（測試 formatDate、parseDate、daysBetween、getToday）
- [ ] T039 [P] [US1] 在 tests/unit/components/ItineraryItemCard.spec.ts 中為 ItineraryItemCard 撰寫元件測試（測試 props 渲染、emits toggle-complete/open-map、完成視覺狀態）
- [ ] T040 [US1] 在 tests/integration/itinerary-flow.spec.ts 中為行程流程撰寫整合測試（測試載入 Google Sheet → 顯示卡片 → 切換日期 → 切換完成 → 檢查 LocalStorage）
- [ ] T041 [US1] 在 tests/e2e/itinerary.spec.ts 中為行程場景撰寫 E2E 測試（測試多日導航、日期切換 <1s、完成狀態持續、空狀態顯示）

**檢查點**：使用者故事 1 完成 - 每日行程檢視功能正常、日期導航運作、完成狀態持續、RWD 已驗證

---

## Phase 5: 使用者故事 2 — 搜尋／過濾行程（優先座：P2）

**目標**：關鍵字搜尋帶 300ms debounce、分類過濾器（景點/餐廳/交通/住宿）、保留日期導航

**獨立測試**： 
- 資料已載入 → 關鍵字搜尋「台北101」→ 顯示符合的卡片並保留日期導航
- 分類過濾「餐廳」→ 僅顯示餐廳卡片
- 搜尋 + 過濾器結合 → 顯示同時符合兩項條件的卡片

### 使用者故事 2 實作

- [X] T042 [P] [US2] 在 src/components/itinerary/SearchBar.vue 中建立 SearchBar 元件（props: modelValue/placeholder/clearable，emits: update:modelValue/search，300ms debounce 使用 lodash 或原生 setTimeout）
- [X] T043 [P] [US2] 在 src/utils/searchHelper.ts 中實作 searchHelper 工具函數（3 個函數：searchItineraryItems、matchesSearchQuery、getTagStatistics）
- [X] T044 [US2] 在 ItineraryView 中新增 SearchBar（繫結至 ItineraryStore.searchQuery，輸入時呼叫 setSearchQuery）
- [X] T045 [US2] 在 ItineraryView 中新增分類過濾按鈕（4 個按鈕：景點/餐廳/交通/住宿，支援多選切換）
- [X] T046 [US2] 在 ItineraryStore 中實作 filteredItems getter（結合 searchQuery + 分類過濾器，應用於 currentDayItems）

### 使用者故事 2 測試

- [ ] T047 [P] [US2] 在 tests/unit/utils/searchHelper.spec.ts 中為 searchHelper 撰寫單元測試（測試 searchItineraryItems 關鍵字、matchesSearchQuery 標題/地點/標籤、getTagStatistics）
- [ ] T048 [P] [US2] 在 tests/unit/components/SearchBar.spec.ts 中為 SearchBar 撰寫元件測試（測試 v-model 繫定、Enter 觸發 search emit、300ms debounce、清除按鈕）
- [ ] T049 [US2] 在 tests/integration/search-filter-flow.spec.ts 中為搜尋/過濾流程撰寫整合測試（測試關鍵字搜尋 → 過濾結果 → 分類過濾 → 組合條件 → 保留日期導航）

**檢查點**：使用者故事 2 完成 - 搜尋與過濾功能正常、300ms debounce 運作、日期導航已保留

---

## Phase 6: 使用者故事 4 — 檢視旅遊資訊（優先座：P2）

**目標**：在獨立標籤頁中顯示旅遊資訊（打包清單、注意事項、緊急聯絡、預算）、分類過濾器、打包狀態持續性

**獨立測試**： 
- 點擊「旅遊資訊」標籤 → 顯示分類列表與資訊卡片
- 多個分類 → 選擇「攜帶物品」→ 僅顯示打包項目
- 打包清單項目勾選 → 視覺標記（勾選圖示 + 刪除線）+ 狀態持續化至 LocalStorage

### 使用者故事 4 實作

- [X] T050 [P] [US4] 在 src/stores/travelInfo.ts 中建立 TravelInfoStore（5 個 state: items/selectedCategory/packedItems/loading/error，5 個 getters: categories/filteredItems/itemsByCategory/packingList/packingProgress，5 個 actions: loadTravelInfo/filterByCategory/togglePacked/clearPackingState/restorePackingState）
- [X] T051 [P] [US4] 在 src/views/TravelInfoView.vue 中建立 TravelInfoView 頁面（頁面版配包含分類過濾器、資訊卡片列表、打包進度條）
- [X] T052 [P] [US4] 在 src/components/travelInfo/TravelInfoCard.vue 中建立 TravelInfoCard 元件（props: item/showPackingCheckbox，emits: toggle-packed，顯示分類特定欄位）
- [X] T053 [US4] 在 src/router/index.ts 中新增「旅遊資訊」路由（path: /travel-info，component: TravelInfoView）
- [X] T054 [US4] 在 App.vue 或主版面配置中新增標籤導航（2 個標籤：行程/旅遊資訊，高亮顯示活躍標籤）
- [X] T055 [US4] 在 TravelInfoView 中實作分類過濾器（按鈕：攜帶物品/注意事項/緊急聯絡/預算/其他，呼叫 filterByCategory）
- [X] T056 [US4] 在 TravelInfoCard 中新增打包勾選框（僅分類為「打包清單」時顯示，切換視覺狀態 + 呼叫 togglePacked）
- [X] T057 [US4] 在 TravelInfoStore 初始化時還原打包狀態（從 LocalStorage 呼叫 restorePackingState）

### 使用者故事 4 測試

- [ ] T058 [P] [US4] 在 tests/unit/stores/travelInfo.spec.ts 中為 TravelInfoStore 撰寫單元測試（測試 loadTravelInfo、filterByCategory、togglePacked、packingProgress、itemsByCategory）
- [ ] T059 [P] [US4] 在 tests/unit/components/TravelInfoCard.spec.ts 中為 TravelInfoCard 撰寫元件測試（測試 props 渲染、emit toggle-packed、打包勾選框條件顯示）
- [ ] T060 [US4] 在 tests/integration/travel-info-flow.spec.ts 中為旅遊資訊流程撰寫整合測試（測試載入 Google Sheet → 顯示分類 → 依分類過濾 → 切換打包 → 檢查 LocalStorage）

**檢查點**：使用者故事 4 完成 - 旅遊資訊檢視功能正常、分類過濾器運作、打包狀態持續性

---

## Phase 7: 使用者故事 3 — 分享與深連結（優先座：P3）

**目標**：支援深連結及 URL 參數（?date=YYYY-MM-DD&item=<slug>），自動導航至特定日期或項目

**獨立測試**： 
- 開啟帶有 ?date=2024-01-15 的 URL → 頁面自動切換至該日期
- 開啟帶有 ?item=taipei-101 的 URL → 頁面尋找項目所屬日期並切換 + 捲動至項目卡片
- 未驗證狀態下的深連結 → 先顯示登入頁面，登入後再導航

### 使用者故事 3 實作

- [X] T061 [P] [US3] 在 src/utils/deepLinkHelper.ts 中實作 deepLinkHelper 工具函數（3 個函數：getQueryParam、setQueryParams、generateDeepLink）
- [X] T062 [US3] 在 ItineraryView 中新增深連結處理（onMounted：檢查 URL 參數 → 若存在 date 參數則呼叫 switchDate → 若存在 item 參數則捲動至項目）
- [X] T063 [US3] 在驗證守衛中保留登入流程的深連結參數（儲存帶查詢參數的重導向 URL → 登入成功後還原）
- [X] T064 [US3] 在 ItineraryItemCard 中新增分享按鈕（複製深連結 URL 至剪貼簿，顯示提示訊息「連結已複製」）

### 使用者故事 3 測試

- [X] T065 [P] [US3] 在 tests/unit/utils/deepLinkHelper.spec.ts 中為 deepLinkHelper 撰寫單元測試（測試 getQueryParam、setQueryParams 不重整頁面、generateDeepLink URL 格式）
- [X] T066 [US3] 在 tests/integration/deep-link-flow.spec.ts 中為深連結流程撰寫整合測試（測試帶 date 參數的 URL → 自動切換日期，帶 item 參數的 URL → 尋找日期 + 捲動至項目）
- [X] T067 [US3] 在 tests/e2e/deep-link.spec.ts 中為深連結場景撰寫 E2E 測試（測試帶深連結參數的直接存取、未驗證狀態下的深連結 → 登入 → 導航）

**檢查點**：使用者故事 3 完成 - 深連結功能正常、URL 參數運作、分享按鈕已啟用

---

## Phase 8: 整體優化與橫切關注

**目的**：影響多個使用者故事的改進、PWA 設定、效能優化

- [ ] T068 [P] 在 src/stores/ui.ts 中建立 UIStore（4 個 state: loading/error/isOffline/toasts，2 個 getters: hasError/errorMessage，5 個 actions: showError/clearError/setOffline/showToast/removeToast）
- [ ] T069 [P] 在 src/components/common/Loading.vue 中建立 Loading 元件（轉圈 + 載入文字，使用 Tailwind 做動畫）
- [ ] T070 [P] 在 src/components/common/ErrorMessage.vue 中建立 ErrorMessage 元件（props: error/retry，顯示錯誤型別 + 訊息 + 重試按鈕）
- [ ] T071 [P] 在 src/components/common/PWAPrompt.vue 中建立 PWAPrompt 元件（為 iOS A2HS 顯示橫幅，偵測 PWA 可安裝性）
- [ ] T072 [P] 在 vite.config.ts 中設定 PWA 使用 vite-plugin-pwa（manifest.json: name/theme_color/icons，service worker 使用 Workbox：Google Sheets CSV 用 NetworkFirst，靜態資產用 CacheFirst）
- [ ] T073 [P] 在 App.vue 中新增離線偵測（監聽 online/offline 事件，呼叫 UIStore.setOffline，顯示離線橫幅）
- [ ] T074 [P] 在 App.vue 中新增全域錯誤處理（捕捉未處理的錯誤，呼叫 UIStore.showError 並提供重試函數）
- [ ] T075 [P] 在 ItineraryItemCard 中使用懶加載優化圖片（使用原生 loading="lazy"，加載時顯示佔位圖，錯誤時顯示備援圖片）
- [ ] T076 [P] 在 public/ 中新增 favicon 與 app 圖示（favicon.ico + manifest 圖示：192x192、512x512）
- [ ] T077 [P] 在 index.html 中新增 meta 標籤（Open Graph: title/description/image，mobile 用 viewport，theme-color）
- [ ] T078 在 tests/e2e/offline.spec.ts 中為離線模式撰寫 E2E 測試（測試 PWA 離線模式：快取資料 → 離線 → 瀏覽行程 → 日期導航 → 搜尋 → 顯示離線橫幅）
- [ ] T079 在 .github/workflows/lighthouse.yml 中設定 Lighthouse CI（在 PR 時執行，檢查 performance/accessibility/PWA 分數：Performance ≥90、Accessibility ≥90、PWA ≥90）
- [ ] T080 [P] 效能優化：長列表虛擬捲動（超過 100 項目時使用 vue-virtual-scroller 或原生 Intersection Observer）
- [ ] T081 [P] 文件：更新 README.md，包含功能說明、設置指南、部署指示
- [ ] T082 [P] 文件：建立 docs/ARCHITECTURE.md，包含 store/component/utility 結構圖
- [ ] T083 [P] 執行 quickstart.md 驗證（驗證所有設置步驟運作、測試範例 Google Sheet、執行開發伺服器、執行測試）

**檢查點**：所有優化任務完成 - PWA 已啟用、離線模式運作、效能已優化、文件已更新

---

## 依賴關係與執行順序

### 階段依賴

- **專案設置（Phase 1）**：無依賴 - 可立即開始
- **基礎架構（Phase 2）**：依賴專案設置（Phase 1）完成 - **阻擋所有使用者故事**
- **使用者故事 0（Phase 3）**：依賴基礎架構（Phase 2）完成 - **阻擋所有其他使用者故事**（驗證閘道）
- **使用者故事 1（Phase 4）**：依賴使用者故事 0（Phase 3）完成 - 驗證功能後可繼續
- **使用者故事 2（Phase 5）**：依賴使用者故事 0（Phase 3）完成 - 可與使用者故事 1 或 4 平行執行
- **使用者故事 4（Phase 6）**：依賴使用者故事 0（Phase 3）完成 - 可與使用者故事 1 或 2 平行執行
- **使用者故事 3（Phase 7）**：依賴使用者故事 1（Phase 4）完成 - 需要行程檢視的路由結構
- **整體優化（Phase 8）**：依賴所需使用者故事完成 - 可在使用者故事 0 + 1（MVP）後開始

### 使用者故事依賴

```
Phase 1 (專案設置)
    ↓
Phase 2 (基礎架構) ← 必須在使用者故事前完成
    ↓
Phase 3 (US0 登入) ← 必須在其他使用者故事前完成
    ↓
    ├─→ Phase 4 (US1 行程檢視) ← MVP 核心
    ├─→ Phase 5 (US2 搜尋/過濾) ← 可與 US1 或 US4 平行執行
    └─→ Phase 6 (US4 旅遊資訊) ← 可與 US1 或 US2 平行執行
         ↓
         Phase 7 (US3 深連結) ← 依賴 US1 路由
              ↓
              Phase 8 (整體優化) ← 影響所有使用者故事
```

### 各使用者故事內部

1. **測試必須優先撰寫**（撰寫測試 → 驗證失敗 → 實作 → 驗證通過）
2. **Stores 在元件之前**（資料層在 UI 之前）
3. **工具函數在 stores 之前**（輔助函數在狀態管理之前）
4. **核心實作在整合之前**（基礎功能在跨功能整合之前）
5. **故事完成後再移動至下一優先座**（獨立驗證）

### 平行執行機會

**Phase 1（專案設置）**：所有標記 [P] 的任務可平行執行（T003-T008）

**Phase 2（基礎架構）**：所有標記 [P] 的任務可在組內平行執行：
- 型別：T010、T011、T012 可一起執行
- 工具函數：T014、T015 可一起執行

**使用者故事 0（登入）**：
- 實作：T019、T020、T021 可平行執行（store、view、component 在不同檔案）
- 測試：T025、T026 可平行執行（不同測試檔案）

**使用者故事 1（行程檢視）**：
- 實作：T029、T030、T031、T032 可平行執行（store、view、2 個 components）
- 測試：T037、T038、T039 可平行執行（不同測試檔案）

**使用者故事 2（搜尋/過濾）**：
- 實作：T042、T043 可平行執行（component、utility）
- 測試：T047、T048 可平行執行（不同測試檔案）

**使用者故事 4（旅遊資訊）**：
- 實作：T050、T051、T052 可平行執行（store、view、component）
- 測試：T058、T059 可平行執行（不同測試檔案）

**使用者故事 3（深連結）**：
- 測試：T065 可獨立執行

**Phase 8（整體優化）**：大部分標記 [P] 的任務可平行執行（T068-T077、T080-T082）

**多個使用者故事平行**（若團隊人力充足）：
- **US0（登入）**完成後：US1、US2、US4 可由不同開發者平行開始
- **US1（行程檢視）**完成後：US3 可開始

---

## 平行執行範例：使用者故事 1

```bash
# 同時啟動使用者故事 1 的所有可平行實作任務：
Task T029: "在 src/stores/itinerary.ts 中建立 ItineraryStore"
Task T030: "在 src/views/ItineraryView.vue 中建立 ItineraryView 頁面"
Task T031: "在 src/components/itinerary/ItineraryDayCard.vue 中建立 ItineraryDayCard 元件"
Task T032: "在 src/components/itinerary/ItineraryItemCard.vue 中建立 ItineraryItemCard 元件"

# 然後啟動順序整合任務：
Task T033: "在 ItineraryView 中實作日期導航邏輯"
Task T034: "在 ItineraryItemCard 中整合 Google Maps 連結"
Task T035: "在 ItineraryItemCard 中新增完成狀態切換"
Task T036: "在 ItineraryStore 初始化時還原完成狀態"

# 同時啟動使用者故事 1 的所有可平行測試任務：
Task T037: "在 tests/unit/stores/itinerary.spec.ts 中為 ItineraryStore 撰寫單元測試"
Task T038: "在 tests/unit/utils/dateHelper.spec.ts 中為 dateHelper 撰寫單元測試"
Task T039: "在 tests/unit/components/ItineraryItemCard.spec.ts 中為 ItineraryItemCard 撰寫元件測試"

# 然後啟動順序整合/E2E 測試：
Task T040: "在 tests/integration/itinerary-flow.spec.ts 中為行程流程撰寫整合測試"
Task T041: "在 tests/e2e/itinerary.spec.ts 中為行程場景撰寫 E2E 測試"
```

---

## 實作策略

### MVP 優先（僅使用者故事 0 + 1）

1. 完成 **Phase 1：專案設置**（T001-T008）→ 專案結構就緒
2. 完成 **Phase 2：基礎架構**（T009-T018）→ **重要閘道** → 型別、工具函數、路由就緒
3. 完成 **Phase 3：使用者故事 0**（T019-T028）→ 驗證閘道運作中
4. 完成 **Phase 4：使用者故事 1**（T029-T041）→ 每日行程檢視運作中
5. **停止並驗證**：獨立測試 → 登入正常 + 行程顯示 + 日期導航 + 完成切換
6. **MVP 交付物**：部署至 staging/production → 收集回饋

**MVP 範圍**：
- ✅ 使用者故事 0（登入）：密碼保護及 7 天持續性
- ✅ 使用者故事 1（行程檢視）：卡片式每日檢視、日期導航、完成追蹤
- ❌ 使用者故事 2（搜尋/過濾）：MVP 可選
- ❌ 使用者故事 4（旅遊資訊）：MVP 可選
- ❌ 使用者故事 3（深連結）：MVP 可選

### 漸進交付（建議）

1. **基礎設施**（Phase 1 + 2）→ 設置 + 核心基礎設施 → ~8 個任務
2. **MVP**（Phase 3 + 4）→ 登入 + 行程檢視 → ~31 個任務 → **第一次部署** 🚀
3. **增強功能 1**（Phase 5）→ 搜尋/過濾 → ~8 個任務 → **第二次部署** 🚀
4. **增強功能 2**（Phase 6）→ 旅遊資訊 → ~11 個任務 → **第三次部署** 🚀
5. **增強功能 3**（Phase 7）→ 深連結 → ~7 個任務 → **第四次部署** 🚀
6. **整體優化**（Phase 8）→ PWA + 離線 + 效能 → ~16 個任務 → **最終部署** 🚀

每次部署增加價值且不破壞現有功能，允許早期用戶回饋與驗證。

### 平行團隊策略

多位開發者（建議團隊規模：2-3 人）：

1. **一起工作**：完成 Phase 1（專案設置）+ Phase 2（基礎架構）→ 基礎設施就緒
2. **一起工作**：完成 Phase 3（使用者故事 0 - 登入）→ 驗證閘道運作中
3. **平行分工**（US0 完成後）：
   - **開發者 A**：Phase 4（使用者故事 1 - 行程檢視）→ T029-T041
   - **開發者 B**：Phase 5（使用者故事 2 - 搜尋/過濾）→ T042-T049
   - **開發者 C**：Phase 6（使用者故事 4 - 旅遊資訊）→ T050-T060
4. **開發者 A**（US1 完成後）：Phase 7（使用者故事 3 - 深連結）→ T061-T067
5. **一起工作**：Phase 8（整體優化）→ PWA + 離線 + 效能

**時間線估計**（2-3 位開發者）：
- 第 1 週：專案設置 + 基礎架構 + 登入（Phase 1-3）
- 第 2 週：行程檢視 + 搜尋/過濾 + 旅遊資訊（Phase 4-6，平行）
- 第 3 週：深連結 + 整體優化（Phase 7-8）
- 第 4 週：測試 + 精修 + 部署

---

## 測試策略

### 測試驅動開發（TDD）流程

對於每個使用者故事：

1. **優先撰寫測試**（標記預期行為）
2. **驗證測試失敗**（尚未實作）
3. **實作最小程式碼**以通過測試
4. **驗證測試通過**（實作正確）
5. **如需重構**（保持測試通過）

### 測試覆蓋率目標（依據 Constitution）

- **單元測試**：≥80% 覆蓋率（stores、utilities、components）
- **整合測試**：覆蓋所有使用者旅程（驗證流程、行程流程、搜尋/過濾流程、旅遊資訊流程、深連結流程）
- **E2E 測試**：覆蓋所有關鍵場景（登入 6 個場景、行程多日導航、離線模式）

### 測試執行順序

1. **單元測試**（快速回饋，每次檔案儲存時執行）
2. **整合測試**（中等速度，commit 時執行）
3. **E2E 測試**（較慢，PR 及部署前執行）

---

## 註記

- **[P] 標記**：表示可平行執行的任務（不同檔案，無未完成任務的依賴）
- **[Story] 標籤**：將任務對應到使用者故事以便追蹤（US0、US1、US2、US3、US4）
- **檔案路徑**：所有任務均包含確切的檔案路徑以提高清晰度
- **清單格式**：`- [ ] [TID] [P?] [Story?] 描述與檔案路徑` 以便追蹤進度
- **測試優先方法**：根據 Constitution 要求，實作前先撰寫測試
- **獨立使用者故事**：每個故事（除 US0 驗證閘道外）均可獨立驗證
- **漸進交付**：每個使用者故事完成後部署，以獲得早期回饋
- **Constitution 符合性**：
  - ✅ **簡單性**：純前端，無後端複雜性
  - ✅ **用戶價值優先**：P0/P1 交付核心價值（登入 + 行程檢視）
  - ✅ **務實效能**：Phase 8 中的效能目標（Lighthouse CI）
  - ✅ **足夠好的安全性**：友善的隱私機制，適合家人朋友
  - ✅ **測試**：包含單元 + 整合 + E2E 覆蓋
  - ✅ **清晰與誠實**：所有設計決策已記錄於 research.md

---

## 總任務數

- **Phase 1（專案設置）**：8 個任務
- **Phase 2（基礎架構）**：10 個任務（阻擋型）
- **Phase 3（US0 - 登入）**：10 個任務（阻擋型）
- **Phase 4（US1 - 行程檢視）**：13 個任務（MVP 核心）
- **Phase 5（US2 - 搜尋/過濾）**：8 個任務
- **Phase 6（US4 - 旅遊資訊）**：11 個任務
- **Phase 7（US3 - 深連結）**：7 個任務
- **Phase 8（整體優化）**：16 個任務

**總計**：83 個任務

**平行執行機會**：35+ 個任務標記 [P]（佔總數的 42%）

**MVP 交付物**：31 個任務（Phase 1-4：專案設置 + 基礎架構 + 登入 + 行程檢視）

**估計時間線**（單一開發者）：4-6 週  
**Estimated Timeline** (2-3 developers, parallel execution): 3-4 weeks
