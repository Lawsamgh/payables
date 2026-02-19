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
        <StatusBar @open-connect="showConnectModal = true" />
      </div>

      <AppSidebarRight />

      <ConnectionModal
      :visible="showConnectModal"
      @close="showConnectModal = false"
      @connected="onConnected"
    />
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
import { ref, computed, onMounted, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppSidebarRight from './components/AppSidebarRight.vue'
import StatusBar from './components/StatusBar.vue'
import ConnectionModal from './components/ConnectionModal.vue'
import Toast from './components/Toast.vue'
import { useFileMaker } from './composables/useFileMaker'
const route = useRoute()
const router = useRouter()
const { isConnected } = useFileMaker()
const showConnectModal = ref(false)
const routerReady = ref(false)

provide('openConnectModal', () => {
  if (!isConnected.value) showConnectModal.value = true
})

const showAppLayout = computed(() => route.meta?.layout !== 'login')

onMounted(async () => {
  await router.isReady()
  routerReady.value = true
})

function onConnected() {
  // Don’t load all records on entry – EntryView loads by transRef or clears for new entry
  // Home list refreshes via its watch(isConnected)
}
</script>

<style scoped>
.app__loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}
</style>
