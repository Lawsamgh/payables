import { createRouter, createWebHistory } from 'vue-router'
import { isAuthenticated } from '../composables/useFileMaker'

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
      meta: { title: 'New entry', requiresAuth: true },
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
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { title: 'Settings', requiresAuth: true },
    },
    {
      path: '/settings/users',
      name: 'settings-users',
      component: () => import('../views/SettingsUsersView.vue'),
      meta: { title: 'Manage Users', requiresAuth: true },
    },
  ],
})

router.beforeEach((to) => {
  if (to.meta?.requiresAuth && !isAuthenticated()) {
    return { path: '/', replace: true }
  }
  if (to.path === '/' && isAuthenticated()) {
    return { path: '/home', replace: true }
  }
})

router.afterEach((to) => {
  const title = to.meta?.title as string | undefined
  if (title) document.title = `${title} · Accounts Payable`
})

export default router
