/**
 * Google Sheet CSV 解析工具
 * 使用 PapaParse 5.x 解析 CSV 資料
 */

import Papa from 'papaparse'
import { v4 as uuidv4 } from 'uuid'
import type { AuthConfig, AuthItem } from '@/types/auth'
import type { ItineraryItem } from '@/types/itinerary'
import type { InfoItem } from '@/types/travelInfo'
import type { ShoppingItem } from '@/types/shopping'
import { GoogleSheetError, ParsingError } from '@/types/common'
import { computeIsValid } from '@/types/auth'
import { computeIsToday, computeTagList } from '@/types/itinerary'
import { computeLinkList } from '@/types/travelInfo'

/**
 * 取得 Google Sheet CSV 匯出 URL
 * @param sheetId - Google Sheet ID
 * @param gid - 工作表 GID
 * @returns CSV 匯出 URL
 */
export function getGoogleSheetCSVUrl(sheetId: string, gid: number): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`
}

/**
 * 下載 Google Sheet CSV
 * @param sheetId - Google Sheet ID
 * @param gid - 工作表 GID
 * @returns CSV 字串
 * @throws GoogleSheetError 若網路失敗或 Google Sheet 不存在
 */
export async function fetchGoogleSheetCSV(sheetId: string, gid: number): Promise<string> {
  const url = getGoogleSheetCSVUrl(sheetId, gid)

  try {
    const response = await fetch(url)

    if (!response.ok) {
      throw new GoogleSheetError(
        `無法載入 Google Sheet (狀態碼: ${response.status})`,
        response.status
      )
    }

    const csvData = await response.text()

    if (!csvData || csvData.trim().length === 0) {
      throw new GoogleSheetError('Google Sheet 資料為空')
    }

    return csvData
  } catch (error) {
    if (error instanceof GoogleSheetError) {
      throw error
    }

    throw new GoogleSheetError(`網路錯誤：${(error as Error).message}`)
  }
}

/**
 * 解析 Google Sheet CSV
 * @param csvData - CSV 字串
 * @param type - 資料類型
 * @returns 解析後的資料陣列
 * @throws ParsingError 若解析失敗
 */
export function parseGoogleSheetCSV(
  csvData: string,
  type: 'itinerary' | 'travelInfo' | 'authConfig' | 'shoppingList'
): ItineraryItem[] | InfoItem[] | AuthConfig | ShoppingItem[] {
  const parseResult = Papa.parse<Record<string, string>>(csvData, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => header.trim(),
  })

  if (parseResult.errors.length > 0) {
    const firstError = parseResult.errors[0]
    throw new ParsingError(`CSV 解析錯誤：${firstError.message}`, firstError.row)
  }

  const rows = parseResult.data

  if (rows.length === 0) {
    throw new ParsingError('CSV 資料為空')
  }

  try {
    switch (type) {
      case 'itinerary':
        return parseItineraryCSV(rows)
      case 'travelInfo':
        return parseTravelInfoCSV(rows)
      case 'authConfig':
        return parseAuthConfigCSV(rows)
      case 'shoppingList':
        return parseShoppingListCSV(rows)
      default:
        throw new ParsingError(`不支援的資料類型：${type}`)
    }
  } catch (error) {
    if (error instanceof ParsingError) {
      throw error
    }
    throw new ParsingError(`解析失敗：${(error as Error).message}`)
  }
}

/**
 * 解析行程 CSV
 * @param rows - CSV 列資料
 * @returns ItineraryItem 陣列
 */
function parseItineraryCSV(rows: Record<string, string>[]): ItineraryItem[] {
  const items: ItineraryItem[] = []

  rows.forEach((row, index) => {
    const date = row['日期']?.trim()
    const title = row['標題']?.trim()

    if (!date || !title) {
      console.warn(`第 ${index + 2} 列：缺少必填欄位（日期或標題），跳過`)
      return
    }

    // 驗證日期格式 YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.warn(`第 ${index + 2} 列：日期格式錯誤（${date}），跳過`)
      return
    }

    const links = row['連結']?.trim() || undefined
    const tags = row['標籤']?.trim() || undefined

    const item: ItineraryItem = {
      id: uuidv4(),
      date,
      title,
      category: row['類別']?.trim() || undefined,
      time: row['時間']?.trim() || undefined,
      location: row['地點']?.trim() || undefined,
      mapLink: row['Google Maps']?.trim() || row['GoogleMaps']?.trim() || undefined,
      cost: row['花費'] ? parseFloat(row['花費']) : undefined,
      currency: row['幣別']?.trim() || undefined,
      description: row['說明']?.trim() || undefined,
      links,
      tags,
      notes: row['備註']?.trim() || undefined,
      cardColor: row['卡片顏色']?.trim() || undefined,
      cardBackgroundImage: row['卡片背景圖片']?.trim() || undefined,
      isCompleted: false,
      isToday: false,
      tagList: [],
      linkList: [],
    }

    // 計算屬性
    item.isToday = computeIsToday(item)
    item.tagList = computeTagList(item)
    item.linkList = links
      ? links
          .split(',')
          .map((link) => link.trim())
          .filter((link) => link.length > 0)
      : []

    items.push(item)
  })

  return items
}

/**
 * 解析旅遊資訊 CSV
 * @param rows - CSV 列資料
 * @returns InfoItem 陣列
 */
function parseTravelInfoCSV(rows: Record<string, string>[]): InfoItem[] {
  const items: InfoItem[] = []

  rows.forEach((row, index) => {
    const title = row['標題']?.trim()
    const category = row['類別']?.trim()

    if (!title) {
      console.warn(`第 ${index + 2} 列：缺少標題，跳過`)
      return
    }

    const item: InfoItem = {
      id: uuidv4(),
      title,
      category: category || '其他',
      content: row['內容']?.trim() || undefined,
      isPacked: false,
      amount: row['數量'] ? parseInt(row['數量']) : undefined,
      contactName: row['聯絡人姓名']?.trim() || undefined,
      phone: row['電話']?.trim() || undefined,
      address: row['地址']?.trim() || undefined,
      links: row['連結']?.trim() || undefined,
      notes: row['備註']?.trim() || undefined,
      linkList: [],
    }

    // 計算屬性
    item.linkList = computeLinkList(item)

    items.push(item)
  })

  return items
}

/**
 * 解析登入設定 CSV
 * @param rows - CSV 列資料
 * @returns AuthConfig
 */
function parseAuthConfigCSV(rows: Record<string, string>[]): AuthConfig {
  const items: AuthItem[] = []

  rows.forEach((row, index) => {
    const password = row['密碼']?.trim()

    if (!password) {
      console.warn(`第 ${index + 2} 列：缺少密碼，跳過`)
      return
    }

    const isSeniorModeValue = row['年長者模式']?.trim().toLowerCase()
    const isSeniorMode =
      isSeniorModeValue === 'true' ||
      isSeniorModeValue === '1' ||
      isSeniorModeValue === 'yes' ||
      isSeniorModeValue === '是'

    const item: AuthItem = {
      password,
      description: row['說明文字']?.trim() || undefined,
      expiryDate: row['有效期限']?.trim() || undefined,
      isSeniorMode: isSeniorMode || undefined,
      isValid: false,
    }

    // 計算屬性
    item.isValid = computeIsValid(item)

    items.push(item)
  })

  if (items.length === 0) {
    throw new ParsingError('登入設定中無有效密碼')
  }

  const validCount = items.filter((item) => item.isValid).length
  if (validCount === 0) {
    throw new ParsingError('所有密碼已過期')
  }

  return {
    items,
    lastUpdated: new Date(),
    version: '1.0.0',
  }
}

/**
 * 解析購買清單 CSV
 * @param rows - CSV 列資料
 * @returns ShoppingItem 陣列
 */
function parseShoppingListCSV(rows: Record<string, string>[]): ShoppingItem[] {
  const items: ShoppingItem[] = []

  rows.forEach((row, index) => {
    const id = row['id']?.trim()
    const itineraryItemId = row['itineraryItemId']?.trim()
    const itemName = row['itemName']?.trim()

    if (!id || !itineraryItemId || !itemName) {
      console.warn(`第 ${index + 2} 列：缺少必填欄位（id/itineraryItemId/itemName），跳過`)
      return
    }

    const isCompletedValue = row['isCompleted']?.trim().toLowerCase()
    const isCompleted =
      isCompletedValue === 'true' ||
      isCompletedValue === '1' ||
      isCompletedValue === 'yes' ||
      isCompletedValue === '是'

    const item: ShoppingItem = {
      id,
      itineraryItemId,
      itemName,
      quantity: row['quantity'] ? parseInt(row['quantity']) : undefined,
      unit: row['unit']?.trim() || undefined,
      estimatedCost: row['estimatedCost'] ? parseFloat(row['estimatedCost']) : undefined,
      notes: row['notes']?.trim() || undefined,
      isCompleted,
      createdBy: row['createdBy']?.trim() || 'user',
      createdAt: row['createdAt']?.trim() || new Date().toISOString(),
      lastUpdatedBy: row['lastUpdatedBy']?.trim() || undefined,
      lastUpdatedAt: row['lastUpdatedAt']?.trim() || undefined,
    }

    items.push(item)
  })

  return items
}
