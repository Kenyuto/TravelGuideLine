# 年長者友善模式與卡片視覺客製化功能說明

## 功能概述

本文檔說明兩個新增功能的實現細節：
1. **年長者友善模式**：針對年長使用者優化的介面設計
2. **卡片視覺客製化**：支援自訂卡片顏色和背景圖片

## 1. 年長者友善模式

### 功能說明

年長者友善模式是一個基於帳號的介面優化功能，當使用者使用標記為「年長者模式」的密碼登入後，系統會自動套用一系列針對年長者設計的視覺和互動優化。

### 設計原則

根據 WCAG 2.1 AA 級標準和年長者使用體驗研究，本功能實現以下設計原則：

1. **文字可讀性**
   - 基礎字體大小：18px（一般內容）
   - 標題字體：24-32px（h3-h1）
   - 行高：1.6 倍字體大小
   - 字體粗細：優先使用中等粗細（medium/600）

2. **視覺對比度**
   - 文字與背景對比度：≥ 4.5:1
   - 邊框加粗：2-3px
   - 使用更深的灰色替代淺灰色

3. **互動元素優化**
   - 最小點擊目標：44×44 像素
   - 按鈕內距增加：0.75rem 1rem
   - 懸停效果：輕微放大（1.02x）
   - 點擊回饋：縮小效果（0.98x）

4. **佈局與間距**
   - 卡片內距：1.5rem
   - 卡片間距：1.5rem
   - 容器左右內距：1.5rem
   - 元素間距增加 25-50%

5. **減少認知負擔**
   - 動畫時間縮短：0.1s（動畫）、0.15s（過渡）
   - 連結加粗下劃線：2px，偏移 3px
   - 圖示放大：1.5rem × 1.5rem
   - Checkbox/Radio 放大：1.5rem × 1.5rem

### 技術實現

#### 1. Google Sheet 設定

在「登入設定」頁籤中添加「年長者模式」欄位：

| 密碼 | 說明文字 | 有效期限 | 年長者模式 |
|------|---------|---------|-----------|
| grandpa123 | 爺爺奶奶專用 | 2025-12-31 | true |
| family2024 | 一般家人 | 2025-12-31 | |

支援的年長者模式值（不區分大小寫）：
- `true`
- `1`
- `yes`
- `是`

#### 2. 類型定義

```typescript
// src/types/auth.ts
export interface AuthItem {
  password: string
  description?: string
  expiryDate?: string
  isSeniorMode?: boolean  // 新增欄位
  isValid: boolean
}
```

#### 3. 資料解析

```typescript
// src/utils/googleSheetParser.ts
const isSeniorModeValue = row['年長者模式']?.trim().toLowerCase()
const isSeniorMode = 
  isSeniorModeValue === 'true' || 
  isSeniorModeValue === '1' || 
  isSeniorModeValue === 'yes' || 
  isSeniorModeValue === '是'
```

#### 4. 狀態管理

```typescript
// src/stores/auth.ts
const isSeniorMode = ref(false)

async function login(password: string): Promise<boolean> {
  const matchedAuth = validPasswords.value.find(
    item => item.password === password.trim()
  )
  
  if (matchedAuth?.isSeniorMode) {
    isSeniorMode.value = true
    document.documentElement.classList.add('senior-mode')
    localStorage.setItem('seniorMode', 'true')
  }
}

function logout(): void {
  isSeniorMode.value = false
  document.documentElement.classList.remove('senior-mode')
  localStorage.removeItem('seniorMode')
}
```

#### 5. CSS 樣式

所有年長者模式的樣式都定義在 `src/assets/styles/main.css` 中，使用 `.senior-mode` 類名作為根選擇器。

主要樣式包括：
- 基礎字體和行高設定
- 標題字體放大
- 按鈕和表單元素優化
- 間距增加
- 對比度增強
- 動畫時間縮短

### 使用流程

1. 管理員在 Google Sheet「登入設定」頁籤中，將特定密碼的「年長者模式」欄位設為 `true`
2. 年長使用者使用該密碼登入
3. 系統檢測到年長者模式標記，自動套用優化樣式
4. `<html>` 元素添加 `.senior-mode` 類名
5. 所有頁面自動應用年長者友善樣式
6. 登出後自動移除年長者模式

### 測試要點

- [ ] 使用年長者模式密碼登入後，介面字體明顯放大
- [ ] 按鈕尺寸至少 44×44 像素
- [ ] 文字對比度足夠（使用瀏覽器檢查工具驗證）
- [ ] 連結有明顯下劃線
- [ ] 點擊按鈕有視覺回饋
- [ ] 登出後恢復正常模式
- [ ] 重新整理頁面後模式保持（使用 localStorage）

---

## 2. 卡片視覺客製化

### 功能說明

允許為每個行程項目設定專屬的背景顏色或背景圖片，讓行程卡片更具辨識度和視覺吸引力。

### 設計考量

1. **靈活性**：支援純色和圖片兩種方式
2. **優先級**：背景圖片 > 背景顏色 > 預設白色
3. **相容性**：支援所有 CSS 顏色值格式
4. **圖片處理**：自動 cover 覆蓋、居中對齊

### 技術實現

#### 1. Google Sheet 設定

在「行程」頁籤中添加兩個新欄位：

| 日期 | 標題 | 類別 | 卡片顏色 | 卡片背景圖片 |
|------|------|------|---------|-------------|
| 2024-12-15 | 台北101 | 景點 | #E3F2FD | |
| 2024-12-15 | 鼎泰豐 | 美食 | rgb(255, 243, 224) | |
| 2024-12-15 | 陽明山 | 景點 | | https://example.com/img.jpg |

支援的顏色格式：
- 十六進位：`#FFE5E5`、`#FE5`
- RGB：`rgb(255, 229, 229)`
- RGBA：`rgba(255, 229, 229, 0.8)`
- HSL：`hsl(0, 100%, 95%)`
- 顏色名稱：`pink`、`lightblue`

#### 2. 類型定義

```typescript
// src/types/itinerary.ts
export interface ItineraryItem {
  // ... 其他欄位
  cardColor?: string              // 新增欄位
  cardBackgroundImage?: string    // 新增欄位
}
```

#### 3. 資料解析

```typescript
// src/utils/googleSheetParser.ts
const item: ItineraryItem = {
  // ... 其他欄位
  cardColor: row['卡片顏色']?.trim() || undefined,
  cardBackgroundImage: row['卡片背景圖片']?.trim() || undefined,
}
```

#### 4. 組件實現

```vue
<!-- src/components/itinerary/ItineraryItemCard.vue -->
<template>
  <div
    :class="[/* 類名 */]"
    :style="cardStyle"
  >
    <!-- 卡片內容 -->
  </div>
</template>

<script setup lang="ts">
const cardStyle = computed(() => {
  const style: Record<string, string> = {}
  
  if (props.item.cardBackgroundImage) {
    style.backgroundImage = `url('${props.item.cardBackgroundImage}')`
    style.backgroundSize = 'cover'
    style.backgroundPosition = 'center'
    style.backgroundRepeat = 'no-repeat'
  } else if (props.item.cardColor) {
    style.backgroundColor = props.item.cardColor
  }
  
  return style
})
</script>
```

### 使用建議

1. **顏色選擇**
   - 景點類：藍色系（`#E3F2FD`、`#BBDEFB`）
   - 美食類：橙色系（`#FFF3E0`、`#FFE0B2`）
   - 交通類：灰色系（`#F5F5F5`、`#EEEEEE`）
   - 住宿類：綠色系（`#E8F5E9`、`#C8E6C9`）

2. **圖片選擇**
   - 使用高解析度圖片（至少 800×600）
   - 確保圖片載入速度
   - 考慮圖片上的文字可讀性（可能需要半透明遮罩）

3. **無障礙考量**
   - 自訂顏色時確保文字對比度足夠
   - 背景圖片建議添加半透明深色遮罩以提高文字可讀性

### 測試要點

- [ ] 設定顏色後，卡片背景正確顯示
- [ ] 設定圖片後，圖片正確載入並覆蓋整個卡片
- [ ] 圖片優先於顏色顯示
- [ ] 未設定時使用預設白色背景
- [ ] 文字在自訂背景上保持可讀性
- [ ] 已完成狀態的綠色邊框正常顯示

---

## 整合測試

### 情境 1：年長者使用彩色卡片
- 使用年長者模式密碼登入
- 卡片顯示自訂顏色/圖片
- 字體放大後文字仍清晰可讀
- 卡片間距增加，不會擁擠

### 情境 2：一般使用者使用彩色卡片
- 使用一般密碼登入
- 卡片顯示自訂顏色/圖片
- 保持標準字體和間距

### 情境 3：跨裝置一致性
- 手機、平板、桌機都能正確顯示
- 年長者模式在所有裝置上都生效
- 卡片顏色/圖片在所有裝置上都正確渲染

---

## 常見問題

### Q1：如何為多個密碼啟用年長者模式？
A：在 Google Sheet 中為每個需要的密碼設定「年長者模式」欄位為 `true`。

### Q2：可以臨時關閉年長者模式嗎？
A：目前需要登出後使用一般密碼重新登入。未來可考慮添加切換開關。

### Q3：卡片背景圖片載入失敗怎麼辦？
A：會自動退回使用卡片顏色，如果顏色也沒設定則使用預設白色。

### Q4：年長者模式會影響效能嗎？
A：不會。年長者模式只是 CSS 樣式變化，不影響資料載入和處理。

### Q5：可以為不同類別設定預設顏色嗎？
A：目前需要在 Google Sheet 中手動設定每筆資料。未來可考慮添加類別預設顏色對應。

---

## 未來改進方向

1. **年長者模式**
   - 添加字體大小調整滑桿（100%-200%）
   - 提供高對比度主題切換
   - 支援語音導航

2. **卡片客製化**
   - 類別預設顏色配置
   - 圖片快取優化
   - 漸層色背景支援
   - 半透明遮罩自動添加（圖片背景時）

3. **使用者偏好**
   - 記住使用者選擇的字體大小
   - 個人化主題設定
   - 夜間模式支援
