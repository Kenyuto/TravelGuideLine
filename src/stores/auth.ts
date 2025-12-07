/**
 * AuthStore - 登入驗證狀態管理
 * 使用 Pinia 2.x
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthItem, AuthConfig } from '@/types/auth'
import { InvalidPasswordError, PasswordExpiredError, GoogleSheetError } from '@/types/common'
import {
  saveAuthState,
  loadAuthState,
  clearAuthState,
  isLoginValid as checkLoginValid,
  getRemainingTime,
} from '@/utils/authHelper'
import { fetchGoogleSheetCSV, parseGoogleSheetCSV } from '@/utils/googleSheetParser'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isAuthenticated = ref(false)
  const authTimestamp = ref<number | null>(null)
  const passwordList = ref<AuthItem[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const isLoginValid = computed(() => {
    if (!isAuthenticated.value || !authTimestamp.value) {
      return false
    }
    return checkLoginValid()
  })

  const validPasswords = computed(() => {
    return passwordList.value.filter((item) => item.isValid)
  })

  const remainingTime = computed(() => {
    if (!isAuthenticated.value || !authTimestamp.value) {
      return 0
    }
    return getRemainingTime()
  })

  // Actions
  async function loadAuthConfig(sheetId: string, gid: number = 2): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const csvData = await fetchGoogleSheetCSV(sheetId, gid)
      const authConfig = parseGoogleSheetCSV(csvData, 'authConfig') as AuthConfig

      if (!authConfig.items || authConfig.items.length === 0) {
        throw new GoogleSheetError('登入設定中無有效密碼')
      }

      const validCount = authConfig.items.filter((item) => item.isValid).length
      if (validCount === 0) {
        throw new PasswordExpiredError('所有密碼已過期，請聯絡管理員')
      }

      passwordList.value = authConfig.items
    } catch (err) {
      if (err instanceof GoogleSheetError || err instanceof PasswordExpiredError) {
        error.value = err.message
        throw err
      }
      error.value = '無法載入登入設定，請聯絡管理員'
      throw new GoogleSheetError(error.value)
    } finally {
      loading.value = false
    }
  }

  function validatePassword(password: string): boolean {
    if (!password || password.trim().length === 0) {
      return false
    }

    const trimmedPassword = password.trim()
    return validPasswords.value.some((item) => item.password === trimmedPassword)
  }

  async function login(password: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      if (!validatePassword(password)) {
        throw new InvalidPasswordError('密碼錯誤，請重新輸入')
      }

      // 設定登入狀態
      isAuthenticated.value = true
      authTimestamp.value = Date.now()

      // 儲存至 LocalStorage
      saveAuthState(true)

      return true
    } catch (err) {
      if (err instanceof InvalidPasswordError) {
        error.value = err.message
        throw err
      }
      error.value = '登入失敗，請重試'
      throw new Error(error.value)
    } finally {
      loading.value = false
    }
  }

  function logout(): void {
    isAuthenticated.value = false
    authTimestamp.value = null
    clearAuthState()
  }

  function restoreAuthState(): void {
    const state = loadAuthState()

    if (state && state.isAuthenticated) {
      isAuthenticated.value = true
      authTimestamp.value = state.authTimestamp
    }
  }

  return {
    // State
    isAuthenticated,
    authTimestamp,
    passwordList,
    loading,
    error,
    // Getters
    isLoginValid,
    validPasswords,
    remainingTime,
    // Actions
    loadAuthConfig,
    validatePassword,
    login,
    logout,
    restoreAuthState,
  }
})
