/**
 * ShoppingStore - 購買清單狀態管理
 * 使用 Pinia 2.x
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import type { ShoppingList, ShoppingItem, ShoppingListState } from '@/types/shopping'
import {
  computeTotalEstimatedAmount,
  computeCompletedCount,
  createEmptyShoppingList,
} from '@/types/shopping'

const STORAGE_KEY = 'travelguideline_shopping_lists'

export const useShoppingStore = defineStore('shopping', () => {
  // State
  const shoppingLists = ref<Map<string, ShoppingList>>(new Map())
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getShoppingList = computed(() => {
    return (itineraryItemId: string): ShoppingList => {
      if (!shoppingLists.value.has(itineraryItemId)) {
        return createEmptyShoppingList(itineraryItemId)
      }
      return shoppingLists.value.get(itineraryItemId)!
    }
  })

  const getAllShoppingLists = computed(() => {
    return Array.from(shoppingLists.value.values())
  })

  // Actions
  function loadFromStorage(): void {
    try {
      const data = localStorage.getItem(STORAGE_KEY)
      if (!data) return

      const state: ShoppingListState = JSON.parse(data)
      const loadedLists = new Map<string, ShoppingList>()

      Object.entries(state).forEach(([itineraryItemId, items]) => {
        // 轉換日期字串回 Date 物件
        const parsedItems = items.map((item) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          lastUpdatedAt: new Date(item.lastUpdatedAt),
        }))

        loadedLists.set(itineraryItemId, {
          itineraryItemId,
          items: parsedItems,
          totalEstimatedAmount: computeTotalEstimatedAmount(parsedItems),
          completedCount: computeCompletedCount(parsedItems),
        })
      })

      shoppingLists.value = loadedLists
    } catch (err) {
      console.error('Failed to load shopping lists from storage:', err)
      error.value = '無法載入購買清單'
    }
  }

  function saveToStorage(): void {
    try {
      const state: ShoppingListState = {}
      shoppingLists.value.forEach((list, itineraryItemId) => {
        state[itineraryItemId] = list.items
      })
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
      console.error('Failed to save shopping lists to storage:', err)
      error.value = '無法儲存購買清單'
    }
  }

  function addItem(
    itineraryItemId: string,
    name: string,
    options?: {
      note?: string
      quantity?: number
      estimatedAmount?: number
      currency?: string
      createdBy?: string
    }
  ): ShoppingItem {
    const now = new Date()
    const newItem: ShoppingItem = {
      id: uuidv4(),
      itineraryItemId,
      name: name.trim(),
      isCompleted: false,
      note: options?.note?.trim(),
      quantity: options?.quantity,
      estimatedAmount: options?.estimatedAmount,
      currency: options?.currency || 'TWD',
      createdBy: options?.createdBy,
      createdAt: now,
      lastUpdatedBy: options?.createdBy,
      lastUpdatedAt: now,
    }

    let list = shoppingLists.value.get(itineraryItemId)
    if (!list) {
      list = createEmptyShoppingList(itineraryItemId)
      shoppingLists.value.set(itineraryItemId, list)
    }

    list.items.push(newItem)
    list.totalEstimatedAmount = computeTotalEstimatedAmount(list.items)
    list.completedCount = computeCompletedCount(list.items)

    saveToStorage()
    return newItem
  }

  function updateItem(
    itemId: string,
    updates: Partial<Omit<ShoppingItem, 'id' | 'itineraryItemId' | 'createdAt' | 'createdBy'>>,
    updatedBy?: string
  ): boolean {
    for (const list of shoppingLists.value.values()) {
      const itemIndex = list.items.findIndex((item) => item.id === itemId)
      if (itemIndex !== -1) {
        const item = list.items[itemIndex]
        Object.assign(item, updates, {
          lastUpdatedBy: updatedBy,
          lastUpdatedAt: new Date(),
        })

        list.totalEstimatedAmount = computeTotalEstimatedAmount(list.items)
        list.completedCount = computeCompletedCount(list.items)

        saveToStorage()
        return true
      }
    }
    return false
  }

  function toggleItemComplete(itemId: string, updatedBy?: string): boolean {
    for (const list of shoppingLists.value.values()) {
      const item = list.items.find((i) => i.id === itemId)
      if (item) {
        item.isCompleted = !item.isCompleted
        item.lastUpdatedBy = updatedBy
        item.lastUpdatedAt = new Date()

        list.completedCount = computeCompletedCount(list.items)

        saveToStorage()
        return true
      }
    }
    return false
  }

  function deleteItem(itemId: string): boolean {
    for (const list of shoppingLists.value.values()) {
      const itemIndex = list.items.findIndex((item) => item.id === itemId)
      if (itemIndex !== -1) {
        list.items.splice(itemIndex, 1)
        list.totalEstimatedAmount = computeTotalEstimatedAmount(list.items)
        list.completedCount = computeCompletedCount(list.items)

        saveToStorage()
        return true
      }
    }
    return false
  }

  function clearList(itineraryItemId: string): void {
    shoppingLists.value.delete(itineraryItemId)
    saveToStorage()
  }

  function clearAllLists(): void {
    shoppingLists.value.clear()
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    // State
    shoppingLists,
    loading,
    error,
    // Getters
    getShoppingList,
    getAllShoppingLists,
    // Actions
    loadFromStorage,
    saveToStorage,
    addItem,
    updateItem,
    toggleItemComplete,
    deleteItem,
    clearList,
    clearAllLists,
  }
})
