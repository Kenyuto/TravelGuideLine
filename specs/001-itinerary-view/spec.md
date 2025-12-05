# 功能規格：旅遊行程檢視網站（itinerary-view）

**功能分支**: `[001-itinerary-view]`  
**建立日期**: 2025-12-05  
**狀態**: 草案  
**輸入**: 使用者描述（摘要）：
「Google Sheet 匯入與快取、RWD、Emoji/卡片式 UX、免費部署（GitHub Pages/Cloudflare/Vercel），Loading、錯誤提示、PWA(選)、SEO(選)、Deep Link、權限安全。」

## 使用者情境與測試（必填）

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.
  
  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### 使用者故事 1 — 檢視每日行程（優先級：P1）

使用者於網站選擇某日期後，可清楚看到該日的行程卡片（景點、餐廳、交通、住宿、時間、備註），並可左右切換不同日期。

**為何此優先級**：為網站核心價值；即使只有每日行程顯示也能形成最小可用產品（MVP）。

**獨立測試**：
- 以公開的測試 Google Sheet 載入行程 → 成功渲染卡片 → 可切換到相鄰日期。
- 於手機與桌機檢視皆清晰可讀且版面不破版。

**驗收情境**：
1. **Given** 有效的 Google Sheet 來源，**When** 使用者選擇日期，**Then** 顯示該日卡片式行程，含 Emoji 與關鍵資訊。
2. **Given** 多天行程，**When** 使用者左右滑動或切換頁籤，**Then** 正確切換至相鄰日期且內容一致。

---

### 使用者故事 2 — 搜尋／過濾行程（優先級：P2）

使用者可輸入關鍵字或選擇分類（景點／餐廳／交通／住宿）以篩選清單，快速找到目標資訊。

**為何此優先級**：提升可發現性與效率，屬次要但常用的操作。

**獨立測試**：
- 載入資料後，輸入關鍵字「美食」→ 僅顯示符合餐廳或備註包含美食的卡片。

**驗收情境**：
1. **Given** 已載入行程資料，**When** 使用者輸入關鍵字或選擇分類，**Then** 僅顯示符合條件的卡片並保留日期切換功能。

---

### 使用者故事 3 — 分享與深連結（優先級：P3）

使用者可分享網址，朋友開啟後直接落在特定日期或特定行程卡片。

**為何此優先級**：提升社群擴散與溝通效率。

**獨立測試**：
- 直接開啟帶有 `?date=YYYY-MM-DD` 的網址 → 頁面定位至該日期。

**驗收情境**：
1. **Given** 有深連結參數，**When** 使用者開啟頁面，**Then** 自動切換並定位至對應日期／行程卡片。

---

[Add more user stories as needed, each with an assigned priority]

### 邊界情境

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- Google Sheet 欄位異動：新增欄位或重新命名時系統不應崩潰，應以容錯策略忽略未知欄位或採用映射表。
- 取用失敗：顯示友善錯誤訊息與重新嘗試按鈕。
- 大量資料：分頁或惰性載入以避免一次載入過多造成卡頓。
- 行動裝置極小螢幕：字體最小值與卡片排版需保持可讀性。

## 需求（必填）

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### 功能性需求

- **FR-001**：系統必須能從指定 Google Sheet 讀取行程資料並轉為前端可用結構。
- **FR-002**：系統必須具備快取／更新機制以反映最新資料（至少提供手動重新整理）。
- **FR-003**：使用者必須能依日期切換檢視每日行程卡片（含 Emoji 與一致排版）。
- **FR-004**：系統必須提供關鍵字搜尋與分類過濾（景點／餐廳／交通／住宿）。
- **FR-005**：系統必須支援 RWD，於手機／平板／桌機皆能清晰顯示（含橫直向）。
- **FR-006**：系統必須提供 Loading 狀態與取用失敗的錯誤提示。
- **FR-007**：系統必須支援以網址參數（Deep Link）直接開啟特定日期或行程。
- **FR-008**：系統應該可免費部署於常見平台（GitHub Pages／Cloudflare Pages／Vercel）。
- **FR-009**：系統應該提供基本 PWA 快取（至少 CSS/JS），以改善弱網體驗。
- **FR-010**：系統必須以只讀方式安全取用 Google Sheet（公開或 API Key），避免在前端暴露敏感金鑰。
- **FR-012**：系統必須支援圖片顯示：卡片可包含圖片縮圖／連結，並具備載入中占位、失敗替代圖、Lazy Load 與基本快取策略。

*不清楚但需標記：*
- **FR-011**：SEO 深度需求（結構化資料、Open Graph 細節）為 [NEEDS CLARIFICATION: 具體 SEO 規模與範圍未指定]。

### 關鍵實體（涉及資料時）

- **ItineraryDay**：代表每日行程；屬性：日期、卡片列表（景點／餐廳／交通／住宿）、備註。
- **ItineraryItem**：代表單一卡片；屬性：標題、分類、時間段、位置／連結、費用、備註、Emoji。
  - 圖片：`imageUrl`（可選）、`imageAlt`（可選）；若缺失則不顯示圖片區塊。

## 成功準則（必填）

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### 可衡量成果

- **SC-001**：首次載入主頁在常見桌機網路下可於 2 秒內完成可視內容渲染；行動裝置 3 秒內。
- **SC-002**：使用者可在 1 秒內完成日期切換並看到對應行程卡片。
- **SC-003**：90% 使用者能在首次使用時成功找到目標日期並瀏覽卡片內容。
- **SC-004**：行程資料更新後，使用者在 5 分鐘內可透過快取更新或重新整理看到最新內容。
- **SC-005**：錯誤場景下顯示明確訊息與重試入口；相關回報（支持訊息）低於初期每月 5 件。
- **SC-006**：含圖片的行程卡片在常見網路下可於 3 秒內顯示首張圖片縮圖；圖片載入失敗時顯示替代圖而不影響卡片其他資訊瀏覽。
