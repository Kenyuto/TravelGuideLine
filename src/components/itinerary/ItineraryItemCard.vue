<template>
  <div
    :class="[
      'rounded-lg border bg-white p-4 shadow transition-all',
      item.isCompleted ? 'border-green-300 bg-green-50' : 'border-gray-200',
    ]"
    :data-item-id="item.id"
    :data-map-link="item.mapLink"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            :checked="item.isCompleted"
            @change="handleToggleComplete"
            class="h-5 w-5 rounded border-gray-300 text-primary-600 focus:ring-2 focus:ring-primary-500"
          />
          <h3
            :class="[
              'text-lg font-semibold',
              item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900',
            ]"
          >
            {{ item.title }}
          </h3>
          <span
            v-if="item.category"
            class="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700"
          >
            {{ item.category }}
          </span>
        </div>

        <div class="mt-2 space-y-1 text-sm text-gray-600">
          <p v-if="item.time" class="flex items-center gap-1">
            <svg
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
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ item.time }}
          </p>

          <p v-if="item.location" class="flex items-center gap-1">
            <svg
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {{ item.location }}
            <button
              v-if="item.mapLink"
              @click="handleOpenMap"
              class="ml-1 text-primary-600 hover:text-primary-700 underline"
            >
              地圖
            </button>
          </p>

          <p v-if="item.cost" class="flex items-center gap-1">
            <svg
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
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {{ item.currency || 'NT$' }} {{ item.cost.toLocaleString() }}
          </p>
        </div>

        <p v-if="item.description" class="mt-3 text-sm text-gray-700">
          {{ item.description }}
        </p>

        <div v-if="item.tagList.length > 0" class="mt-3 flex flex-wrap gap-2">
          <span
            v-for="tag in item.tagList"
            :key="tag"
            class="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
          >
            #{{ tag }}
          </span>
        </div>

        <div v-if="item.links" class="mt-3">
          <a
            v-for="(link, index) in item.linkList"
            :key="index"
            :href="link"
            target="_blank"
            rel="noopener noreferrer"
            class="mr-2 text-sm text-primary-600 hover:text-primary-700 underline"
          >
            連結 {{ index + 1 }}
          </a>
        </div>

        <p v-if="item.notes" class="mt-3 rounded bg-yellow-50 p-2 text-sm text-yellow-800">
          💡 {{ item.notes }}
        </p>
      </div>
    </div>

    <slot name="actions" :item="item" />
  </div>
</template>

<script setup lang="ts">
import type { ItineraryItem } from '@/types/itinerary'

interface Props {
  item: ItineraryItem
}

const props = defineProps<Props>()

interface Emits {
  (event: 'toggle-complete', itemId: string, completed: boolean): void
  (event: 'open-map', mapLink: string): void
}

const emit = defineEmits<Emits>()

function handleToggleComplete(event: Event) {
  const target = event.target as HTMLInputElement
  emit('toggle-complete', props.item.id, target.checked)
}

function handleOpenMap() {
  if (props.item.mapLink) {
    emit('open-map', props.item.mapLink)
  }
}
</script>
