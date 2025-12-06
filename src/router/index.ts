/**
 * Vue Router 4.x 配置
 * 使用 Hash 模式
 */

import { createRouter, createWebHashHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

/**
 * 路由定義
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: {
      title: '登入',
      requiresAuth: false,
    },
  },
  {
    path: '/itinerary',
    name: 'Itinerary',
    component: () => import('@/views/ItineraryView.vue'),
    meta: {
      title: '行程檢視',
      requiresAuth: true,
    },
  },
  {
    path: '/travel-info',
    name: 'TravelInfo',
    component: () => import('@/views/TravelInfoView.vue'),
    meta: {
      title: '旅遊資訊',
      requiresAuth: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    redirect: '/',
  },
]

/**
 * Router 實例
 */
const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  },
})

/**
 * 路由導航守衛
 * 將在 Phase 3（US0 登入驗證）中實作：
 * - 檢查 requiresAuth
 * - 驗證 AuthStore.isLoginValid
 * - 未驗證時重導向至 / 並帶 redirect 參數
 * - 登入後還原 redirect 參數
 */
router.beforeEach((to, _from, next) => {
  // 更新頁面標題
  document.title = `${to.meta.title || '旅遊行程'} - 旅遊行程檢視`

  // TODO: Phase 3 將加入驗證守衛
  next()
})

export default router
