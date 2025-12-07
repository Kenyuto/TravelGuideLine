<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition-shadow p-4">
    <!-- Header with Packing Checkbox -->
    <div class="flex items-start justify-between mb-3">
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <h3
            :class="[
              'text-lg font-semibold',
              item.isPacked
                ? 'line-through text-gray-400 dark:text-gray-600'
                : 'text-gray-900 dark:text-white',
            ]"
          >
            {{ item.title }}
          </h3>
          <span
            class="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
          >
            {{ item.category }}
          </span>
        </div>
      </div>

      <!-- Packing Checkbox -->
      <div v-if="showPackingCheckbox" class="flex items-center">
        <button
          @click="$emit('toggle-packed')"
          :class="[
            'w-6 h-6 rounded border-2 flex items-center justify-center transition-colors',
            item.isPacked
              ? 'bg-green-600 border-green-600'
              : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:border-green-500',
          ]"
          :aria-label="item.isPacked ? '取消打包' : '標記為已打包'"
        >
          <svg
            v-if="item.isPacked"
            class="w-4 h-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="3"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </button>
      </div>
    </div>

    <!-- Content -->
    <p
      v-if="item.content"
      :class="[
        'text-sm mb-3',
        item.isPacked ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400',
      ]"
    >
      {{ item.content }}
    </p>

    <!-- Category Specific Fields -->
    <div class="space-y-2 text-sm">
      <!-- Address (住宿) -->
      <div v-if="item.address" class="flex items-start gap-2">
        <svg
          class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span class="text-gray-700 dark:text-gray-300">{{ item.address }}</span>
      </div>

      <!-- Amount (打包清單) -->
      <div v-if="item.amount !== undefined" class="flex items-center gap-2">
        <svg
          class="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14"
          />
        </svg>
        <span class="text-gray-700 dark:text-gray-300">數量：{{ item.amount }}</span>
      </div>

      <!-- Contact Name & Phone (緊急聯絡) -->
      <div v-if="item.contactName" class="flex items-center gap-2">
        <svg
          class="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
        <span class="text-gray-700 dark:text-gray-300">{{ item.contactName }}</span>
      </div>

      <div v-if="item.phone" class="flex items-center gap-2">
        <svg
          class="w-4 h-4 text-gray-400 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
          />
        </svg>
        <a :href="`tel:${item.phone}`" class="text-blue-600 dark:text-blue-400 hover:underline">
          {{ item.phone }}
        </a>
      </div>

      <!-- Links -->
      <div v-if="item.linkList && item.linkList.length > 0" class="flex items-start gap-2">
        <svg
          class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <div class="flex flex-col gap-1">
          <a
            v-for="(link, index) in item.linkList"
            :key="index"
            :href="link"
            target="_blank"
            rel="noopener noreferrer"
            class="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {{ link }}
          </a>
        </div>
      </div>

      <!-- Notes -->
      <div
        v-if="item.notes"
        class="flex items-start gap-2 pt-2 border-t border-gray-200 dark:border-gray-700"
      >
        <svg
          class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
          />
        </svg>
        <span class="text-gray-500 dark:text-gray-400 italic text-xs">{{ item.notes }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { InfoItem } from '@/types/travelInfo'

defineProps<{
  item: InfoItem
  showPackingCheckbox: boolean
}>()

defineEmits<{
  'toggle-packed': []
}>()
</script>
