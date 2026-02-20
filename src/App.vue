<template>
  <div class="h-screen flex overflow-hidden" :class="{ 'app--loading': !routerReady }">
    <div v-if="!routerReady" class="app__loader" aria-hidden="true" />
    <template v-else-if="showAppLayout">
      <AppSidebar />

      <div class="flex flex-1 flex-col min-h-0 min-w-0">
        <AppHeader />
        <main class="app-main flex-1 flex flex-col min-h-0 min-w-0 overflow-auto">
          <RouterView />
        </main>
        <StatusBar />
      </div>

      <AppSidebarRight />
    </template>
    <template v-else>
      <div class="flex-1 min-w-0 min-h-0 flex">
        <RouterView />
      </div>
    </template>

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppSidebarRight from './components/AppSidebarRight.vue'
import StatusBar from './components/StatusBar.vue'
import Toast from './components/Toast.vue'
const route = useRoute()
const router = useRouter()
const routerReady = ref(false)

const showAppLayout = computed(() => route.meta?.layout !== 'login')

onMounted(async () => {
  await router.isReady()
  routerReady.value = true
})
</script>

<style scoped>
.app__loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}
</style>
