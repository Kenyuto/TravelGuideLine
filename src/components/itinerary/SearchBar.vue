<template>
  <div class="relative">
    <div class="relative">
      <input
        :value="modelValue"
        @input="handleInput"
        @keydown.enter="handleSearch"
        type="text"
        :placeholder="placeholder"
        class="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />
      <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        <svg
          class="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      <button
        v-if="clearable && modelValue"
        @click="handleClear"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
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
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onUnmounted } from 'vue'

interface Props {
  modelValue: string
  placeholder?: string
  clearable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: '搜尋行程...',
  clearable: true,
})

interface Emits {
  (event: 'update:modelValue', value: string): void
  (event: 'search', value: string): void
}

const emit = defineEmits<Emits>()

let debounceTimer: ReturnType<typeof setTimeout> | null = null

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  const value = target.value

  emit('update:modelValue', value)

  // 300ms debounce
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    emit('search', value)
  }, 300)
}

function handleSearch() {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
  emit('search', props.modelValue)
}

function handleClear() {
  emit('update:modelValue', '')
  emit('search', '')
}

onUnmounted(() => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>
