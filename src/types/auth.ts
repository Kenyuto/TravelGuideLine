/**
 * 登入驗證資料型別
 * 對應 Google Sheet「登入設定」工作表（GID 2）
 */

/**
 * 登入驗證設定
 * 從 Google Sheet「登入設定」tab 載入
 */
export interface AuthConfig {
  /** 密碼清單 */
  items: AuthItem[]

  /** 最後更新時間（用於快取驗證） */
  lastUpdated: Date

  /** 資料版本（未來遷移用） */
  version: string // e.g., '1.0.0'
}

/**
 * 單一密碼項目
 */
export interface AuthItem {
  /** 密碼（明文或 SHA-256 hash） */
  password: string

  /**
   * 密碼用途說明（選填）
   * 範例："家人共用"、"朋友查看"
   */
  description?: string

  /**
   * 有效期限（選填，YYYY-MM-DD 格式）
   * 未設定則永久有效
   */
  expiryDate?: string

  /**
   * 是否有效（計算屬性）
   * 邏輯：!expiryDate || new Date(expiryDate) >= new Date()
   */
  isValid: boolean
}

/**
 * LocalStorage 登入狀態
 */
export interface AuthState {
  /** 是否已登入 */
  isAuthenticated: boolean

  /** 登入時間戳（Unix timestamp, milliseconds） */
  authTimestamp: number

  /** 版本號（未來遷移用） */
  version: string // '1.0.0'
}

/**
 * 計算 AuthItem 是否有效
 * @param authItem - 密碼項目
 * @returns true 若密碼未過期
 */
export function computeIsValid(authItem: AuthItem): boolean {
  if (!authItem.expiryDate) return true // 未設定有效期限，永久有效

  const expiryDate = new Date(authItem.expiryDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0) // 重設為當天 00:00

  return expiryDate >= today
}

/**
 * 預設登入設定
 */
export const defaultAuthConfig: AuthConfig = {
  items: [],
  lastUpdated: new Date(),
  version: '1.0.0',
}
