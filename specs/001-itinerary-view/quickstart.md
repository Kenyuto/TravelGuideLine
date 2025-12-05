# 快速開始：旅遊行程檢視網站開發指南

**功能分支**: `001-itinerary-view`  
**版本**: v1.0.0  
**建立日期**: 2025-12-05  
**目標讀者**: 前端開發者、貢獻者

---

## 目錄

1. [環境需求](#環境需求)
2. [專案初始化](#專案初始化)
3. [開發流程](#開發流程)
4. [測試](#測試)
5. [建構與部署](#建構與部署)
6. [常見問題](#常見問題)
7. [開發規範](#開發規範)

---

## 環境需求

### 必要軟體

| 軟體 | 最低版本 | 推薦版本 | 安裝驗證指令 |
|------|---------|---------|------------|
| Node.js | 18.x | 20.x LTS | `node --version` |
| npm | 9.x | 10.x | `npm --version` |
| Git | 2.30+ | 最新穩定版 | `git --version` |

### 推薦工具

- **編輯器**: Visual Studio Code 1.85+
- **VSCode 擴充套件**:
  - Vue - Official (`Vue.volar`)
  - ESLint (`dbaeumer.vscode-eslint`)
  - Prettier - Code formatter (`esbenp.prettier-vscode`)
  - TypeScript Vue Plugin (Volar) (`Vue.vscode-typescript-vue-plugin`)
  - Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)

### 瀏覽器要求（測試用）

- Chrome 90+ / Edge 90+（主要測試瀏覽器）
- Firefox 88+
- Safari 14+

---

## 專案初始化

### 1. Clone 專案

```bash
git clone https://github.com/your-username/TravelGuideLine.git
cd TravelGuideLine
```

### 2. 切換至功能分支

```bash
git checkout 001-itinerary-view
```

### 3. 建立 Vue 3 + Vite 專案

```bash
# 使用 Vite 官方腳手架建立專案
npm create vite@latest travel-guide -- --template vue-ts

# 進入專案目錄
cd travel-guide

# 安裝依賴
npm install
```

### 4. 安裝核心依賴

```bash
# Vue Router（路由）
npm install vue-router@4

# Pinia（狀態管理）
npm install pinia

# PapaParse（CSV 解析）
npm install papaparse
npm install --save-dev @types/papaparse

# Tailwind CSS（樣式框架）
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 5. 安裝開發工具

```bash
# ESLint + Prettier
npm install --save-dev eslint prettier eslint-config-prettier eslint-plugin-vue @vue/eslint-config-typescript

# Vitest（測試框架）
npm install --save-dev vitest @vue/test-utils happy-dom

# Playwright（E2E 測試）
npm install --save-dev @playwright/test
npx playwright install
```

### 6. 安裝 PWA 支援

```bash
# Vite PWA Plugin
npm install --save-dev vite-plugin-pwa
```

### 7. 配置 Tailwind CSS

編輯 `tailwind.config.js`：

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

在 `src/style.css` 中加入：

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 8. 配置 TypeScript

編輯 `tsconfig.json`（Vue 專案預設已包含，確認以下配置）：

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### 9. 配置 Vite（PWA + 環境變數）

編輯 `vite.config.ts`：

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: '旅遊行程檢視',
        short_name: '行程',
        description: '快速查看旅遊行程規劃',
        theme_color: '#3b82f6',
        icons: [
          {
            src: 'icon-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/docs\.google\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-sheets',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 3600 // 1 小時
              }
            }
          }
        ]
      }
    })
  ],
  base: '/' // GitHub Pages 需設定為 '/repo-name/'
})
```

### 10. 建立環境變數檔案

建立 `.env` 檔案（本地開發用）：

```env
VITE_GOOGLE_SHEET_ID=your-sheet-id-here
VITE_ITINERARY_GID=0
VITE_TRAVEL_INFO_GID=123456
```

---

## 開發流程

### 1. 啟動開發伺服器

```bash
npm run dev
```

預設運行於 `http://localhost:5173`

### 2. 專案結構

```
travel-guide/
├── src/
│   ├── assets/          # 靜態資源（圖片、字型）
│   ├── components/      # Vue 組件
│   │   ├── ItineraryCard.vue
│   │   ├── DateNavigator.vue
│   │   ├── SearchBar.vue
│   │   └── FilterChips.vue
│   ├── stores/          # Pinia Stores
│   │   ├── itinerary.ts
│   │   ├── travelInfo.ts
│   │   └── ui.ts
│   ├── types/           # TypeScript 型別定義
│   │   ├── itinerary.ts
│   │   └── travelInfo.ts
│   ├── utils/           # 工具函數
│   │   ├── googleSheet.ts    # Google Sheet 載入
│   │   ├── localStorage.ts   # LocalStorage 操作
│   │   └── date.ts           # 日期工具
│   ├── views/           # 頁面視圖
│   │   ├── ItineraryView.vue
│   │   └── TravelInfoView.vue
│   ├── router/          # Vue Router 配置
│   │   └── index.ts
│   ├── App.vue          # 根組件
│   ├── main.ts          # 應用入口
│   └── style.css        # 全域樣式
├── public/              # 公開資源（favicon, PWA icons）
├── tests/               # 測試檔案
│   ├── unit/            # 單元測試
│   ├── integration/     # 整合測試
│   └── e2e/             # E2E 測試（Playwright）
├── .env                 # 環境變數（不提交）
├── .env.example         # 環境變數範例（提交）
├── .eslintrc.cjs        # ESLint 配置
├── .prettierrc.json     # Prettier 配置
├── vite.config.ts       # Vite 配置
├── vitest.config.ts     # Vitest 配置
├── playwright.config.ts # Playwright 配置
├── tailwind.config.js   # Tailwind CSS 配置
├── tsconfig.json        # TypeScript 配置
└── package.json         # 依賴管理
```

### 3. 開發工作流程

1. **建立分支**（如已在 001-itinerary-view 則跳過）
   ```bash
   git checkout -b 001-itinerary-view
   ```

2. **開發功能**（TDD 推薦流程）
   - 撰寫失敗測試（`tests/unit/xxx.test.ts`）
   - 實作功能（`src/xxx.ts`）
   - 執行測試驗證（`npm run test:unit`）
   - 重構程式碼

3. **提交變更**
   ```bash
   git add .
   git commit -m "feat(itinerary): 實作行程卡片組件"
   ```

4. **推送至遠端**
   ```bash
   git push origin 001-itinerary-view
   ```

---

## 測試

### 單元測試（Vitest）

```bash
# 執行所有單元測試
npm run test:unit

# 監看模式（檔案變更自動執行）
npm run test:unit:watch

# 產生覆蓋率報告
npm run test:unit:coverage
```

**測試檔案範例** (`tests/unit/googleSheet.test.ts`)：

```typescript
import { describe, it, expect, vi } from 'vitest';
import { fetchItineraryFromSheet } from '@/utils/googleSheet';

describe('Google Sheet 資料載入', () => {
  it('應正確解析 CSV 並轉換為 ItineraryDay', async () => {
    // Mock PapaParse
    vi.mock('papaparse', () => ({
      default: {
        parse: vi.fn((url, options) => {
          options.complete({
            data: [
              { date: '2024-01-15', title: '測試景點', category: 'attraction' }
            ]
          });
        })
      }
    }));

    const days = await fetchItineraryFromSheet('test-id', 0);
    expect(days).toHaveLength(1);
    expect(days[0].date).toBe('2024-01-15');
  });
});
```

### 組件測試（Vitest + @vue/test-utils）

```bash
npm run test:component
```

**測試檔案範例** (`tests/unit/ItineraryCard.test.ts`)：

```typescript
import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ItineraryCard from '@/components/ItineraryCard.vue';

describe('ItineraryCard', () => {
  it('應顯示行程標題與分類', () => {
    const item = {
      id: '1',
      title: '台北101',
      category: 'attraction' as const
    };
    const wrapper = mount(ItineraryCard, { props: { item } });
    
    expect(wrapper.text()).toContain('台北101');
    expect(wrapper.text()).toContain('景點');
  });

  it('點擊完成按鈕應觸發 toggle-completed 事件', async () => {
    const item = { id: '1', title: '測試', category: 'attraction' as const };
    const wrapper = mount(ItineraryCard, { props: { item } });
    
    await wrapper.find('.complete-btn').trigger('click');
    
    expect(wrapper.emitted('toggle-completed')).toBeTruthy();
    expect(wrapper.emitted('toggle-completed')?.[0]).toEqual(['1']);
  });
});
```

### E2E 測試（Playwright）

```bash
# 執行所有 E2E 測試
npm run test:e2e

# 開啟 Playwright UI 模式
npm run test:e2e:ui

# 執行特定瀏覽器測試
npm run test:e2e -- --project=chromium
```

**測試檔案範例** (`tests/e2e/itinerary.spec.ts`)：

```typescript
import { test, expect } from '@playwright/test';

test('使用者可切換日期並查看行程', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 等待行程載入
  await expect(page.locator('.date-navigator')).toBeVisible();
  
  // 點擊下一天按鈕
  await page.click('.next-day-btn');
  
  // 驗證日期已變更
  await expect(page.locator('.current-date')).toContainText('2024-01-16');
  
  // 驗證行程卡片顯示
  await expect(page.locator('.itinerary-card')).toHaveCount(3);
});

test('使用者可搜尋行程項目', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 輸入搜尋關鍵字
  await page.fill('.search-input', '鼎泰豐');
  
  // 等待防抖延遲
  await page.waitForTimeout(350);
  
  // 驗證僅顯示符合結果
  await expect(page.locator('.itinerary-card')).toHaveCount(1);
  await expect(page.locator('.itinerary-card')).toContainText('鼎泰豐');
});
```

---

## 建構與部署

### 本地建構

```bash
# 建構生產版本
npm run build

# 預覽建構結果
npm run preview
```

產出檔案位於 `dist/` 資料夾。

### 部署至 GitHub Pages

#### 1. 更新 `vite.config.ts` 的 `base` 設定

```typescript
export default defineConfig({
  base: '/TravelGuideLine/', // 改為你的 repo 名稱
  // ... 其他配置
})
```

#### 2. 建立 GitHub Actions 工作流程

建立 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main, 001-itinerary-view]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_GOOGLE_SHEET_ID: ${{ secrets.GOOGLE_SHEET_ID }}
          VITE_ITINERARY_GID: 0
          VITE_TRAVEL_INFO_GID: 123456
          
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

#### 3. 設定 GitHub Secrets

在 GitHub Repository 設定中：
- Settings > Secrets and variables > Actions
- 新增 `GOOGLE_SHEET_ID`（你的 Google Sheet ID）

#### 4. 啟用 GitHub Pages

- Settings > Pages
- Source: 選擇 `gh-pages` 分支
- 儲存後等待部署完成

---

### 部署至 Cloudflare Pages

#### 1. 連結 GitHub Repository

- 登入 [Cloudflare Dashboard](https://dash.cloudflare.com)
- Pages > Create a project > Connect to Git
- 選擇 TravelGuideLine repository

#### 2. 配置建構設定

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Environment variables**:
  - `VITE_GOOGLE_SHEET_ID`: 你的 Google Sheet ID
  - `VITE_ITINERARY_GID`: 0
  - `VITE_TRAVEL_INFO_GID`: 123456

#### 3. 部署

點擊 "Save and Deploy"，Cloudflare 會自動建構並部署。

---

### 部署至 Vercel

```bash
# 安裝 Vercel CLI
npm install -g vercel

# 部署
vercel

# 生產環境部署
vercel --prod
```

或透過 Vercel Dashboard 連結 GitHub Repository，設定同 Cloudflare Pages。

---

## 常見問題

### Q1: `npm install` 執行失敗

**錯誤訊息**：`ERESOLVE unable to resolve dependency tree`

**解決方法**：
```bash
# 清除快取
npm cache clean --force

# 刪除 node_modules 與 package-lock.json
rm -rf node_modules package-lock.json

# 重新安裝
npm install
```

### Q2: TypeScript 型別錯誤（Volar 未偵測到 `.vue` 檔案型別）

**解決方法**：
1. 確認已安裝 `Vue - Official` 擴充套件
2. 重新載入 VSCode（`Ctrl+Shift+P` > `Developer: Reload Window`）
3. 檢查 `tsconfig.json` 是否包含 `"include": ["src/**/*.vue"]`

### Q3: Google Sheet CSV 無法載入（CORS 錯誤）

**錯誤訊息**：`Access to fetch at 'https://docs.google.com/...' has been blocked by CORS policy`

**原因**：Google Sheet 未設定為「任何人皆可查看」

**解決方法**：
1. 開啟 Google Sheet
2. 右上角「共用」> 「變更」
3. 選擇「知道連結的所有人」或「網際網路上的所有人」
4. 權限設為「檢視者」
5. 儲存設定

### Q4: PWA 無法在本地測試

**原因**：Service Worker 需要 HTTPS 或 localhost

**解決方法**：
```bash
# 使用 Vite 預覽建構結果（支援 PWA）
npm run build
npm run preview
```

或使用瀏覽器的 PWA 測試功能：
- Chrome DevTools > Application > Service Workers
- 勾選 "Bypass for network"

### Q5: Tailwind CSS 樣式未生效

**解決方法**：
1. 確認 `tailwind.config.js` 的 `content` 包含所有 Vue 檔案路徑
2. 確認 `src/style.css` 包含 Tailwind directives
3. 重新啟動開發伺服器（`Ctrl+C` 後 `npm run dev`）

### Q6: Vitest 測試執行緩慢

**解決方法**：
```bash
# 僅執行變更的測試檔案
npm run test:unit -- --changed

# 並行執行測試
npm run test:unit -- --threads
```

---

## 開發規範

### 程式碼風格

- **縮排**：2 空格（TypeScript / Vue）
- **引號**：單引號（TypeScript）
- **分號**：不使用（Prettier 預設）
- **命名規則**：
  - 元件檔名：`PascalCase.vue`（如：`ItineraryCard.vue`）
  - 函數檔名：`camelCase.ts`（如：`googleSheet.ts`）
  - 常數：`UPPER_SNAKE_CASE`（如：`DEFAULT_GID`）
  - 型別／介面：`PascalCase`（如：`ItineraryItem`）

### Git Commit 訊息規範

遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hant/)：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**類型（type）**：
- `feat`: 新功能
- `fix`: 錯誤修正
- `docs`: 文件更新
- `style`: 程式碼格式調整（不影響功能）
- `refactor`: 重構（不改變功能）
- `test`: 測試新增或修正
- `chore`: 建構流程或輔助工具變更

**範例**：
```
feat(itinerary): 新增行程卡片組件

- 支援顯示標題、分類、時間段
- 包含 Google Maps 超連結
- 支援完成狀態切換

Closes #42
```

### Pull Request 檢查清單

提交 PR 前確認：

- [ ] 所有測試通過（`npm run test:unit`）
- [ ] ESLint 無錯誤（`npm run lint`）
- [ ] Prettier 格式化完成（`npm run format`）
- [ ] TypeScript 型別檢查通過（`npm run type-check`）
- [ ] 已更新相關文件（若適用）
- [ ] PR 描述清楚說明變更內容
- [ ] Commit 訊息遵循規範

---

## 技術支援

### 相關文件

- [Vue 3 官方文件](https://vuejs.org/)
- [Vite 官方文件](https://vitejs.dev/)
- [Pinia 官方文件](https://pinia.vuejs.org/)
- [Tailwind CSS 官方文件](https://tailwindcss.com/)
- [Vitest 官方文件](https://vitest.dev/)
- [Playwright 官方文件](https://playwright.dev/)

### 內部文件

- [資料模型定義 data-model.md](./data-model.md)
- [Google Sheet 合約 contracts/google-sheet-csv.md](./contracts/google-sheet-csv.md)
- [前端 API 合約 contracts/frontend-api.md](./contracts/frontend-api.md)
- [技術研究報告 research.md](./research.md)

### 問題回報

如遇到問題，請於 GitHub Issues 回報，並提供：

1. 問題描述
2. 重現步驟
3. 預期行為 vs 實際行為
4. 環境資訊（Node.js 版本、瀏覽器、作業系統）
5. 錯誤訊息與截圖（若適用）

---

**版本**: v1.0.0  
**最後更新**: 2025-12-05  
**維護者**: [團隊名稱或個人]

祝開發順利！🚀
