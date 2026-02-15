<template>
  <div class="h-screen flex overflow-hidden">
    <AppSidebar />

    <div class="flex flex-1 flex-col min-h-0 min-w-0">
      <AppHeader />
      <main class="flex-1 flex flex-col min-h-0 min-w-0 overflow-auto">
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

    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import AppSidebar from './components/AppSidebar.vue'
import AppSidebarRight from './components/AppSidebarRight.vue'
import StatusBar from './components/StatusBar.vue'
import ConnectionModal from './components/ConnectionModal.vue'
import Toast from './components/Toast.vue'
import { useFileMaker } from './composables/useFileMaker'
import { getBaseUrl } from './utils/filemakerApi'
const { login } = useFileMaker()
const showConnectModal = ref(false)

function onConnected() {
  // Don’t load all records on entry – EntryView loads by transRef or clears for new entry
  // Home list refreshes via its watch(isConnected)
}

onMounted(async () => {
  const baseUrl = getBaseUrl()
  const user = import.meta.env.VITE_FILEMAKER_USER as string | undefined
  const password = import.meta.env.VITE_FILEMAKER_PASSWORD as string | undefined
  if (baseUrl && user?.trim() && password) {
    await login({ username: user.trim(), password })
  }
})

</script>
