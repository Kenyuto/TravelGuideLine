<template>
  <div class="min-h-screen bg-gray-50 pb-20">
    <div v-if="itineraryStore.loading" class="flex min-h-screen items-center justify-center">
      <div class="text-center">
        <div
          class="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"
        ></div>
        <p class="text-lg text-gray-600">載入行程中...</p>
      </div>
    </div>

    <div
      v-else-if="itineraryStore.error"
      class="flex min-h-screen items-center justify-center px-4"
    >
      <div class="max-w-md rounded-lg border border-red-300 bg-red-50 p-6 text-center">
        <svg
          class="mx-auto h-12 w-12 text-red-500"
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
        <h3 class="mt-4 text-lg font-semibold text-red-800">載入失敗</h3>
        <p class="mt-2 text-sm text-red-700">{{ itineraryStore.error }}</p>
        <button
          @click="handleRetry"
          class="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
        >
          重試
        </button>
      </div>
    </div>

    <div
      v-else-if="itineraryStore.availableDates.length === 0"
      class="flex min-h-screen items-center justify-center px-4"
    >
      <div class="text-center">
        <svg
          class="mx-auto h-16 w-16 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 class="mt-4 text-lg font-semibold text-gray-900">尚無行程資料</h3>
        <p class="mt-2 text-sm text-gray-600">請檢查 Google Sheet 是否已設定行程內容</p>
      </div>
    </div>

    <div
      v-else
      class="mx-auto max-w-4xl px-4 py-6"
      @touchstart="handleTouchStart"
      @touchend="handleTouchEnd"
    >
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">旅遊行程</h1>
        <button
          @click="handleLogout"
          class="rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
        >
          登出
        </button>
      </div>

      <div class="mb-6 flex items-center justify-between gap-4 rounded-lg bg-white p-4 shadow">
        <button
          @click="handlePreviousDay"
          :disabled="!canGoPrevious"
          class="rounded-lg bg-primary-500 p-2 text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <svg
            class="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <div class="flex-1 text-center">
          <p class="text-sm text-gray-600">{{ formatDateDisplay(itineraryStore.currentDate) }}</p>
          <p class="text-xs text-gray-500 mt-1">
            第 {{ currentDayIndex + 1 }} 天，共 {{ itineraryStore.availableDates.length }} 天
          </p>
        </div>

        <button
          @click="handleNextDay"
          :disabled="!canGoNext"
          class="rounded-lg bg-primary-500 p-2 text-white hover:bg-primary-600 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          <svg
            class="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div class="mb-4 rounded-lg bg-white p-4 shadow">
        <SearchBar
          v-model="itineraryStore.searchQuery"
          placeholder="搜尋標題、地點、標籤..."
          @search="handleSearch"
        />
      </div>

      <div class="mb-4 rounded-lg bg-white p-4 shadow">
        <div class="mb-3 flex items-center justify-between">
          <p class="text-sm font-medium text-gray-700">分類過濾</p>
          <button
            v-if="itineraryStore.selectedCategories.length > 0"
            @click="handleClearCategoryFilter"
            class="text-xs text-primary-600 hover:text-primary-700 underline"
          >
            清除
          </button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="category in categories"
            :key="category"
            @click="handleToggleCategory(category)"
            :class="[
              'rounded-full px-3 py-1 text-sm font-medium transition-colors',
              itineraryStore.selectedCategories.includes(category)
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
            ]"
          >
            {{ category }}
          </button>
        </div>
      </div>

      <div class="mb-4 rounded-lg bg-white p-4 shadow">
        <div class="flex items-center justify-between text-sm text-gray-600">
          <span>完成進度：{{ itineraryStore.completionPercentage }}%</span>
          <span>總花費：{{ formatCurrency(itineraryStore.totalCost) }}</span>
        </div>
        <div class="mt-2 h-2 w-full rounded-full bg-gray-200">
          <div
            class="h-2 rounded-full bg-green-500 transition-all"
            :style="{ width: `${itineraryStore.completionPercentage}%` }"
          ></div>
        </div>
      </div>

      <div class="space-y-4">
        <ItineraryItemCard
          v-for="item in itineraryStore.filteredItems"
          :key="item.id"
          :id="`item-${item.id}`"
          :item="item"
          @toggle-complete="handleToggleComplete"
          @open-map="handleOpenMap"
          @show-toast="showToast"
        />
      </div>

      <!-- Toast 通知 -->
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0 translate-y-4"
        enter-to-class="opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100 translate-y-0"
        leave-to-class="opacity-0 translate-y-4"
      >
        <div
          v-if="toastVisible"
          class="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-lg bg-gray-800 px-4 py-2 text-white shadow-lg"
        >
          {{ toastMessage }}
        </div>
      </Transition>

      <div
        v-if="itineraryStore.filteredItems.length === 0"
        class="rounded-lg bg-white p-8 text-center shadow"
      >
        <p class="text-gray-600">
          {{
            itineraryStore.searchQuery || itineraryStore.selectedCategories.length > 0
              ? '沒有符合條件的行程項目'
              : '此日期無行程項目'
          }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, nextTick, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useItineraryStore } from '@/stores/itinerary'
import { useAuthStore } from '@/stores/auth'
import type { ItineraryItem } from '@/types/itinerary'
import ItineraryItemCard from '@/components/itinerary/ItineraryItemCard.vue'
import SearchBar from '@/components/itinerary/SearchBar.vue'
import { getQueryParam, generateSlug } from '@/utils/deepLinkHelper'

const router = useRouter()
const itineraryStore = useItineraryStore()
const authStore = useAuthStore()

// Toast 狀態
const toastVisible = ref(false)
const toastMessage = ref('')
let toastTimer: number | null = null

const categories = ['景點', '餐廳', '交通', '住宿']

const currentDayIndex = computed(() => {
  return itineraryStore.availableDates.indexOf(itineraryStore.currentDate || '')
})

const canGoPrevious = computed(() => currentDayIndex.value > 0)
const canGoNext = computed(() => currentDayIndex.value < itineraryStore.availableDates.length - 1)

function formatDateDisplay(date: string | null): string {
  if (!date) return ''
  const d = new Date(date)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  return `${date} (${weekdays[d.getDay()]})`
}

function formatCurrency(amount: number): string {
  return `NT$ ${amount.toLocaleString()}`
}

function handlePreviousDay() {
  itineraryStore.previousDay()
}

function handleNextDay() {
  itineraryStore.nextDay()
}

function handleToggleComplete(itemId: string, completed: boolean) {
  itineraryStore.toggleComplete(itemId, completed)
}

function handleOpenMap(mapLink: string) {
  // 檢測是否為移動裝置
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (isMobile) {
    // 移動裝置：嘗試開啟原生 Google Maps App
    // 如果有安裝 Google Maps App，會自動開啟
    // 如果沒有，會 fallback 到瀏覽器版本
    const googleMapsAppLink = mapLink.replace(
      'https://www.google.com/maps',
      'https://maps.google.com'
    )
    window.location.href = googleMapsAppLink
  } else {
    // 桌面裝置：在新分頁開啟
    window.open(mapLink, '_blank', 'noopener,noreferrer')
  }
}

async function handleRetry() {
  const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
  if (sheetId) {
    await itineraryStore.loadItinerary(sheetId, 0)
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/')
}

function handleSearch(query: string) {
  itineraryStore.setSearchQuery(query)
}

function handleToggleCategory(category: string) {
  itineraryStore.toggleCategory(category)
}

function handleClearCategoryFilter() {
  itineraryStore.clearCategoryFilter()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    handlePreviousDay()
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    handleNextDay()
  }
}

let touchStartX = 0
let touchEndX = 0

function handleTouchStart(event: TouchEvent) {
  touchStartX = event.changedTouches[0].screenX
}

function handleTouchEnd(event: TouchEvent) {
  touchEndX = event.changedTouches[0].screenX
  handleSwipe()
}

function handleSwipe() {
  const swipeThreshold = 50
  const diff = touchStartX - touchEndX

  if (Math.abs(diff) > swipeThreshold) {
    if (diff > 0) {
      // 向左滑動 - 下一天
      handleNextDay()
    } else {
      // 向右滑動 - 上一天
      handlePreviousDay()
    }
  }
}

onMounted(async () => {
  itineraryStore.restoreCompletionState()

  const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
  if (!sheetId) {
    itineraryStore.error = '未設定 Google Sheet ID，請檢查 .env 設定'
    return
  }

  try {
    await itineraryStore.loadItinerary(sheetId, 0)

    // 處理深連結：檢查 URL 參數
    await handleDeepLink()
  } catch (error) {
    console.error('載入行程失敗：', error)
  }

  // 新增鍵盤導航支援
  window.addEventListener('keydown', handleKeydown)
})

/**
 * 處理深連結邏輯
 * 檢查 URL 參數 ?date 和 ?item，自動切換日期和捲動到指定項目
 */
async function handleDeepLink() {
  const dateParam = getQueryParam('date')
  const itemParam = getQueryParam('item')

  // 如果有日期參數，切換到指定日期
  if (dateParam && itineraryStore.availableDates.includes(dateParam)) {
    itineraryStore.switchDate(dateParam)
  }

  // 如果有項目參數，找到該項目並捲動到該位置
  if (itemParam) {
    await nextTick()

    // 在所有日期中尋找匹配的項目
    for (const [date, items] of Object.entries(itineraryStore.days)) {
      const matchedItem = items.items.find(
        (item: ItineraryItem) => generateSlug(item.title) === itemParam
      )

      if (matchedItem) {
        // 切換到該項目的日期
        itineraryStore.switchDate(date)
        await nextTick()

        // 捲動到該項目（使用項目的 id 作為 DOM 元素的 id）
        const element = document.getElementById(`item-${matchedItem.id}`)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          // 加上短暫的高亮效果
          element.classList.add('ring-2', 'ring-primary-500', 'ring-offset-2')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-primary-500', 'ring-offset-2')
          }, 2000)
        }
        break
      }
    }
  }
}

function showToast(message: string) {
  toastMessage.value = message
  toastVisible.value = true

  if (toastTimer !== null) {
    clearTimeout(toastTimer)
  }

  toastTimer = window.setTimeout(() => {
    toastVisible.value = false
  }, 3000)
}

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  if (toastTimer !== null) {
    clearTimeout(toastTimer)
  }
})
</script>
