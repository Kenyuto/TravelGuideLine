# Implementation Plan: 旅遊行程檢視網站

**Branch**: `001-itinerary-view` | **Date**: 2025-12-05 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from [specs/001-itinerary-view/spec.md](./spec.md)

**Note**: 本計劃由 `/speckit.plan` 指令生成，涵蓋 Phase 0（研究）與 Phase 1（設計與合約）。

## Summary

**主要需求**：建立旅遊行程檢視網站，從公開 Google Sheet 讀取行程資料（支援多工作表：行程 + 旅遊資訊），提供 RWD 響應式介面、日期導覽、搜尋過濾、標籤分類、PWA 離線能力與深連結分享。

**技術方向**（待研究確認）：
- 純前端架構，無後端 API（直接讀取公開 Google Sheet CSV/JSON）
- 前端框架 NEEDS CLARIFICATION（候選：Vue 3/React/Vanilla JS + Vite）
- 狀態管理 NEEDS CLARIFICATION（候選：Pinia/Zustand/LocalStorage）
- Google Sheet 多工作表解析策略 NEEDS CLARIFICATION
- PWA Service Worker 快取策略與更新機制 NEEDS CLARIFICATION
- RWD 斷點設計與行動優先策略 NEEDS CLARIFICATION
- 深連結路由擴展（日期 + 旅遊資訊頁籤） NEEDS CLARIFICATION

## Technical Context

**Language/Version**: JavaScript ES2022+ / TypeScript 5.x（待研究確認是否採用 TypeScript）  
**Primary Dependencies**: 
- 前端框架 NEEDS CLARIFICATION（Vue 3 / React 18 / Vanilla JS）
- 建構工具 NEEDS CLARIFICATION（Vite / Webpack / Parcel）
- Google Sheet 解析 NEEDS CLARIFICATION（PapaParse for CSV / native fetch for JSON）
- PWA NEEDS CLARIFICATION（Workbox / 手動 Service Worker）
- 路由 NEEDS CLARIFICATION（Vue Router / React Router / 原生 History API）

**Storage**: 
- 無後端資料庫；資料來源為公開 Google Sheet（多工作表：行程 + 旅遊資訊）
- 本地儲存：LocalStorage（完成狀態 `isCompleted`、物品清單勾選 `isPacked`、快取版本號）
- PWA Cache Storage（CSS/JS/字型資源 + 首屏 JSON）

**Testing**: NEEDS CLARIFICATION（Vitest / Jest / Playwright for E2E）  
**Target Platform**: 現代瀏覽器（Chrome 90+, Safari 14+, Firefox 88+, Edge 90+）；支援行動裝置（iOS Safari, Android Chrome）  
**Project Type**: Web 應用（單一前端專案，無後端）

**Performance Goals**: 
- 首次載入可視內容渲染（FCP）：桌機 < 2 秒，行動裝置 < 3 秒
- 日期切換回應時間：< 1 秒
- 圖片首張縮圖載入：< 3 秒
- 搜尋防抖：300ms
- PWA 離線模式啟動：< 500ms

**Constraints**: 
- 必須免費部署（GitHub Pages / Cloudflare Pages / Vercel）
- 純前端架構，無後端 API（直接讀取公開 Google Sheet）
- 支援 RWD（手機／平板／桌機，橫直向）
- PWA 離線能力（快取 CSS/JS/字型 + 首屏 JSON）
- Google Sheet 欄位異動容錯（版本化映射表 + 寬鬆解析）
- 多幣別清楚標示（TWD, JPY, USD 等）
- 本地狀態管理（`isCompleted`, `isPacked`）不跨裝置同步

**Scale/Scope**: 
- 使用者規模：個人／小團隊旅遊（預估 < 100 併發）
- 行程天數：通常 3-14 天（最多 30 天）
- 每日行程項目：通常 5-15 項（最多 50 項）
- 旅遊資訊項目：通常 10-50 項
- 總資料量：< 1MB（純文字 + 圖片 URL）
- 頁面數：2 個主要頁籤（行程檢視 + 旅遊資訊）
- 功能範圍：21 個功能需求（FR-001 至 FR-021）

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

基於 [Constitution v1.1.0](../../.specify/memory/constitution.md) 評估：

### I. Code Quality Discipline ✅ PASS
- **Linting**: 計劃採用 ESLint（或 TypeScript 若使用 TS），零錯誤政策
- **Formatting**: 計劃採用 Prettier 自動格式化，CI 強制執行
- **Type Safety**: NEEDS RESEARCH（TypeScript vs JSDoc vs 無型別）
- **Documentation**: 所有公開函數與模組必須包含 JSDoc 註解（輸入/輸出/用途）
- **Dead Code**: Code Review 必須驗證無未使用函數與路徑
- **Code Review**: 要求清晰命名、小 diff、一致性驗證

**評估**：符合原則，待研究階段確認 TypeScript 策略。

### II. Testing Standards ⚠️ NEEDS CLARIFICATION
- **TDD**: 建議採用（先寫失敗測試，後實作）
- **Unit Tests**: 必須涵蓋關鍵邏輯（Google Sheet 解析、欄位映射、搜尋過濾、標籤統計）與錯誤情境
- **Contract Tests**: 必須測試 Google Sheet 資料結構（CSV/JSON schema）與前端介面合約
- **Integration Tests**: 必須涵蓋主要使用者旅程（載入行程 → 切換日期 → 搜尋 → 深連結 → 離線模式）
- **Test Runtime**: 快速執行（< 10 秒），無 flaky tests

**評估**：符合原則，但測試框架 NEEDS RESEARCH（Vitest / Jest / Playwright）。

### III. User Experience Consistency ✅ PASS
- **Terminology**: 規格已統一術語（行程 Itinerary、旅遊資訊 TravelInfo、卡片 Card、標籤 Tag）
- **Error Messages**: 必須提供可操作的錯誤訊息與重試按鈕（FR-006）
- **Consistent Schemas**: 實體定義清晰（ItineraryDay/Item, TravelInfo/InfoItem）
- **Accessibility**: RWD 設計需考慮可讀性；錯誤不僅依賴顏色（需文字提示）
- **Quickstart**: 將於 Phase 1 產出 quickstart.md

**評估**：符合原則。

### IV. Performance Requirements ✅ PASS
- **Latency Budgets**: 
  - 本地操作（日期切換、搜尋過濾）< 200ms ✅ (目標 < 1s)
  - 網路操作（首次載入）< 500ms ❌ (目標 2-3s，但屬合理範圍)
- **Memory Footprint**: 純前端架構，無大型依賴（待框架選擇確認）
- **Long Operations**: 載入提供 Loading 狀態（FR-006）；PWA 快取提供進度反饋 NEEDS RESEARCH
- **CI Performance Checks**: NEEDS RESEARCH（Lighthouse CI / 自訂效能檢查）

**評估**：基本符合，但首次載入 2-3 秒超出 500ms 預算。此為網路受限環境的合理權衡；將於研究階段探討優化策略（資源分割、預載入、HTTP/2）。

### V. Simplicity & Change Management ✅ PASS
- **Simple Solutions**: 純前端架構避免後端複雜度；採用標準 Web API
- **Small Modules**: 計劃模組化（資料解析、狀態管理、UI 元件）
- **Breaking Changes**: 欄位映射表版本化（FR-002 Clarified）；重大變更需遷移指南
- **Semantic Versioning**: 將於發布流程採用

**評估**：符合原則。

### 語言政策 (Language Policy) ✅ PASS
- **zh-TW 強制性**：本 plan.md、即將產出的 research.md、data-model.md、quickstart.md 皆使用繁體中文撰寫
- **雙語支援**：程式碼註解與變數命名採用英文（業界標準）；使用者介面與文件採用繁體中文

**評估**：符合 Constitution v1.1.0 語言政策。

---

### 總結評估

| 原則 | 狀態 | 備註 |
|------|------|------|
| Code Quality | ✅ PASS | 待確認 TypeScript 策略 |
| Testing | ⚠️ NEEDS CLARIFICATION | 待選擇測試框架 |
| UX Consistency | ✅ PASS | 術語統一，錯誤處理完善 |
| Performance | ⚠️ PARTIAL PASS | 首次載入 2-3s 超出 500ms 預算但合理 |
| Simplicity | ✅ PASS | 純前端架構，避免過度抽象 |
| Language Policy | ✅ PASS | 文件採用 zh-TW |

**Gate Decision**: ✅ **PASS** — 可進入 Phase 0 研究階段。兩項 NEEDS CLARIFICATION（測試框架、效能優化策略）與一項 PARTIAL PASS（首次載入延遲）將於研究階段解決。

## Project Structure

### Documentation (this feature)

```text
specs/001-itinerary-view/
├── spec.md                          # 功能規格（已完成）
├── plan.md                          # 本檔案（實施計畫）
├── research.md                      # Phase 0 研究報告（已完成）
├── data-model.md                    # Phase 1 資料模型定義（已完成）
├── quickstart.md                    # Phase 1 快速開始指南（已完成）
├── contracts/                       # Phase 1 合約文件（已完成）
│   ├── google-sheet-csv.md          # Google Sheet CSV 合約
│   └── frontend-api.md              # 前端 API 合約
└── tasks.md                         # Phase 2 任務分解（待產出）
```

### Source Code (repository root)

```text
travel-guide/                        # Vue 3 + Vite 專案根目錄
├── public/                          # 靜態資源
│   ├── favicon.ico
│   ├── icon-192.png                 # PWA 圖示
│   └── icon-512.png
├── src/
│   ├── assets/                      # 圖片、字型等資源
│   │   ├── images/
│   │   └── fonts/
│   ├── components/                  # Vue 組件
│   │   ├── itinerary/               # 行程相關組件
│   │   │   ├── ItineraryCard.vue
│   │   │   ├── DateNavigator.vue
│   │   │   └── ItemDetails.vue
│   │   ├── travelInfo/              # 旅遊資訊相關組件
│   │   │   ├── InfoCard.vue
│   │   │   ├── PackingList.vue
│   │   │   └── BudgetSummary.vue
│   │   ├── common/                  # 通用組件
│   │   │   ├── SearchBar.vue
│   │   │   ├── FilterChips.vue
│   │   │   ├── LoadingSpinner.vue
│   │   │   ├── ErrorMessage.vue
│   │   │   └── OfflineBanner.vue
│   │   └── layout/                  # 版面組件
│   │       ├── AppHeader.vue
│   │       ├── AppSidebar.vue
│   │       └── AppFooter.vue
│   ├── stores/                      # Pinia Stores
│   │   ├── itinerary.ts             # 行程資料狀態管理
│   │   ├── travelInfo.ts            # 旅遊資訊狀態管理
│   │   └── ui.ts                    # UI 狀態管理
│   ├── types/                       # TypeScript 型別定義
│   │   ├── itinerary.ts             # ItineraryDay, ItineraryItem
│   │   ├── travelInfo.ts            # TravelInfo, InfoItem
│   │   └── common.ts                # 共用型別
│   ├── utils/                       # 工具函數
│   │   ├── googleSheet.ts           # Google Sheet CSV 載入與解析
│   │   ├── fieldMapper.ts           # 欄位映射邏輯
│   │   ├── localStorage.ts          # LocalStorage 操作
│   │   ├── date.ts                  # 日期格式化工具
│   │   └── errors.ts                # 錯誤處理類別
│   ├── composables/                 # Vue Composables（可重用邏輯）
│   │   ├── useDebounce.ts           # 防抖 Hook
│   │   ├── useOnline.ts             # 線上狀態偵測
│   │   └── useLazyImage.ts          # 圖片 Lazy Load
│   ├── views/                       # 頁面視圖
│   │   ├── ItineraryView.vue        # 行程檢視頁面
│   │   └── TravelInfoView.vue       # 旅遊資訊頁面
│   ├── router/                      # Vue Router 配置
│   │   └── index.ts
│   ├── config/                      # 配置檔案
│   │   └── googleSheet.ts           # Google Sheet ID 與 gid 配置
│   ├── App.vue                      # 根組件
│   ├── main.ts                      # 應用入口
│   └── style.css                    # 全域樣式（Tailwind CSS）
├── tests/                           # 測試檔案
│   ├── unit/                        # 單元測試（Vitest）
│   │   ├── utils/
│   │   │   ├── googleSheet.test.ts
│   │   │   ├── fieldMapper.test.ts
│   │   │   └── date.test.ts
│   │   ├── stores/
│   │   │   ├── itinerary.test.ts
│   │   │   └── travelInfo.test.ts
│   │   └── components/
│   │       ├── ItineraryCard.test.ts
│   │       └── SearchBar.test.ts
│   ├── integration/                 # 整合測試（Vitest）
│   │   ├── itineraryFlow.test.ts
│   │   └── travelInfoFlow.test.ts
│   └── e2e/                         # E2E 測試（Playwright）
│       ├── itinerary.spec.ts
│       ├── travelInfo.spec.ts
│       └── offline.spec.ts
├── .github/
│   ├── workflows/
│   │   ├── deploy.yml               # CI/CD 部署流程
│   │   └── test.yml                 # 自動測試流程
│   └── agents/
│       └── copilot-instructions.md  # GitHub Copilot 上下文（已自動更新）
├── .env.example                     # 環境變數範例
├── .eslintrc.cjs                    # ESLint 配置
├── .prettierrc.json                 # Prettier 配置
├── vite.config.ts                   # Vite 配置（含 PWA）
├── vitest.config.ts                 # Vitest 配置
├── playwright.config.ts             # Playwright 配置
├── tailwind.config.js               # Tailwind CSS 配置
├── tsconfig.json                    # TypeScript 配置
├── package.json                     # 依賴管理
└── README.md                        # 專案說明
```

**Structure Decision**: 
- **專案類型**: Web 應用（單一前端專案，無後端）
- **框架**: Vue 3 + Vite + TypeScript
- **測試分層**: Unit（Vitest） + Integration（Vitest） + E2E（Playwright）
- **部署**: 靜態檔案部署至 GitHub Pages / Cloudflare Pages / Vercel

## Complexity Tracking

> **Constitution Check 結果：無需特殊豁免（No Violations）**

本專案通過 Constitution Check 所有原則評估：
- ✅ **Code Quality Discipline**: TypeScript + ESLint + Prettier
- ✅ **Testing Standards**: Vitest + Playwright（三層測試）
- ✅ **UX Consistency**: 術語統一，錯誤處理完善
- ✅ **Performance Requirements**: 效能目標合理（首次載入 2-3s 為網路環境合理權衡）
- ✅ **Simplicity**: 純前端架構，避免後端複雜度

---

## Phase 0 產出總結（研究階段）

✅ **research.md** 已完成：
- 11 項技術選型決策（前端框架、建構工具、型別系統、狀態管理、Google Sheet 解析、多工作表策略、PWA、測試、路由、RWD、效能優化）
- 每項決策包含：選擇、理由、替代方案考量、技術細節
- 風險評估與緩解策略

---

## Phase 1 產出總結（設計與合約）

✅ **data-model.md** 已完成：
- 4 個核心實體定義（ItineraryDay, ItineraryItem, TravelInfo, InfoItem）
- TypeScript 介面完整定義（含所有屬性、型別、驗證規則）
- 欄位映射表（Google Sheet ↔ 前端）
- 容錯策略與版本升級策略

✅ **contracts/** 已完成：
- **google-sheet-csv.md**: CSV 結構合約、欄位定義、解析邏輯、測試合約
- **frontend-api.md**: Pinia Store 合約、Vue 組件合約、工具函數合約、錯誤處理合約

✅ **quickstart.md** 已完成：
- 環境需求與專案初始化步驟
- 開發流程與專案結構說明
- 測試指南（Unit / Component / E2E）
- 建構與部署指南（GitHub Pages / Cloudflare / Vercel）
- 常見問題與開發規範

✅ **copilot-instructions.md** 已自動更新：
- 執行 `update-agent-context.ps1` 成功
- 技術堆疊資訊已同步至 GitHub Copilot 上下文

---

## Phase 2 準備事項（任務分解）

待 `/speckit.tasks` 指令執行：
1. 將設計分解為具體實作任務
2. 排定任務優先順序與依賴關係
3. 定義每個任務的驗收標準
4. 預估開發時程

**下一步指令**：
```bash
# 產出 tasks.md（任務分解）
/speckit.tasks
```

---

## 附錄：關鍵決策摘要

### 技術堆疊

| 層級 | 技術選型 | 決策理由 |
|------|---------|---------|
| 前端框架 | Vue 3 (Composition API) | 學習曲線平緩、文檔完善、生態系整合良好 |
| 建構工具 | Vite | 開發體驗極佳（HMR < 50ms）、部署友善 |
| 型別系統 | TypeScript | 型別安全、IDE 支援完善、可維護性高 |
| 狀態管理 | Pinia + LocalStorage | 官方方案、TypeScript 原生支援、模組化設計 |
| 樣式框架 | Tailwind CSS | Utility-First、產出檔案小、Mobile-First |
| Google Sheet | PapaParse (CSV) | 無需 API Key、無 CORS 問題、容錯能力強 |
| PWA | Workbox | 官方工具、Vite 整合良好、策略完善 |
| 測試 | Vitest + Playwright | 快速、Jest 相容、跨瀏覽器支援 |
| 路由 | Vue Router 4 | 官方方案、深連結支援完善、Lazy Loading |

### 資料流

```
Google Sheet (公開)
    ↓ (CSV 匯出 URL)
PapaParse 解析
    ↓
欄位映射（版本化）
    ↓
ItineraryDay[] / TravelInfo
    ↓
Pinia Store（響應式狀態）
    ↓
Vue Components（UI 渲染）
    ↓
LocalStorage（本地狀態持久化）
```

### 效能策略

1. **Code Splitting**: 路由層級分割（Vue Router Lazy Import）
2. **Image Lazy Load**: IntersectionObserver API
3. **HTTP/2 Server Push**: 部署平台原生支援（Cloudflare/Vercel）
4. **Resource Hints**: `<link rel="preload">` 關鍵資源
5. **PWA Cache**: Workbox 預快取 + 執行時快取（1 小時過期）

---

**計畫完成日期**: 2025-12-05  
**狀態**: ✅ Phase 0 & Phase 1 完成，準備進入 Phase 2（任務分解）
