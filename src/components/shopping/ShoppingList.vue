<template>
  <div class="shopping-list border-t pt-4 mt-4">
    <!-- 同步狀態列 -->
    <div
      v-if="shoppingStore.isSyncing || shoppingStore.hasPendingSync || shoppingStore.error"
      class="mb-3 rounded-lg p-3 text-sm"
      :class="{
        'bg-blue-50 text-blue-800': shoppingStore.isSyncing,
        'bg-yellow-50 text-yellow-800': shoppingStore.hasPendingSync && !shoppingStore.isSyncing,
        'bg-red-50 text-red-800': shoppingStore.error,
      }"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <!-- 同步中圖示 -->
          <svg
            v-if="shoppingStore.isSyncing"
            class="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <!-- 警告圖示 -->
          <svg
            v-else-if="shoppingStore.hasPendingSync"
            class="h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <!-- 錯誤圖示 -->
          <svg
            v-else-if="shoppingStore.error"
            class="h-4 w-4"
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

          <!-- 狀態文字 -->
          <span v-if="shoppingStore.isSyncing">同步中...</span>
          <span v-else-if="shoppingStore.error">{{ shoppingStore.error }}</span>
          <span v-else-if="shoppingStore.hasPendingSync">
            有 {{ shoppingStore.syncQueueSize }} 項變更等待同步
          </span>
        </div>

        <!-- 重試按鈕 -->
        <button
          v-if="shoppingStore.error || shoppingStore.hasPendingSync"
          @click="handleRetrySync"
          class="px-3 py-1 rounded bg-white border border-current hover:bg-opacity-50 transition-colors"
        >
          {{ shoppingStore.error ? '重試' : '立即同步' }}
        </button>
      </div>

      <!-- 最後同步時間 -->
      <div
        v-if="shoppingStore.lastSyncTime && !shoppingStore.error"
        class="mt-1 text-xs opacity-75"
      >
        最後同步：{{ formatSyncTime(shoppingStore.lastSyncTime) }}
      </div>
    </div>

    <div class="flex items-center justify-between mb-3">
      <h4 class="text-md font-semibold text-gray-900 flex items-center gap-2">
        🛒 購買清單
        <span v-if="shoppingList.items.length > 0" class="text-sm font-normal text-gray-600">
          ({{ shoppingList.completedCount }}/{{ shoppingList.items.length }})
        </span>
      </h4>
      <button
        v-if="shoppingList.items.length > 0"
        @click="toggleShowCompleted"
        class="text-sm text-primary-600 hover:text-primary-700"
      >
        {{ showCompleted ? '隱藏已完成' : '顯示全部' }}
      </button>
    </div>

    <!-- 新增項目表單 -->
    <div class="mb-3">
      <div class="flex gap-2">
        <input
          v-model="newItemName"
          type="text"
          placeholder="新增購買項目..."
          class="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          @keyup.enter="handleAddItem"
        />
        <button
          @click="handleAddItem"
          :disabled="!newItemName.trim()"
          class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          新增
        </button>
      </div>

      <!-- 展開詳細輸入 -->
      <div v-if="showDetailedForm" class="mt-2 space-y-2 p-3 bg-gray-50 rounded-lg">
        <input
          v-model="newItemNote"
          type="text"
          placeholder="備註（選填）"
          class="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
        <div class="flex gap-2">
          <input
            v-model.number="newItemQuantity"
            type="number"
            min="1"
            placeholder="數量"
            class="w-20 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <input
            v-model.number="newItemAmount"
            type="number"
            min="0"
            placeholder="預估金額"
            class="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
          <select
            v-model="newItemCurrency"
            class="w-24 rounded border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
          >
            <option value="TWD">TWD</option>
            <option value="JPY">JPY</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
        </div>
        <button @click="showDetailedForm = false" class="text-sm text-gray-600 hover:text-gray-800">
          收起
        </button>
      </div>
      <button
        v-else
        @click="showDetailedForm = true"
        class="mt-2 text-sm text-gray-600 hover:text-gray-800"
      >
        + 新增詳細資訊
      </button>
    </div>

    <!-- 購買項目列表 -->
    <div v-if="displayedItems.length > 0" class="space-y-2">
      <div
        v-for="item in displayedItems"
        :key="item.id"
        :class="[
          'flex items-start gap-2 p-2 rounded border transition-all',
          item.isCompleted ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200',
        ]"
      >
        <input
          type="checkbox"
          :checked="item.isCompleted"
          @change="handleToggleComplete(item.id)"
          class="mt-1 h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500 cursor-pointer"
        />
        <div class="flex-1 min-w-0 cursor-pointer" @click="handleToggleComplete(item.id)">
          <div
            :class="[
              'text-sm font-medium',
              item.isCompleted ? 'line-through text-gray-500' : 'text-gray-900',
            ]"
          >
            {{ item.itemName }}
            <span v-if="item.quantity" class="text-gray-600">
              ×{{ item.quantity }}{{ item.unit ? ' ' + item.unit : '' }}
            </span>
          </div>
          <div v-if="item.notes" class="text-xs text-gray-600 mt-1">{{ item.notes }}</div>
          <div v-if="item.estimatedCost" class="text-xs text-gray-600 mt-1">
            TWD {{ item.estimatedCost.toLocaleString() }}
          </div>
          <div v-if="item.lastUpdatedBy || item.lastUpdatedAt" class="text-xs text-gray-500 mt-1">
            <span v-if="item.lastUpdatedBy">{{ item.lastUpdatedBy }}</span>
            <span v-if="item.lastUpdatedAt"> • {{ formatTime(item.lastUpdatedAt) }}</span>
          </div>
        </div>
        <button
          @click="handleDeleteItem(item.id)"
          class="text-gray-400 hover:text-red-600 transition-colors p-1"
          title="刪除項目"
        >
          <svg
            class="h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- 空狀態 -->
    <div v-else-if="shoppingList.items.length === 0" class="text-center py-4 text-gray-500 text-sm">
      尚無購買項目
    </div>
    <div v-else class="text-center py-4 text-gray-500 text-sm">所有項目已完成 ✓</div>

    <!-- 總金額 -->
    <div
      v-if="shoppingList.totalEstimatedAmount > 0"
      class="mt-3 pt-3 border-t flex justify-between items-center"
    >
      <span class="text-sm font-medium text-gray-700">預估總金額</span>
      <span class="text-sm font-semibold text-primary-600">
        TWD {{ shoppingList.totalEstimatedAmount.toLocaleString() }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useShoppingStore } from '@/stores/shopping'
import type { ShoppingList } from '@/types/shopping'

interface Props {
  itineraryItemId: string
  currentUser?: string
}

const props = defineProps<Props>()

const shoppingStore = useShoppingStore()

// 新增項目表單狀態
const newItemName = ref('')
const newItemNote = ref('')
const newItemQuantity = ref<number>()
const newItemAmount = ref<number>()
const newItemCurrency = ref('TWD')
const showDetailedForm = ref(false)

// 顯示設定
const showCompleted = ref(true)

// 計算屬性
const shoppingList = computed<ShoppingList>(() => {
  return shoppingStore.getShoppingList(props.itineraryItemId)
})

const displayedItems = computed(() => {
  if (showCompleted.value) {
    return shoppingList.value.items
  }
  return shoppingList.value.items.filter((item) => !item.isCompleted)
})

// 方法
function handleAddItem() {
  if (!newItemName.value.trim()) return

  shoppingStore.addItem(props.itineraryItemId, newItemName.value, {
    notes: newItemNote.value || undefined,
    quantity: newItemQuantity.value,
    estimatedCost: newItemAmount.value,
    createdBy: props.currentUser,
  })

  // 重置表單
  newItemName.value = ''
  newItemNote.value = ''
  newItemQuantity.value = undefined
  newItemAmount.value = undefined
  newItemCurrency.value = 'TWD'
  showDetailedForm.value = false
}

function handleToggleComplete(itemId: string) {
  shoppingStore.toggleItemComplete(itemId, props.currentUser)
}

function handleDeleteItem(itemId: string) {
  if (confirm('確定要刪除此購買項目嗎？')) {
    shoppingStore.deleteItem(itemId)
  }
}

function toggleShowCompleted() {
  showCompleted.value = !showCompleted.value
}

function handleRetrySync() {
  shoppingStore.syncOfflineChanges()
}

function formatTime(date: string): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小時前`
  if (minutes > 0) return `${minutes}分鐘前`
  return '剛剛'
}

function formatSyncTime(date: Date): string {
  return formatTime(date.toISOString())
}
</script>
