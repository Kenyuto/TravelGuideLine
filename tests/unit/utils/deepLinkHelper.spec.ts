import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getQueryParam,
  setQueryParams,
  generateDeepLink,
  clearQueryParams,
  parseDeepLinkParams,
  generateSlug,
} from '@/utils/deepLinkHelper'

describe('deepLinkHelper', () => {
  describe('getQueryParam', () => {
    beforeEach(() => {
      // Reset URL before each test
      window.history.pushState({}, '', '/')
    })

    it('should return null when parameter does not exist', () => {
      const result = getQueryParam('nonexistent')
      expect(result).toBeNull()
    })

    it('should return parameter value when it exists', () => {
      window.history.pushState({}, '', '/?date=2025-01-15')
      const result = getQueryParam('date')
      expect(result).toBe('2025-01-15')
    })

    it('should return first value when multiple values exist', () => {
      window.history.pushState({}, '', '/?date=2025-01-15&date=2025-01-16')
      const result = getQueryParam('date')
      expect(result).toBe('2025-01-15')
    })

    it('should handle URL-encoded values', () => {
      window.history.pushState({}, '', '/?item=tokyo%20skytree')
      const result = getQueryParam('item')
      expect(result).toBe('tokyo skytree')
    })

    it('should work with hash mode URLs (query params are in search, not hash)', () => {
      // In Vue Router hash mode, query params are still in search, not in hash
      window.history.pushState({}, '', '/?date=2025-01-15#/itinerary')
      const result = getQueryParam('date')
      expect(result).toBe('2025-01-15')
    })
  })

  describe('setQueryParams', () => {
    beforeEach(() => {
      window.history.pushState({}, '', '/')
    })

    afterEach(() => {
      window.history.pushState({}, '', '/')
    })

    it('should add query parameters without page reload', () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState')

      setQueryParams({ date: '2025-01-15' })

      expect(pushStateSpy).toHaveBeenCalled()
      expect(window.location.search).toContain('date=2025-01-15')
    })

    it('should replace existing parameters when replace is true', () => {
      window.history.pushState({}, '', '/?old=value')
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState')

      setQueryParams({ date: '2025-01-15' }, true)

      expect(replaceStateSpy).toHaveBeenCalled()
      expect(window.location.search).toContain('date=2025-01-15')
    })

    it('should handle multiple parameters', () => {
      setQueryParams({ date: '2025-01-15', item: 'tokyo-skytree' })

      expect(window.location.search).toContain('date=2025-01-15')
      expect(window.location.search).toContain('item=tokyo-skytree')
    })

    it('should URL-encode parameter values', () => {
      setQueryParams({ item: 'tokyo skytree' })

      expect(window.location.search).toContain('item=tokyo+skytree')
    })
  })

  describe('generateDeepLink', () => {
    it('should generate deep link with date parameter', () => {
      const result = generateDeepLink({ date: '2025-01-15' })

      expect(result).toContain('date=2025-01-15')
      expect(result).toMatch(/^https?:\/\//)
    })

    it('should generate deep link with item parameters', () => {
      const result = generateDeepLink({
        itemId: 'item-123',
        itemTitle: 'Tokyo Skytree',
      })

      expect(result).toContain('item=item-123')
      expect(result).toContain('title=tokyo-skytree')
    })

    it('should generate deep link with all parameters', () => {
      const result = generateDeepLink({
        date: '2025-01-15',
        itemId: 'item-123',
        itemTitle: 'Tokyo Skytree',
      })

      expect(result).toContain('date=2025-01-15')
      expect(result).toContain('item=item-123')
      expect(result).toContain('title=tokyo-skytree')
    })

    it('should preserve hash mode routing', () => {
      const result = generateDeepLink({ date: '2025-01-15' })

      // Should include hash for Vue Router hash mode
      expect(result).toContain('#/itinerary')
    })

    it('should handle special characters in item title', () => {
      const result = generateDeepLink({
        itemTitle: '東京晴空塔 Tokyo Skytree!',
      })

      // itemTitle creates 'title' parameter, not 'item'
      expect(result).toContain('title=')
      // URL encodes Chinese characters, but decode to check content
      const url = new URL(result)
      const titleParam = url.searchParams.get('title')
      expect(titleParam).toBe('東京晴空塔-tokyo-skytree')
    })
  })

  describe('clearQueryParams', () => {
    beforeEach(() => {
      window.history.pushState({}, '', '/?date=2025-01-15&item=test')
    })

    it('should remove all query parameters', () => {
      clearQueryParams()

      expect(window.location.search).toBe('')
    })

    it('should preserve hash in URL', () => {
      window.history.pushState({}, '', '/#/itinerary?date=2025-01-15')
      clearQueryParams()

      expect(window.location.hash).toContain('#/itinerary')
      expect(window.location.search).toBe('')
    })
  })

  describe('parseDeepLinkParams', () => {
    beforeEach(() => {
      window.history.pushState({}, '', '/')
    })

    it('should return empty object when no parameters exist', () => {
      const result = parseDeepLinkParams()

      expect(result).toEqual({
        date: null,
        itemId: null,
        title: null,
      })
    })

    it('should parse date parameter', () => {
      window.history.pushState({}, '', '/?date=2025-01-15')
      const result = parseDeepLinkParams()

      expect(result.date).toBe('2025-01-15')
    })

    it('should parse item parameter', () => {
      window.history.pushState({}, '', '/?item=tokyo-skytree')
      const result = parseDeepLinkParams()

      expect(result.itemId).toBe('tokyo-skytree')
    })

    it('should parse all parameters', () => {
      window.history.pushState({}, '', '/?date=2025-01-15&item=tokyo-skytree&title=Tokyo+Skytree')
      const result = parseDeepLinkParams()

      expect(result.date).toBe('2025-01-15')
      expect(result.itemId).toBe('tokyo-skytree')
      expect(result.title).toBe('Tokyo Skytree')
    })
  })

  describe('generateSlug', () => {
    it('should convert text to lowercase slug', () => {
      const result = generateSlug('Tokyo Skytree')
      expect(result).toBe('tokyo-skytree')
    })

    it('should replace spaces with hyphens', () => {
      const result = generateSlug('Tokyo Tower Observation Deck')
      expect(result).toBe('tokyo-tower-observation-deck')
    })

    it('should remove special characters', () => {
      const result = generateSlug('Tokyo Skytree!')
      expect(result).toBe('tokyo-skytree')
    })

    it('should handle Chinese characters', () => {
      // Note: \w in JavaScript regex doesn't include Chinese characters
      // So Chinese-only text becomes empty after removing non-word chars
      const result = generateSlug('東京晴空塔')
      // The current implementation removes Chinese chars when no Latin chars present
      expect(result).toBe('')
    })

    it('should handle mixed English and Chinese', () => {
      const result = generateSlug('東京 Tokyo Skytree 晴空塔')
      // Current implementation only keeps English letters and hyphens
      expect(result).toBe('tokyo-skytree')
    })

    it('should remove leading and trailing hyphens', () => {
      const result = generateSlug('  Tokyo Skytree  ')
      expect(result).toBe('tokyo-skytree')
    })

    it('should collapse multiple hyphens', () => {
      const result = generateSlug('Tokyo - - Skytree')
      expect(result).toBe('tokyo-skytree')
    })

    it('should handle empty string', () => {
      const result = generateSlug('')
      expect(result).toBe('')
    })

    it('should handle only special characters', () => {
      const result = generateSlug('!!@@##')
      expect(result).toBe('')
    })
  })
})
