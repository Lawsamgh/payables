import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { title: 'Payables' },
    },
    {
      path: '/entry',
      name: 'entry',
      component: () => import('../views/EntryView.vue'),
      meta: { title: 'New entry' },
    },
    {
      path: '/tax',
      name: 'tax',
      component: () => import('../views/TaxView.vue'),
      meta: { title: 'Tax' },
    },
  ],
})

router.afterEach((to) => {
  const title = to.meta?.title as string | undefined
  if (title) document.title = `${title} · Accounts Payable`
})

export default router
