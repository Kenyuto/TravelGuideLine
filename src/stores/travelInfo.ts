/**
 * TravelInfo Store
 * 管理旅遊資訊狀態（住宿、交通票券、打包清單、緊急聯絡等）
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { InfoItem } from '@/types/travelInfo'
import { fetchGoogleSheetCSV, parseGoogleSheetCSV } from '@/utils/googleSheetParser'
import { GoogleSheetError } from '@/types/common'

export const useTravelInfoStore = defineStore('travelInfo', () => {
  // State
  const items = ref<InfoItem[]>([])
  const selectedCategory = ref<string | null>(null)
  const packedItems = ref<Set<string>>(new Set())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const categories = computed<string[]>(() => {
    const uniqueCategories = new Set(items.value.map((item) => item.category).filter(Boolean))
    return Array.from(uniqueCategories).sort()
  })

  const filteredItems = computed<InfoItem[]>(() => {
    if (!selectedCategory.value) {
      return items.value
    }
    return items.value.filter((item) => item.category === selectedCategory.value)
  })

  const itemsByCategory = computed<Record<string, InfoItem[]>>(() => {
    const grouped: Record<string, InfoItem[]> = {}
    items.value.forEach((item) => {
      const category = item.category || '其他'
      if (!grouped[category]) {
        grouped[category] = []
      }
      grouped[category].push(item)
    })
    return grouped
  })

  const packingList = computed<InfoItem[]>(() => {
    return items.value.filter((item) => item.category === '打包清單')
  })

  const packingProgress = computed<number>(() => {
    const total = packingList.value.length
    if (total === 0) return 0
    const packed = packingList.value.filter((item) => item.isPacked).length
    return Math.round((packed / total) * 100)
  })

  // Actions
  async function loadTravelInfo(sheetId: string, gid: number = 2053866883): Promise<void> {
    loading.value = true
    error.value = null

    try {
      const csvData = await fetchGoogleSheetCSV(sheetId, gid)
      const travelInfo = parseGoogleSheetCSV(csvData, 'travelInfo') as InfoItem[]

      if (!travelInfo || travelInfo.length === 0) {
        console.warn('旅遊資訊為空，顯示空狀態')
      }

      items.value = travelInfo
      restorePackingState()
    } catch (err) {
      if (err instanceof GoogleSheetError) {
        error.value = `無法載入旅遊資訊：${err.message}`
      } else {
        error.value = `載入失敗：${(err as Error).message}`
      }
      throw err
    } finally {
      loading.value = false
    }
  }

  function filterByCategory(category: string | null): void {
    selectedCategory.value = category
  }

  function togglePacked(itemId: string): void {
    const item = items.value.find((i) => i.id === itemId)
    if (!item) return

    item.isPacked = !item.isPacked

    if (item.isPacked) {
      packedItems.value.add(itemId)
    } else {
      packedItems.value.delete(itemId)
    }

    savePackingState()
  }

  function clearPackingState(): void {
    packedItems.value.clear()
    items.value.forEach((item) => {
      item.isPacked = false
    })
    localStorage.removeItem('packedItems')
  }

  function restorePackingState(): void {
    try {
      const saved = localStorage.getItem('packedItems')
      if (!saved) return

      const savedIds: string[] = JSON.parse(saved)
      packedItems.value = new Set(savedIds)

      items.value.forEach((item) => {
        item.isPacked = packedItems.value.has(item.id)
      })
    } catch (err) {
      console.error('還原打包狀態失敗：', err)
    }
  }

  function savePackingState(): void {
    try {
      const packedIds = Array.from(packedItems.value)
      localStorage.setItem('packedItems', JSON.stringify(packedIds))
    } catch (err) {
      console.error('儲存打包狀態失敗：', err)
    }
  }

  return {
    // State
    items,
    selectedCategory,
    packedItems,
    loading,
    error,
    // Getters
    categories,
    filteredItems,
    itemsByCategory,
    packingList,
    packingProgress,
    // Actions
    loadTravelInfo,
    filterByCategory,
    togglePacked,
    clearPackingState,
    restorePackingState,
  }
})
