/**
 * ItineraryStore - 行程資料狀態管理
 * 使用 Pinia 2.x
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ItineraryDay, ItineraryItem, CompletedItems } from '@/types/itinerary'
import { GoogleSheetError } from '@/types/common'
import { fetchGoogleSheetCSV, parseGoogleSheetCSV } from '@/utils/googleSheetParser'

/** LocalStorage key for completed items */
const COMPLETED_ITEMS_KEY = 'completedItems'

export const useItineraryStore = defineStore('itinerary', () => {
  // State
  const days = ref<Record<string, ItineraryDay>>({})
  const currentDate = ref<string | null>(null)
  const searchQuery = ref('')
  const completedItems = ref<CompletedItems>({})
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const currentDayItems = computed(() => {
    if (!currentDate.value || !days.value[currentDate.value]) {
      return []
    }
    return days.value[currentDate.value].items
  })

  const availableDates = computed(() => {
    return Object.keys(days.value).sort()
  })

  const filteredItems = computed(() => {
    let items = currentDayItems.value

    // 搜尋過濾
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase()
      items = items.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.location?.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags?.toLowerCase().includes(query)
      )
    }

    return items
  })

  const tagStatistics = computed(() => {
    const tagCounts: Record<string, number> = {}

    Object.values(days.value).forEach((day) => {
      day.items.forEach((item) => {
        item.tagList.forEach((tag) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })
    })

    return Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
  })

  const totalCost = computed(() => {
    if (!currentDate.value || !days.value[currentDate.value]) {
      return 0
    }
    return days.value[currentDate.value].totalCost
  })

  const completionPercentage = computed(() => {
    const items = currentDayItems.value
    if (items.length === 0) return 0

    const completedCount = items.filter((item) => item.isCompleted).length
    return Math.round((completedCount / items.length) * 100)
  })

  // Actions
  async function loadItinerary(sheetId: string, gid: number = 0): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const csvData = await fetchGoogleSheetCSV(sheetId, gid)
      const items = parseGoogleSheetCSV(csvData, 'itinerary') as ItineraryItem[]

      if (items.length === 0) {
        throw new GoogleSheetError('行程資料為空')
      }

      // 依日期分組
      const groupedByDate: Record<string, ItineraryItem[]> = {}
      items.forEach((item) => {
        if (!groupedByDate[item.date]) {
          groupedByDate[item.date] = []
        }
        // 套用完成狀態
        item.isCompleted = completedItems.value[item.id] || false
        groupedByDate[item.date].push(item)
      })

      // 建立 ItineraryDay 物件
      const newDays: Record<string, ItineraryDay> = {}
      Object.keys(groupedByDate)
        .sort()
        .forEach((date) => {
          const dayItems = groupedByDate[date]
          newDays[date] = {
            date,
            items: dayItems,
            notes: undefined,
            totalCost: dayItems.reduce((sum, item) => sum + (item.cost || 0), 0),
            completedCount: dayItems.filter((item) => item.isCompleted).length,
          }
        })

      days.value = newDays

      // 設定當前日期為第一天
      const dates = Object.keys(newDays).sort()
      if (dates.length > 0) {
        currentDate.value = dates[0]
      }
    } catch (err) {
      if (err instanceof GoogleSheetError) {
        error.value = err.message
        throw err
      }
      error.value = '無法載入行程資料，請檢查網路連線或 Google Sheet 設定'
      throw new GoogleSheetError(error.value)
    } finally {
      loading.value = false
    }
  }

  function switchDate(date: string): void {
    if (days.value[date]) {
      currentDate.value = date
    }
  }

  function previousDay(): boolean {
    const dates = availableDates.value
    const currentIndex = dates.indexOf(currentDate.value || '')

    if (currentIndex > 0) {
      currentDate.value = dates[currentIndex - 1]
      return true
    }
    return false
  }

  function nextDay(): boolean {
    const dates = availableDates.value
    const currentIndex = dates.indexOf(currentDate.value || '')

    if (currentIndex >= 0 && currentIndex < dates.length - 1) {
      currentDate.value = dates[currentIndex + 1]
      return true
    }
    return false
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  function toggleComplete(itemId: string, completed: boolean): void {
    completedItems.value[itemId] = completed

    // 更新 LocalStorage
    try {
      localStorage.setItem(COMPLETED_ITEMS_KEY, JSON.stringify(completedItems.value))
    } catch (err) {
      console.error('儲存完成狀態失敗：', err)
    }

    // 更新對應的 item
    Object.values(days.value).forEach((day) => {
      const item = day.items.find((i) => i.id === itemId)
      if (item) {
        item.isCompleted = completed
        // 更新 day 的 completedCount
        day.completedCount = day.items.filter((i) => i.isCompleted).length
      }
    })
  }

  function clearCompletionState(): void {
    completedItems.value = {}
    try {
      localStorage.removeItem(COMPLETED_ITEMS_KEY)
    } catch (err) {
      console.error('清除完成狀態失敗：', err)
    }

    // 更新所有 items
    Object.values(days.value).forEach((day) => {
      day.items.forEach((item) => {
        item.isCompleted = false
      })
      day.completedCount = 0
    })
  }

  function restoreCompletionState(): void {
    try {
      const stored = localStorage.getItem(COMPLETED_ITEMS_KEY)
      if (stored) {
        completedItems.value = JSON.parse(stored)
      }
    } catch (err) {
      console.error('還原完成狀態失敗：', err)
      completedItems.value = {}
    }
  }

  return {
    // State
    days,
    currentDate,
    searchQuery,
    completedItems,
    loading,
    error,
    // Getters
    currentDayItems,
    availableDates,
    filteredItems,
    tagStatistics,
    totalCost,
    completionPercentage,
    // Actions
    loadItinerary,
    switchDate,
    previousDay,
    nextDay,
    setSearchQuery,
    toggleComplete,
    clearCompletionState,
    restoreCompletionState,
  }
})
