import { watch } from 'vue'
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { locale, t, type MessageKey } from '@/i18n'
import { useAuthStore } from '@/stores/auth'
import DashboardView from '@/views/DashboardView.vue'
import LoginView from '@/views/LoginView.vue'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guest?: boolean
    // Kunci teks judul tab (diterjemahkan saat ditampilkan).
    title?: MessageKey
    // Hanya untuk pemilik tenant / hanya untuk super-admin.
    area?: 'tenant' | 'super'
  }
}

const tenant = { requiresAuth: true, area: 'tenant' as const }
const superArea = { requiresAuth: true, area: 'super' as const }

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/login', name: 'login', component: LoginView, meta: { guest: true, title: 'nav.login' } },
    { path: '/', name: 'dashboard', component: DashboardView, meta: { ...tenant, title: 'nav.dashboard' } },
    { path: '/antrian', name: 'queue', component: () => import('@/views/QueueView.vue'), meta: { ...tenant, title: 'nav.queue' } },
    { path: '/kasir', name: 'pos', component: () => import('@/views/PosView.vue'), meta: { ...tenant, title: 'nav.pos' } },
    { path: '/laporan', name: 'reports', component: () => import('@/views/ReportsView.vue'), meta: { ...tenant, title: 'nav.reports' } },
    { path: '/pembayaran', name: 'payments', component: () => import('@/views/PaymentView.vue'), meta: { ...tenant, title: 'nav.payments' } },
    { path: '/profil', name: 'profile', component: () => import('@/views/ProfileView.vue'), meta: { ...tenant, title: 'nav.profile' } },
    { path: '/layanan', name: 'services', component: () => import('@/views/ServicesView.vue'), meta: { ...tenant, title: 'nav.services' } },
    { path: '/langganan', name: 'subscription', component: () => import('@/views/SubscriptionView.vue'), meta: { ...tenant, title: 'nav.subscription' } },

    { path: '/super', name: 'super', component: () => import('@/views/super/SuperOverviewView.vue'), meta: { ...superArea, title: 'nav.overview' } },
    { path: '/super/tenants', name: 'super-tenants', component: () => import('@/views/super/SuperTenantsView.vue'), meta: { ...superArea, title: 'nav.tenants' } },
    {
      path: '/super/tenants/:id',
      name: 'super-tenant',
      component: () => import('@/views/super/SuperTenantDetailView.vue'),
      meta: { ...superArea, title: 'nav.tenantDetail' },
    },
    { path: '/super/settings', name: 'super-settings', component: () => import('@/views/super/SuperSettingsView.vue'), meta: { ...superArea, title: 'nav.settings' } },

    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth) {
    if (!auth.isLoggedIn) return { name: 'login', query: to.fullPath !== '/' ? { redirect: to.fullPath } : {} }
    if (!auth.user) {
      try {
        await auth.fetchMe()
      } catch {
        auth.clear()
        return { name: 'login' }
      }
    }
    // Super-admin tidak punya dashboard tenant sendiri, dan sebaliknya.
    if (to.meta.area === 'tenant' && auth.isSuperadmin) return { name: 'super' }
    if (to.meta.area === 'super' && !auth.isSuperadmin) return { name: 'dashboard' }
  }

  if (to.meta.guest && auth.isLoggedIn) {
    // Link dari pendaftaran (/login?email=...) bisa untuk bisnis lain: keluar dulu, jangan masuk diam-diam ke sesi lama.
    if (typeof to.query.email === 'string') {
      await auth.logout()
      if (auth.isLoggedIn) await auth.logout() // keluar juga dari sesi super-admin di balik mode bantuan
      return
    }
    return { name: 'dashboard' }
  }
})

function updateTitle(route: RouteLocationNormalized) {
  document.title = `${t(route.meta.title ?? 'nav.dashboard')} · WashWuzz`
}

router.afterEach(updateTitle)
watch(locale, () => updateTitle(router.currentRoute.value))

export default router
