import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../composables/useFileMaker'
import { getHomeRoute } from '../utils/homeTab'
import { getCachedRole } from '../utils/roleGuard'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { title: 'Sign in', layout: 'login' },
    },
    {
      path: '/login',
      redirect: '/',
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'Payables', requiresAuth: true },
    },
    {
      path: '/entry',
      name: 'entry',
      component: () => import('../views/EntryView.vue'),
      meta: { title: 'New entry', requiresAuth: true, requireShowForManagerForNew: true },
    },
    {
      path: '/tax',
      name: 'tax',
      component: () => import('../views/TaxView.vue'),
      meta: { title: 'Tax', requiresAuth: true },
    },
    {
      path: '/vendors',
      name: 'vendors',
      component: () => import('../views/VendorsView.vue'),
      meta: { title: 'Vendors', requiresAuth: true },
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: () => import('../views/InvoicesView.vue'),
      meta: { title: 'Invoices', requiresAuth: true, requireShowForManager: true },
    },
    {
      path: '/cheque-collection',
      name: 'cheque-collection',
      component: () => import('../views/ChequeCollectionView.vue'),
      meta: { title: 'Cheque collection', requiresAuth: true, requireShowForManager: true },
    },
    {
      path: '/vendor-collect',
      name: 'vendor-collect',
      component: () => import('../views/VendorCollectView.vue'),
      meta: { title: 'Collect cheque', layout: 'login', requiresAuth: false },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { title: 'Settings', requiresAuth: true },
    },
    {
      path: '/settings/users',
      name: 'settings-users',
      component: () => import('../views/SettingsUsersView.vue'),
      meta: { title: 'Manage Users', requiresAuth: true, requireAdmin: true },
    },
    {
      path: '/settings/documents',
      name: 'settings-documents',
      component: () => import('../views/SettingsDocumentsView.vue'),
      meta: { title: 'Documents', requiresAuth: true, requireAdmin: true },
    },
    {
      path: '/settings/logs',
      name: 'settings-logs',
      component: () => import('../views/SettingsLogsView.vue'),
      meta: { title: 'Activity Logs', requiresAuth: true, requireCanViewLogs: true },
    },
    {
      path: '/settings/emails',
      name: 'settings-emails',
      component: () => import('../views/SettingsEmailListView.vue'),
      meta: { title: 'Notification emails', requiresAuth: true, requireAdmin: true },
    },
    {
      path: '/settings/features',
      name: 'settings-features',
      component: () => import('../views/SettingsFeaturesView.vue'),
      meta: { title: 'Features', requiresAuth: true, requireAdmin: true },
    },
    {
      path: '/settings/qr-code',
      name: 'settings-qr-code',
      component: () => import('../views/SettingsQrCodeView.vue'),
      meta: { title: 'Generate QR Code', requiresAuth: true, requireAdmin: true },
    },
    {
      path: '/settings/shortcuts',
      name: 'settings-shortcuts',
      component: () => import('../views/SettingsShortcutsView.vue'),
      meta: { title: 'Keyboard shortcuts', requiresAuth: true },
    },
  ],
})

/** Allow only internal paths for redirect (prevents open redirect). */
function isSafeRedirect(path: unknown): path is string {
  if (typeof path !== 'string' || !path.startsWith('/')) return false
  if (path.startsWith('//')) return false // protocol-relative
  if (path.includes(':')) return false // e.g. http:
  return true
}

router.beforeEach((to) => {
  if (to.meta?.requiresAuth && !isAuthenticated()) {
    return { path: '/', query: { redirect: to.fullPath }, replace: true }
  }
  if (to.path === '/' && isAuthenticated()) {
    const redirect = to.query?.redirect
    if (isSafeRedirect(redirect)) {
      return { path: redirect, replace: true }
    }
    return { ...getHomeRoute(), replace: true }
  }

  // Role-based access: redirect if user lacks permission
  if (to.meta?.requiresAuth && isAuthenticated()) {
    const role = getCachedRole()
    if (to.meta.requireShowForManager) {
      if (role === 'manager') return { path: '/home', replace: true }
      if (!role) return { path: '/home', replace: true } // cache empty, safe redirect
    }
    if (to.meta.requireShowForManagerForNew && to.name === 'entry') {
      if (!to.query?.transRef && (role === 'manager' || !role)) return { path: '/home', replace: true }
    }
    if (to.meta.requireAdmin) {
      if (role !== 'admin') return { path: '/settings', replace: true }
    }
    if (to.meta.requireCanViewLogs) {
      if (role !== 'admin' && role !== 'manager') return { path: '/settings', replace: true }
    }
  }
})

router.afterEach((to) => {
  const title = to.meta?.title as string | undefined
  if (title) document.title = `${title} · Accounts Payable`
})

export default router
