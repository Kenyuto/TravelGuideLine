<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <!-- Header -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="container mx-auto px-4 py-4">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">旅遊資訊</h1>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Loading State -->
      <div v-if="travelInfoStore.loading" class="flex justify-center items-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span class="ml-3 text-gray-600 dark:text-gray-400">載入中...</span>
      </div>

      <!-- Error State -->
      <div
        v-else-if="travelInfoStore.error"
        class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6"
      >
        <p class="text-red-800 dark:text-red-200">{{ travelInfoStore.error }}</p>
        <button
          @click="handleRetry"
          class="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          重試
        </button>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- Packing Progress (Only show if has packing list) -->
        <div
          v-if="travelInfoStore.packingList.length > 0"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6"
        >
          <div class="flex justify-between items-center mb-2">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">打包進度</h2>
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ travelInfoStore.packingProgress }}%
            </span>
          </div>
          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div
              class="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              :style="{ width: `${travelInfoStore.packingProgress}%` }"
            ></div>
          </div>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-2">
            已打包 {{ travelInfoStore.packingList.filter((i) => i.isPacked).length }} /
            {{ travelInfoStore.packingList.length }} 項
          </p>
        </div>

        <!-- Category Filter -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <h2 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">分類篩選</h2>
          <div class="flex flex-wrap gap-2">
            <button
              @click="travelInfoStore.filterByCategory(null)"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                travelInfoStore.selectedCategory === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
              ]"
            >
              全部 ({{ travelInfoStore.items.length }})
            </button>
            <button
              v-for="category in travelInfoStore.categories"
              :key="category"
              @click="travelInfoStore.filterByCategory(category)"
              :class="[
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                travelInfoStore.selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
              ]"
            >
              {{ category }} ({{ travelInfoStore.itemsByCategory[category]?.length || 0 }})
            </button>
          </div>
        </div>

        <!-- Info Cards List -->
        <div v-if="travelInfoStore.filteredItems.length > 0" class="space-y-4">
          <TravelInfoCard
            v-for="item in travelInfoStore.filteredItems"
            :key="item.id"
            :item="item"
            :show-packing-checkbox="item.category === '打包清單'"
            @toggle-packed="travelInfoStore.togglePacked(item.id)"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
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
          <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">尚無旅遊資訊</h3>
          <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
            請在 Google Sheet「旅遊資訊」工作表中新增資料
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useTravelInfoStore } from '@/stores/travelInfo'
import TravelInfoCard from '@/components/travelInfo/TravelInfoCard.vue'

const travelInfoStore = useTravelInfoStore()

onMounted(async () => {
  const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
  if (!sheetId) {
    travelInfoStore.error = '未設定 Google Sheet ID'
    return
  }

  try {
    await travelInfoStore.loadTravelInfo(sheetId)
  } catch (error) {
    console.error('載入旅遊資訊失敗：', error)
  }
})

async function handleRetry() {
  const sheetId = import.meta.env.VITE_GOOGLE_SHEET_ID
  if (sheetId) {
    await travelInfoStore.loadTravelInfo(sheetId)
  }
}
</script>
