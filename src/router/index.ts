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
 * T022-T023: 實作驗證守衛與深連結還原
 */
router.beforeEach((to, _from, next) => {
  // 更新頁面標題
  document.title = `${to.meta.title || '旅遊行程'} - 旅遊行程檢視`

  // 動態 import AuthStore 以避免循環依賴
  import('@/stores/auth').then(({ useAuthStore }) => {
    const authStore = useAuthStore()

    // 恢復登入狀態（僅在首次導航時）
    if (!authStore.isAuthenticated && !authStore.authTimestamp) {
      authStore.restoreAuthState()
    }

    // T022: 驗證路由守衛
    if (to.meta.requiresAuth && !authStore.isLoginValid) {
      // 未登入或登入已過期，重導向至登入頁面並帶 redirect 參數
      next({
        path: '/',
        query: { redirect: to.fullPath },
      })
      return
    }

    // T023: 深連結還原守衛
    if (to.path === '/' && authStore.isLoginValid && to.query.redirect) {
      // 已登入且有 redirect 參數，導向原本要訪問的頁面
      const redirectPath = to.query.redirect as string
      next(redirectPath)
      return
    }

    // 已登入使用者訪問登入頁面，直接導向行程頁面
    if (to.path === '/' && authStore.isLoginValid && !to.query.redirect) {
      next('/itinerary')
      return
    }

    next()
  })
})

export default router
