/**
 * Deep Link Helper
 * 處理 URL 參數與深連結生成
 */

/**
 * 從當前 URL 取得查詢參數值
 * @param paramName - 參數名稱
 * @returns 參數值，若不存在則返回 null
 */
export function getQueryParam(paramName: string): string | null {
  // 使用 URLSearchParams 解析當前 URL 的查詢字串
  const params = new URLSearchParams(window.location.search)
  return params.get(paramName)
}

/**
 * 設定 URL 查詢參數（不重新載入頁面）
 * @param params - 要設定的參數物件
 * @param replace - 是否使用 replaceState（預設 false）
 */
export function setQueryParams(params: Record<string, string>, replace = false): void {
  const url = new URL(window.location.href)

  // 更新查詢參數
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value)
    } else {
      url.searchParams.delete(key)
    }
  })

  // 使用 History API 更新 URL 而不重新載入
  if (replace) {
    window.history.replaceState({}, '', url.toString())
  } else {
    window.history.pushState({}, '', url.toString())
  }
}

/**
 * 生成深連結 URL
 * @param options - 深連結選項
 * @returns 完整的深連結 URL
 */
export function generateDeepLink(options: {
  date?: string
  itemId?: string
  itemTitle?: string
}): string {
  const baseUrl = window.location.origin + window.location.pathname
  const url = new URL(baseUrl)

  // Hash mode: 路徑包含在 hash 中
  url.hash = '#/itinerary'

  // 添加查詢參數
  if (options.date) {
    url.searchParams.set('date', options.date)
  }

  if (options.itemId) {
    url.searchParams.set('item', options.itemId)
  }

  // 可選：添加標題作為可讀性參數（不影響功能）
  if (options.itemTitle) {
    // 生成 URL-friendly 的 slug
    const slug = options.itemTitle
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-\u4e00-\u9fa5]+/g, '')
    url.searchParams.set('title', slug)
  }

  return url.toString()
}

/**
 * 清除所有查詢參數
 */
export function clearQueryParams(): void {
  const url = new URL(window.location.href)
  url.search = ''
  window.history.replaceState({}, '', url.toString())
}

/**
 * 從 URL 解析深連結參數
 * @returns 深連結參數物件
 */
export function parseDeepLinkParams(): {
  date: string | null
  itemId: string | null
  title: string | null
} {
  return {
    date: getQueryParam('date'),
    itemId: getQueryParam('item'),
    title: getQueryParam('title'),
  }
}

/**
 * 生成 URL-friendly 的 slug
 * @param text - 要轉換的文字
 * @returns slug 字串
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-\u4e00-\u9fa5]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '')
}
