/**
 * 應用程式進入點
 * 初始化 Vue、Pinia、Router
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './assets/styles/main.css'

// 建立 Vue 應用實例
const app = createApp(App)

// 建立 Pinia 實例
const pinia = createPinia()

// 註冊 Pinia
app.use(pinia)

// 註冊 Router
app.use(router)

// 掛載應用
app.mount('#app')

// 開發環境資訊
if (import.meta.env.DEV) {
  console.log('🚀 應用程式已啟動')
  console.log('📍 Router 模式: Hash')
  console.log('🔧 環境: 開發模式')
}
