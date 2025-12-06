/**
 * LocalStorage 驗證狀態管理工具
 * 支援 7 天登入持續性
 */

import type { AuthState } from '@/types/auth'

/** LocalStorage key */
const AUTH_STATE_KEY = 'authState'

/** 登入有效期限（7 天，毫秒） */
const AUTH_TTL = 7 * 24 * 60 * 60 * 1000

/**
 * 儲存登入狀態到 LocalStorage
 * @param isAuthenticated - 是否已登入
 */
export function saveAuthState(isAuthenticated: boolean): void {
  const state: AuthState = {
    isAuthenticated,
    authTimestamp: Date.now(),
    version: '1.0.0',
  }

  try {
    localStorage.setItem(AUTH_STATE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('儲存登入狀態失敗：', error)
  }
}

/**
 * 從 LocalStorage 載入登入狀態
 * @returns AuthState 或 null（若不存在或已過期）
 */
export function loadAuthState(): AuthState | null {
  try {
    const stored = localStorage.getItem(AUTH_STATE_KEY)

    if (!stored) {
      return null
    }

    const state: AuthState = JSON.parse(stored)

    // 檢查版本
    if (state.version !== '1.0.0') {
      console.warn('登入狀態版本不符，清除舊資料')
      clearAuthState()
      return null
    }

    // 檢查是否過期（7 天）
    const now = Date.now()
    const elapsed = now - state.authTimestamp

    if (elapsed > AUTH_TTL) {
      console.info('登入已過期（超過 7 天）')
      clearAuthState()
      return null
    }

    return state
  } catch (error) {
    console.error('載入登入狀態失敗：', error)
    clearAuthState()
    return null
  }
}

/**
 * 清除登入狀態
 */
export function clearAuthState(): void {
  try {
    localStorage.removeItem(AUTH_STATE_KEY)
  } catch (error) {
    console.error('清除登入狀態失敗：', error)
  }
}

/**
 * 檢查登入狀態是否有效（7 天內）
 * @returns true 若已登入且未過期
 */
export function isLoginValid(): boolean {
  const state = loadAuthState()

  if (!state) {
    return false
  }

  return state.isAuthenticated
}

/**
 * 計算登入剩餘時間（毫秒）
 * @returns 剩餘毫秒數，若未登入則為 0
 */
export function getRemainingTime(): number {
  const state = loadAuthState()

  if (!state || !state.isAuthenticated) {
    return 0
  }

  const now = Date.now()
  const elapsed = now - state.authTimestamp
  const remaining = AUTH_TTL - elapsed

  return remaining > 0 ? remaining : 0
}
