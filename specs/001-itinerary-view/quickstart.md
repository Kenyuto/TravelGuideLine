# Quickstart Guide

> **Phase 1 Output**: 本文件提供完整的開發環境設定與工作流程指南。

## Feature Context

- **Feature**: 旅遊行程檢視網站（含登入驗證）
- **Branch**: 001-itinerary-view
- **Specification**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)

---

## Prerequisites

### Required Software

| 軟體 | 版本 | 用途 | 安裝連結 |
|------|------|------|---------|
| Node.js | 20.x LTS | JavaScript runtime | [nodejs.org](https://nodejs.org/) |
| npm | 10.x | 套件管理器（隨 Node.js 安裝） | - |
| Git | 最新版 | 版本控制 | [git-scm.com](https://git-scm.com/) |
| VS Code | 最新版 | 程式碼編輯器（建議） | [code.visualstudio.com](https://code.visualstudio.com/) |

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "vue.volar",              // Vue 3 語言支援
    "dbaeumer.vscode-eslint", // ESLint 整合
    "esbenp.prettier-vscode", // Prettier 格式化
    "bradlc.vscode-tailwindcss", // Tailwind CSS IntelliSense
    "lokalise.i18n-ally"      // i18n 支援（未來多語系）
  ]
}
```

### System Requirements

- **OS**: Windows 10+, macOS 11+, Linux (Ubuntu 20.04+)
- **RAM**: 最低 4 GB，建議 8 GB
- **Storage**: 1 GB 可用空間（含 node_modules）

---

## Installation

### 1. Clone Repository

```bash
# HTTPS
git clone https://github.com/YOUR_USERNAME/TravelGuideLine.git
cd TravelGuideLine

# SSH (若已設定 SSH key)
git clone git@github.com:YOUR_USERNAME/TravelGuideLine.git
cd TravelGuideLine
```

### 2. Checkout Feature Branch

```bash
git checkout 001-itinerary-view
```

### 3. Install Dependencies

```bash
npm install
```

**預期安裝時間**: 2-5 分鐘（視網路速度）

**安裝的主要套件**:
- Vue 3.4+
- Vite 5.x
- TypeScript 5.x
- Pinia 2.x
- Vue Router 4.x
- Tailwind CSS 3.x
- PapaParse 5.x
- vite-plugin-pwa
- Vitest 1.x (devDependencies)
- Playwright 1.40+ (devDependencies)

---

## Configuration

### 1. Environment Variables

建立 `.env` 檔案於專案根目錄：

```bash
# .env
VITE_GOOGLE_SHEET_ID=YOUR_GOOGLE_SHEET_ID
VITE_AUTH_CONFIG_GID=2
VITE_ITINERARY_GID=0
VITE_TRAVEL_INFO_GID=1
```

**如何取得 GOOGLE_SHEET_ID**:
1. 開啟 Google Sheet
2. 複製 URL 中的 ID：  
   `https://docs.google.com/spreadsheets/d/**YOUR_SHEET_ID**/edit`

**如何取得 GID** (工作表 ID):
1. 點擊工作表 tab
2. 複製 URL 中的 `gid` 參數：  
   `https://docs.google.com/.../edit#gid=**0**`

---

### 2. Google Sheet Setup

#### Step 1: 建立 Google Sheet

1. 前往 [Google Sheets](https://sheets.google.com)
2. 建立新試算表，命名為「旅遊行程」

#### Step 2: 建立工作表

建立 3 個工作表（tab）：

**Tab 1: 行程** (GID = 0)

| 日期 | 標題 | 類別 | 時間 | 地點 | Google Maps | 花費 | 幣別 | 說明 | 連結 | 標籤 | 備註 |
|------|------|------|------|------|-------------|------|------|------|------|------|------|
| 2024-01-15 | 台北101 | 景點 | 14:00 | 台北101 | https://maps.google.com/?q=台北101 | 600 | TWD | 觀景台 | https://taipei-101.com.tw | 親子,室內 | 提前購票 |

**Tab 2: 旅遊資訊** (GID = 1)

| 標題 | 類別 | 內容 | 地址 | 數量 | 聯絡人姓名 | 電話 | 連結 | 備註 |
|------|------|------|------|------|-----------|------|------|------|
| 東京希爾頓 | 住宿 | 新宿區 | 東京都新宿區... | - | - | - | https://hilton.com | 已付款 |
| 護照 | 打包清單 | - | - | 1 | - | - | - | 隨身攜帶 |

**Tab 3: 登入設定** (GID = 2)

| 密碼 | 說明文字 | 有效期限 |
|------|---------|---------|
| TestPass2024 | 測試用密碼 | 2025-12-31 |

#### Step 3: 設定共享權限

1. 點擊右上角「共用」按鈕
2. 選擇「知道連結的任何人」→「檢視者」
3. 複製連結中的 SHEET_ID 至 `.env`

---

### 3. TypeScript Configuration

確認 `tsconfig.json` 已設定嚴格模式：

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

---

### 4. Tailwind CSS Configuration

確認 `tailwind.config.js` 已設定：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',   // 藍色
        secondary: '#10B981', // 綠色
        danger: '#EF4444',    // 紅色
      },
    },
  },
  plugins: [],
}
```

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

**預期輸出**:
```
VITE v5.x.x  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

開啟瀏覽器前往 `http://localhost:5173/`

---

### 2. Project Structure Tour

```
TravelGuideLine/
├── src/
│   ├── components/              # 元件
│   │   ├── auth/               # 登入相關
│   │   │   ├── LoginForm.vue
│   │   │   └── PasswordItem.vue
│   │   ├── itinerary/          # 行程相關
│   │   │   ├── DayCard.vue
│   │   │   ├── ItemCard.vue
│   │   │   └── SearchBar.vue
│   │   ├── travelInfo/         # 旅遊資訊
│   │   │   ├── InfoCard.vue
│   │   │   └── CategoryFilter.vue
│   │   └── common/             # 共用元件
│   │       ├── Loading.vue
│   │       ├── ErrorMessage.vue
│   │       └── PWAPrompt.vue
│   ├── views/                  # 頁面
│   │   ├── LoginView.vue       # 登入頁
│   │   ├── ItineraryView.vue   # 行程檢視
│   │   └── TravelInfoView.vue  # 旅遊資訊
│   ├── stores/                 # Pinia stores
│   │   ├── auth.ts             # AuthStore
│   │   ├── itinerary.ts        # ItineraryStore
│   │   ├── travelInfo.ts       # TravelInfoStore
│   │   └── ui.ts               # UIStore
│   ├── utils/                  # 工具函數
│   │   ├── googleSheetParser.ts
│   │   ├── authHelper.ts
│   │   ├── dateHelper.ts
│   │   ├── searchHelper.ts
│   │   └── deepLinkHelper.ts
│   ├── types/                  # TypeScript 型別
│   │   ├── auth.ts
│   │   ├── itinerary.ts
│   │   ├── travelInfo.ts
│   │   └── common.ts
│   ├── router/                 # Vue Router
│   │   └── index.ts
│   ├── App.vue                 # 根元件
│   └── main.ts                 # 進入點
├── tests/                      # 測試
│   ├── unit/                   # 單元測試
│   ├── integration/            # 整合測試
│   └── e2e/                    # E2E 測試
├── public/                     # 靜態資源
├── specs/                      # 功能規格
│   └── 001-itinerary-view/
│       ├── spec.md
│       ├── plan.md
│       ├── research.md
│       ├── data-model.md
│       ├── contracts/
│       └── quickstart.md (本檔案)
├── .env                        # 環境變數（不納入版控）
├── vite.config.ts              # Vite 設定
├── tsconfig.json               # TypeScript 設定
├── tailwind.config.js          # Tailwind 設定
├── package.json                # 套件與腳本
└── README.md                   # 專案說明
```

---

### 3. Development Commands

#### Hot Module Replacement (HMR)

開發伺服器支援 HMR，修改程式碼後自動更新瀏覽器，無需重新整理。

#### Linting

```bash
# 檢查程式碼風格
npm run lint

# 自動修復可修復的問題
npm run lint:fix
```

#### Type Checking

```bash
# TypeScript 型別檢查
npm run type-check
```

#### Formatting

```bash
# Prettier 格式化
npm run format
```

---

## Testing

### 1. Unit Tests (Vitest)

```bash
# 執行所有單元測試
npm run test:unit

# Watch mode（檔案變更時自動重新測試）
npm run test:unit:watch

# 產生 coverage report
npm run test:unit:coverage
```

**測試範例**:
```typescript
// tests/unit/utils/authHelper.spec.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { saveAuthState, loadAuthState, isLoginValid } from '@/utils/authHelper';

describe('authHelper', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('saveAuthState 應儲存登入狀態到 LocalStorage', () => {
    saveAuthState(true);
    const state = loadAuthState();
    
    expect(state).not.toBeNull();
    expect(state?.isAuthenticated).toBe(true);
  });

  test('isLoginValid 應在 7 天內回傳 true', () => {
    saveAuthState(true);
    expect(isLoginValid()).toBe(true);
  });
});
```

---

### 2. Integration Tests

```bash
# 執行整合測試
npm run test:integration
```

**測試範例**:
```typescript
// tests/integration/auth-flow.spec.ts
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import LoginForm from '@/components/auth/LoginForm.vue';
import { useAuthStore } from '@/stores/auth';

describe('登入流程整合測試', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  test('完整登入流程', async () => {
    const authStore = useAuthStore();
    await authStore.loadAuthConfig(SHEET_ID, 2);
    
    const wrapper = mount(LoginForm);
    await wrapper.find('input').setValue('TestPass2024');
    await wrapper.find('form').trigger('submit');
    
    expect(authStore.isAuthenticated).toBe(true);
  });
});
```

---

### 3. E2E Tests (Playwright)

```bash
# 安裝 Playwright browsers（首次執行）
npx playwright install

# 執行 E2E 測試（headless mode）
npm run test:e2e

# 執行 E2E 測試（UI mode，可互動除錯）
npm run test:e2e:ui

# 產生測試報告
npm run test:e2e:report
```

**測試範例**:
```typescript
// tests/e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test('使用者應能成功登入', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // 輸入密碼
  await page.fill('input[type="password"]', 'TestPass2024');
  await page.click('button[type="submit"]');
  
  // 驗證導向行程頁面
  await expect(page).toHaveURL(/.*itinerary/);
  await expect(page.locator('h1')).toContainText('行程');
});

test('錯誤密碼應顯示錯誤訊息', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  await page.fill('input[type="password"]', 'WrongPassword');
  await page.click('button[type="submit"]');
  
  await expect(page.locator('.error-message')).toContainText('密碼錯誤');
});
```

---

## Build & Deployment

### 1. Production Build

```bash
# 建置生產版本
npm run build
```

**輸出目錄**: `dist/`

**預期輸出**:
```
vite v5.x.x building for production...
✓ 120 modules transformed.
dist/index.html                   2.50 kB
dist/assets/index-abc123.css     15.20 kB │ gzip: 3.50 kB
dist/assets/index-def456.js     180.30 kB │ gzip: 65.00 kB
✓ built in 3.50s
```

---

### 2. Preview Production Build

```bash
# 預覽生產版本
npm run preview
```

開啟瀏覽器前往 `http://localhost:4173/`

---

### 3. Deployment Options

#### Option A: GitHub Pages

1. **修改 `vite.config.ts`**:
   ```typescript
   export default defineConfig({
     base: '/TravelGuideLine/', // repository 名稱
   });
   ```

2. **建置**:
   ```bash
   npm run build
   ```

3. **部署**:
   ```bash
   # 使用 gh-pages 套件
   npm install -D gh-pages
   npx gh-pages -d dist
   ```

4. **設定 GitHub Pages**:
   - Repository → Settings → Pages
   - Source: `gh-pages` branch
   - URL: `https://YOUR_USERNAME.github.io/TravelGuideLine/`

---

#### Option B: Vercel

1. **安裝 Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **部署**:
   ```bash
   vercel --prod
   ```

3. **環境變數設定**:
   - Vercel Dashboard → Settings → Environment Variables
   - 新增 `VITE_GOOGLE_SHEET_ID` 等變數

---

#### Option C: Netlify

1. **建立 `netlify.toml`**:
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"

   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

2. **部署**:
   - 前往 [Netlify](https://www.netlify.com/)
   - 連結 GitHub repository
   - 自動偵測設定並部署

---

## Troubleshooting

### Issue 1: Google Sheet CORS Error

**Symptom**:
```
Access to fetch at 'https://docs.google.com/...' has been blocked by CORS policy
```

**Solution**:
1. 確認 Google Sheet 權限設為「知道連結的任何人可檢視」
2. 確認使用 `/export?format=csv` 而非 `/edit` URL
3. 清除瀏覽器快取並重新載入

---

### Issue 2: TypeScript Errors in IDE

**Symptom**:
```
Cannot find module '@/components/...' or its corresponding type declarations
```

**Solution**:
1. 重新啟動 VS Code
2. 確認已安裝 Volar extension（不要安裝 Vetur）
3. 執行 `npm run type-check` 確認無型別錯誤

---

### Issue 3: PWA Not Working Locally

**Symptom**:
Service Worker 無法註冊，離線功能失效

**Solution**:
1. PWA 僅在 **生產建置** 與 **HTTPS** 環境生效
2. 使用 `npm run build` → `npm run preview` 測試
3. 開發環境無需測試 PWA（HMR 衝突）

---

### Issue 4: Slow Build Time

**Symptom**:
`npm run build` 超過 10 秒

**Solution**:
1. 檢查 `node_modules` 是否完整（刪除並重新 `npm install`）
2. 清除 Vite cache：`rm -rf node_modules/.vite`
3. 確認無大型圖片檔案未優化

---

### Issue 5: LocalStorage Not Persisting

**Symptom**:
登入狀態或完成狀態消失

**Solution**:
1. 確認瀏覽器未開啟「無痕模式」
2. 檢查瀏覽器 LocalStorage 配額（通常 5-10 MB）
3. 開啟 DevTools → Application → Local Storage 檢查資料

---

## Performance Optimization

### 1. Lighthouse CI

```bash
# 安裝 Lighthouse CI
npm install -D @lhci/cli

# 執行 Lighthouse 測試
npm run build
npx lhci autorun --config=lighthouserc.json
```

**lighthouserc.json**:
```json
{
  "ci": {
    "collect": {
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:4173/"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", {"minScore": 0.9}],
        "categories:accessibility": ["error", {"minScore": 0.9}]
      }
    }
  }
}
```

---

### 2. Bundle Analysis

```bash
# 安裝 rollup-plugin-visualizer
npm install -D rollup-plugin-visualizer

# 建置並產生分析報告
npm run build
# 開啟 dist/stats.html
```

---

## Git Workflow

### 1. Feature Development

```bash
# 確保在正確分支
git checkout 001-itinerary-view

# 開發功能...

# 檢查變更
git status

# Stage 變更
git add src/components/auth/LoginForm.vue

# Commit（遵循 Conventional Commits）
git commit -m "feat(auth): 新增登入表單元件"

# Push 到 remote
git push origin 001-itinerary-view
```

---

### 2. Commit Message Convention

**格式**: `<type>(<scope>): <subject>`

**Types**:
- `feat`: 新功能
- `fix`: 修復 bug
- `docs`: 文件變更
- `style`: 格式調整（不影響程式邏輯）
- `refactor`: 重構
- `test`: 測試相關
- `chore`: 建置/工具設定

**範例**:
```bash
feat(auth): 新增密碼驗證功能
fix(itinerary): 修正日期切換錯誤
docs(spec): 更新 README.md
test(auth): 新增登入流程整合測試
```

---

## Next Steps

Phase 1 完成後：
1. ✅ 實作 AuthStore 與 LoginView（優先度 P0）
2. ✅ 實作 ItineraryStore 與 ItineraryView（優先度 P1）
3. ✅ 實作 TravelInfoStore 與 TravelInfoView（優先度 P2）
4. ✅ 撰寫單元測試與整合測試（符合 Constitution Testing Standards）
5. ✅ 執行 E2E 測試（Playwright）
6. ✅ Lighthouse CI 效能檢查
7. ✅ 部署至 GitHub Pages / Vercel / Netlify

**Recommended Reading**:
- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)

---

## Support

若遇到問題，請：
1. 檢查 [Troubleshooting](#troubleshooting) 章節
2. 搜尋 GitHub Issues: https://github.com/YOUR_USERNAME/TravelGuideLine/issues
3. 建立新 Issue（附上錯誤訊息、環境資訊、重現步驟）

**Happy Coding! 🚀**
