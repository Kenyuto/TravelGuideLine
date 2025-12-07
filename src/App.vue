<template>
  <div id="app" class="min-h-screen bg-gray-50 text-gray-900">
    <div
      v-if="loading"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div class="rounded-lg bg-white p-6 shadow-xl">
        <div class="flex items-center space-x-3">
          <div
            class="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"
          ></div>
          <span class="text-lg font-medium text-gray-700">載入中...</span>
        </div>
      </div>
    </div>

    <div
      v-if="error"
      class="fixed left-4 right-4 top-4 z-40 mx-auto max-w-md rounded-lg border border-red-300 bg-red-50 p-4 shadow-lg"
    >
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <svg
            class="h-6 w-6 text-red-600"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div class="ml-3 flex-1">
          <h3 class="text-sm font-medium text-red-800">錯誤</h3>
          <p class="mt-1 text-sm text-red-700">{{ error }}</p>
        </div>
        <button
          @click="clearError"
          class="ml-3 flex-shrink-0 rounded-md p-1 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <span class="sr-only">關閉</span>
          <svg
            class="h-5 w-5 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>

    <div
      v-if="isOffline"
      class="fixed left-0 right-0 top-0 z-40 bg-yellow-500 px-4 py-2 text-center text-sm font-medium text-white"
    >
      ⚠️ 目前處於離線模式，資料可能未同步
    </div>

    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterView } from 'vue-router'

// 全域狀態（Phase 8 將移至 UIStore）
const loading = ref(false)
const error = ref<string | null>(null)
const isOffline = ref(false)

/**
 * 清除錯誤訊息
 */
function clearError() {
  error.value = null
}

/**
 * 處理離線狀態
 */
function handleOnline() {
  isOffline.value = false
}

function handleOffline() {
  isOffline.value = true
}

/**
 * 全域錯誤處理
 */
function handleError(event: ErrorEvent) {
  console.error('全域錯誤：', event.error)
  error.value = event.error?.message || '發生未知錯誤'
}

function handleUnhandledRejection(event: PromiseRejectionEvent) {
  console.error('未處理的 Promise 拒絕：', event.reason)
  error.value = event.reason?.message || '非同步操作失敗'
}

/**
 * 初始化
 */
onMounted(() => {
  // 監聽離線/線上狀態
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)

  // 初始化離線狀態
  isOffline.value = !navigator.onLine

  // 全域錯誤處理
  window.addEventListener('error', handleError)
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  window.removeEventListener('error', handleError)
  window.removeEventListener('unhandledrejection', handleUnhandledRejection)
})
</script>

<style scoped>
/* 頁面切換過渡效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
