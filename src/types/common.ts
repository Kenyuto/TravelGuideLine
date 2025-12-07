/**
 * 共用型別與錯誤類別
 */

/**
 * Google Sheet 載入錯誤
 */
export class GoogleSheetError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message)
    this.name = 'GoogleSheetError'
  }
}

/**
 * 密碼驗證錯誤
 */
export class InvalidPasswordError extends Error {
  constructor(message: string = '密碼錯誤') {
    super(message)
    this.name = 'InvalidPasswordError'
  }
}

/**
 * 密碼過期錯誤
 */
export class PasswordExpiredError extends Error {
  constructor(message: string = '所有密碼已過期，請聯絡管理員') {
    super(message)
    this.name = 'PasswordExpiredError'
  }
}

/**
 * CSV 解析錯誤
 */
export class ParsingError extends Error {
  constructor(
    message: string,
    public row?: number
  ) {
    super(message)
    this.name = 'ParsingError'
  }
}

/**
 * Toast 訊息型別
 */
export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration: number // 顯示時長（毫秒）
}

/**
 * 錯誤狀態
 */
export interface ErrorState {
  /** 錯誤訊息 */
  message: string

  /** 錯誤類型 */
  type: 'network' | 'validation' | 'auth' | 'unknown'

  /** 重試函數（可選） */
  retry?: () => void
}
