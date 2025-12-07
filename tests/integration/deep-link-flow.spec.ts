import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import ItineraryView from '@/views/ItineraryView.vue'
import { useItineraryStore } from '@/stores/itinerary'
import { useAuthStore } from '@/stores/auth'

describe('Deep Link Flow Integration', () => {
  let router: ReturnType<typeof createRouter>
  let pinia: ReturnType<typeof createPinia>

  beforeEach(() => {
    // Create fresh Pinia instance
    pinia = createPinia()
    setActivePinia(pinia)

    // Create router with memory history
    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        {
          path: '/itinerary',
          name: 'itinerary',
          component: ItineraryView,
        },
      ],
    })

    // Mock localStorage
    global.localStorage = {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    } as Storage
  })

  describe('Date Parameter Navigation', () => {
    it('should switch to specified date when date parameter exists', async () => {
      // Set up authenticated user
      const authStore = useAuthStore()
      authStore.$patch({
        isAuthenticated: true,
        sheetId: 'test-sheet-id',
      })

      // Set up itinerary store with test data
      const itineraryStore = useItineraryStore()
      itineraryStore.$patch({
        days: {
          '2025-01-15': {
            date: '2025-01-15',
            items: [
              {
                id: 'item-1',
                date: '2025-01-15',
                title: 'Tokyo Skytree',
                time: '10:00',
                location: 'Tokyo',
                isCompleted: false,
                category: '景點',
                description: '',
                cost: 0,
                currency: 'JPY',
                mapLink: '',
                emoji: '',
                links: '',
                tags: '',
                notes: '',
                tagList: [],
                linkList: [],
              },
            ],
          },
          '2025-01-16': {
            date: '2025-01-16',
            items: [],
          },
        },
        currentDate: '2025-01-16',
        availableDates: ['2025-01-15', '2025-01-16'],
        loading: false,
        error: null,
      })

      // Navigate to URL with date parameter
      await router.push('/itinerary?date=2025-01-15')
      await router.isReady()

      // Mount component
      const wrapper = mount(ItineraryView, {
        global: {
          plugins: [pinia, router],
        },
      })

      // Wait for component to process deep link
      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verify date was switched
      expect(itineraryStore.currentDate).toBe('2025-01-15')

      wrapper.unmount()
    })

    it('should ignore invalid date parameter', async () => {
      const authStore = useAuthStore()
      authStore.$patch({
        isAuthenticated: true,
        sheetId: 'test-sheet-id',
      })

      const itineraryStore = useItineraryStore()
      itineraryStore.$patch({
        days: {
          '2025-01-15': {
            date: '2025-01-15',
            items: [],
          },
        },
        currentDate: '2025-01-15',
        availableDates: ['2025-01-15'],
        loading: false,
        error: null,
      })

      // Navigate with invalid date
      await router.push('/itinerary?date=2025-12-31')
      await router.isReady()

      const wrapper = mount(ItineraryView, {
        global: {
          plugins: [pinia, router],
        },
      })

      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Should remain on current date
      expect(itineraryStore.currentDate).toBe('2025-01-15')

      wrapper.unmount()
    })
  })

  describe('Item Parameter Navigation', () => {
    it('should scroll to item when item parameter matches', async () => {
      const authStore = useAuthStore()
      authStore.$patch({
        isAuthenticated: true,
        sheetId: 'test-sheet-id',
      })

      const itineraryStore = useItineraryStore()
      itineraryStore.$patch({
        days: {
          '2025-01-15': {
            date: '2025-01-15',
            items: [
              {
                id: 'item-1',
                date: '2025-01-15',
                title: 'Tokyo Skytree',
                time: '10:00',
                location: 'Tokyo',
                isCompleted: false,
                category: '景點',
                description: '',
                cost: 0,
                currency: 'JPY',
                mapLink: '',
                emoji: '',
                links: '',
                tags: '',
                notes: '',
                tagList: [],
                linkList: [],
              },
            ],
          },
        },
        currentDate: '2025-01-15',
        availableDates: ['2025-01-15'],
        loading: false,
        error: null,
      })

      // Mock scrollIntoView
      Element.prototype.scrollIntoView = vi.fn()

      // Navigate with item parameter
      await router.push('/itinerary?item=tokyo-skytree')
      await router.isReady()

      const wrapper = mount(ItineraryView, {
        global: {
          plugins: [pinia, router],
        },
      })

      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verify scrollIntoView was called
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled()

      wrapper.unmount()
    })

    it('should switch date when item is found on different date', async () => {
      const authStore = useAuthStore()
      authStore.$patch({
        isAuthenticated: true,
        sheetId: 'test-sheet-id',
      })

      const itineraryStore = useItineraryStore()
      itineraryStore.$patch({
        days: {
          '2025-01-15': {
            date: '2025-01-15',
            items: [
              {
                id: 'item-1',
                date: '2025-01-15',
                title: 'Tokyo Skytree',
                time: '10:00',
                location: 'Tokyo',
                isCompleted: false,
                category: '景點',
                description: '',
                cost: 0,
                currency: 'JPY',
                mapLink: '',
                emoji: '',
                links: '',
                tags: '',
                notes: '',
                tagList: [],
                linkList: [],
              },
            ],
          },
          '2025-01-16': {
            date: '2025-01-16',
            items: [],
          },
        },
        currentDate: '2025-01-16',
        availableDates: ['2025-01-15', '2025-01-16'],
        loading: false,
        error: null,
      })

      Element.prototype.scrollIntoView = vi.fn()

      // Navigate to item on different date
      await router.push('/itinerary?item=tokyo-skytree')
      await router.isReady()

      const wrapper = mount(ItineraryView, {
        global: {
          plugins: [pinia, router],
        },
      })

      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Should switch to date containing the item
      expect(itineraryStore.currentDate).toBe('2025-01-15')

      wrapper.unmount()
    })
  })

  describe('Combined Parameters', () => {
    it('should handle both date and item parameters', async () => {
      const authStore = useAuthStore()
      authStore.$patch({
        isAuthenticated: true,
        sheetId: 'test-sheet-id',
      })

      const itineraryStore = useItineraryStore()
      itineraryStore.$patch({
        days: {
          '2025-01-15': {
            date: '2025-01-15',
            items: [
              {
                id: 'item-1',
                date: '2025-01-15',
                title: 'Tokyo Skytree',
                time: '10:00',
                location: 'Tokyo',
                isCompleted: false,
                category: '景點',
                description: '',
                cost: 0,
                currency: 'JPY',
                mapLink: '',
                emoji: '',
                links: '',
                tags: '',
                notes: '',
                tagList: [],
                linkList: [],
              },
            ],
          },
        },
        currentDate: '2025-01-16',
        availableDates: ['2025-01-15', '2025-01-16'],
        loading: false,
        error: null,
      })

      Element.prototype.scrollIntoView = vi.fn()

      // Navigate with both parameters
      await router.push('/itinerary?date=2025-01-15&item=tokyo-skytree')
      await router.isReady()

      const wrapper = mount(ItineraryView, {
        global: {
          plugins: [pinia, router],
        },
      })

      await wrapper.vm.$nextTick()
      await new Promise((resolve) => setTimeout(resolve, 200))

      // Should switch date and scroll to item
      expect(itineraryStore.currentDate).toBe('2025-01-15')
      expect(Element.prototype.scrollIntoView).toHaveBeenCalled()

      wrapper.unmount()
    })
  })
})
