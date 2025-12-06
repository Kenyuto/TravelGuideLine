<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div v-if="$slots.title" class="mb-4">
      <slot name="title" />
    </div>

    <div v-if="$slots.description" class="mb-6">
      <slot name="description" />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">密碼</label>
      <div class="mt-1">
        <input
          id="password"
          v-model="password"
          type="password"
          name="password"
          autocomplete="current-password"
          required
          :disabled="loading"
          class="block w-full rounded-lg border border-gray-300 px-4 py-3 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          placeholder="請輸入密碼"
          @input="clearError"
        />
      </div>
    </div>

    <div v-if="error" class="rounded-lg bg-red-50 p-4">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm font-medium text-red-800">{{ error }}</p>
        </div>
      </div>
    </div>

    <div>
      <button
        type="submit"
        :disabled="loading || !password"
        class="flex w-full justify-center rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        <span v-if="loading" class="flex items-center">
          <svg
            class="mr-2 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          驗證中...
        </span>
        <span v-else>登入</span>
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

/**
 * Props
 */
interface Props {
  loading?: boolean
  error?: string | null
}

withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
})

/**
 * Emits
 */
interface Emits {
  (event: 'submit', password: string): void
}

const emit = defineEmits<Emits>()

/**
 * State
 */
const password = ref('')

/**
 * 處理表單提交
 */
function handleSubmit() {
  if (password.value.trim()) {
    emit('submit', password.value.trim())
  }
}

/**
 * 清除錯誤訊息
 */
function clearError() {
  // 當使用者開始輸入時，可以清除錯誤（由父元件處理）
}
</script>
