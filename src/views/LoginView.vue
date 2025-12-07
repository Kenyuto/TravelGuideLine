<template>
  <div
    class="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12"
  >
    <div class="w-full max-w-md">
      <div class="rounded-2xl bg-white p-8 shadow-2xl">
        <div class="mb-8 text-center">
          <slot name="title">
            <h1 class="text-3xl font-bold text-gray-900">旅遊行程檢視</h1>
          </slot>
          <slot name="description">
            <p class="mt-2 text-sm text-gray-600">請輸入密碼以查看行程</p>
          </slot>
        </div>

        <LoginForm :loading="authStore.loading" :error="authStore.error" @submit="handleSubmit">
          <template #title>
            <slot name="form-title" />
          </template>
          <template #description>
            <slot name="form-description" />
          </template>
        </LoginForm>

        <div v-if="authStore.remainingTime > 0" class="mt-6 rounded-lg bg-green-50 p-4">
          <p class="text-center text-sm text-green-800">
            ✓ 已登入，剩餘時間：{{ formatRemainingTime(authStore.remainingTime) }}
          </p>
          <button
            @click="handleLogout"
            class="mt-2 w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            登出
          </button>
        </div>
      </div>

      <p class="mt-6 text-center text-xs text-gray-500">
        此頁面受密碼保護，適合家人朋友分享旅遊行程
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginForm from '@/components/auth/LoginForm.vue'

const router = useRouter()
const authStore = useAuthStore()

/**
 * 處理表單提交
 */
async function handleSubmit(password: string) {
  try {
    // 如果密碼清單尚未載入，先載入
    if (authStore.passwordList.length === 0) {
      const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
      if (!sheetId) {
        throw new Error('未設定 Google Sheet ID，請檢查 .env 設定')
      }
      await authStore.loadAuthConfig(sheetId, 69363529)
    }

    // 執行登入
    await authStore.login(password)

    // 登入成功，導航至行程頁面
    const redirect = router.currentRoute.value.query.redirect as string | undefined
    router.push(redirect || '/itinerary')
  } catch (error) {
    // 錯誤已由 AuthStore 處理並設定至 error state
    console.error('登入失敗：', error)
  }
}

/**
 * 處理登出
 */
function handleLogout() {
  authStore.logout()
}

/**
 * 格式化剩餘時間
 */
function formatRemainingTime(ms: number): string {
  const days = Math.floor(ms / (1000 * 60 * 60 * 24))
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

  if (days > 0) {
    return `${days} 天 ${hours} 小時`
  }
  return `${hours} 小時`
}

/**
 * 初始化
 */
onMounted(() => {
  // 恢復登入狀態
  authStore.restoreAuthState()

  // 如果已登入且有效，直接導航至行程頁面
  if (authStore.isLoginValid) {
    const redirect = router.currentRoute.value.query.redirect as string | undefined
    router.push(redirect || '/itinerary')
  }
})
</script>
