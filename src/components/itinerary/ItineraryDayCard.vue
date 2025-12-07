<template>
  <div
    :class="[
      'cursor-pointer rounded-lg border-2 p-4 transition-all',
      isActive
        ? 'border-primary-500 bg-primary-50 shadow-lg'
        : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-md',
    ]"
    @click="handleClick"
  >
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-semibold text-gray-900">{{ formatDate(day.date) }}</h3>
        <p v-if="day.notes" class="mt-1 text-sm text-gray-600">{{ day.notes }}</p>
      </div>
      <div class="text-right">
        <p class="text-sm text-gray-600">{{ day.items.length }} 個行程</p>
        <p class="text-xs text-gray-500 mt-1">
          完成 {{ day.completedCount }} / {{ day.items.length }}
        </p>
      </div>
    </div>

    <div class="mt-3 flex items-center justify-between border-t border-gray-200 pt-3">
      <div class="text-sm text-gray-600">
        總花費：<span class="font-semibold text-gray-900">{{ formatCurrency(day.totalCost) }}</span>
      </div>
      <div class="h-2 w-24 rounded-full bg-gray-200">
        <div
          class="h-2 rounded-full bg-green-500"
          :style="{ width: `${completionPercentage}%` }"
        ></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ItineraryDay } from '@/types/itinerary'

interface Props {
  day: ItineraryDay
  isActive?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
})

interface Emits {
  (event: 'click', date: string): void
}

const emit = defineEmits<Emits>()

const completionPercentage = computed(() => {
  if (props.day.items.length === 0) return 0
  return Math.round((props.day.completedCount / props.day.items.length) * 100)
})

function formatDate(date: string): string {
  const d = new Date(date)
  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const month = d.getMonth() + 1
  const day = d.getDate()
  return `${month}/${day} (${weekdays[d.getDay()]})`
}

function formatCurrency(amount: number): string {
  return `NT$ ${amount.toLocaleString()}`
}

function handleClick() {
  emit('click', props.day.date)
}
</script>
