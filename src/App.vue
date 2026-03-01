<template>
  <div
    class="h-screen flex overflow-hidden"
    :class="{ 'app--loading': !routerReady }"
  >
    <div v-if="!routerReady" class="app__loader" aria-hidden="true" />
    <template v-else-if="showAppLayout">
      <AppSidebar />

      <div class="flex flex-1 flex-col min-h-0 min-w-0">
        <AppHeader />
        <main
          class="app-main flex-1 flex flex-col min-h-0 min-w-0 overflow-auto"
        >
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

    <CommandPalette
      v-if="showAppLayout && documentSettings.commandPaletteEnabled"
    />
    <ShortcutsCheatsheetModal v-if="showAppLayout" />
    <ConnectionModal
      :visible="showConnectionModal"
      @close="showConnectionModal = false"
      @connected="showConnectionModal = false"
    />
    <SessionTimeoutModal
      v-if="
        showAppLayout &&
        isConnected &&
        documentSettings.sessionTimeoutWarningEnabled
      "
      :visible="sessionTimeout.showWarningModal.value"
      :extending="sessionTimeout.extending.value"
      :minutes-left="sessionTimeout.minutesLeft.value"
      :countdown-formatted="sessionTimeout.countdownFormatted.value"
      @stay-signed-in="sessionTimeout.extendSession"
    />
    <OnboardingModal
      v-if="showAppLayout && isConnected && documentSettings.onboardingEnabled"
      :visible="onboarding.needsOnboarding.value"
      :saving="onboardingSaving"
      :role="onboarding.userRole.value"
      @dismiss="onOnboardingDismiss"
    />
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import AppHeader from "./components/AppHeader.vue";
import AppSidebar from "./components/AppSidebar.vue";
import AppSidebarRight from "./components/AppSidebarRight.vue";
import StatusBar from "./components/StatusBar.vue";
import Toast from "./components/Toast.vue";
import CommandPalette from "./components/CommandPalette.vue";
import ShortcutsCheatsheetModal from "./components/ShortcutsCheatsheetModal.vue";
import ConnectionModal from "./components/ConnectionModal.vue";
import SessionTimeoutModal from "./components/SessionTimeoutModal.vue";
import OnboardingModal from "./components/OnboardingModal.vue";
import { useCommandPaletteStore } from "./stores/commandPaletteStore";
import { useShortcutsCheatsheetStore } from "./stores/shortcutsCheatsheetStore";
import { useFileMaker } from "./composables/useFileMaker";
import { useDocumentSettingsStore } from "./stores/documentSettingsStore";
import { useSessionTimeout } from "./composables/useSessionTimeout";
import { useBookletStore } from "./stores/bookletStore";
import { useRecentEntriesStore } from "./stores/recentEntriesStore";
import { useUserRole } from "./composables/useUserRole";
import { useOnboarding } from "./composables/useOnboarding";
import { useToastStore } from "./stores/toastStore";

const route = useRoute();
const router = useRouter();
const booklet = useBookletStore();
const routerReady = ref(false);
const showConnectionModal = ref(false);
const paletteStore = useCommandPaletteStore();
const shortcutsCheatsheetStore = useShortcutsCheatsheetStore();
const recentEntries = useRecentEntriesStore();
const { showForManager } = useUserRole();
const { isConnected } = useFileMaker();
const documentSettings = useDocumentSettingsStore();
const sessionTimeout = useSessionTimeout();
const onboarding = useOnboarding();
const onboardingSaving = ref(false);
const toast = useToastStore();

const showAppLayout = computed(() => route.meta?.layout !== "login");

async function onOnboardingDismiss() {
  onboardingSaving.value = true;
  const ok = await onboarding.markOnboarded();
  onboardingSaving.value = false;
  if (!ok) {
    toast.error("Could not save. Please try again.");
  }
}

watch(
  () => ({ name: route.name, transRef: route.query.transRef }),
  ({ name, transRef }) => {
    if (name === "entry" && typeof transRef === "string" && transRef.trim()) {
      recentEntries.addRecent(transRef.trim());
    }
  },
  { immediate: true },
);

function entryQuery(transRef: string) {
  const q: { transRef: string; from?: string } = { transRef };
  const from = route.query.from;
  if (
    from === "invoices" ||
    from === "cheque-collection" ||
    from === "settings-logs" ||
    from === "overdue"
  ) {
    q.from = from;
  }
  return { name: "entry" as const, query: q };
}

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement | null;
  const inInput =
    target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
  const isMod = e.metaKey || e.ctrlKey;

  if (e.key === "?" && !inInput) {
    e.preventDefault();
    if (showAppLayout.value) shortcutsCheatsheetStore.toggle();
    return;
  }
  if (isMod && e.key === "k") {
    e.preventDefault();
    if (showAppLayout.value && documentSettings.commandPaletteEnabled)
      paletteStore.toggle();
    return;
  }
  if (isMod && e.key === "n") {
    e.preventDefault();
    if (showAppLayout.value && showForManager.value && !paletteStore.visible) {
      router.push("/entry");
    }
    return;
  }
  // Booklet prev/next: ⌘← / ⌘→ (Mac) or Ctrl+Left / Ctrl+Right (Win/Linux)
  if (isMod && (e.key === "ArrowLeft" || e.key === "ArrowRight")) {
    if (
      showAppLayout.value &&
      documentSettings.bookletEnabled &&
      !paletteStore.visible &&
      route.name === "entry" &&
      booklet.count > 1 &&
      !inInput
    ) {
      if (e.key === "ArrowLeft" && booklet.hasPrev) {
        e.preventDefault();
        booklet.goPrev();
        const ref = booklet.currentTransRef;
        if (ref) router.push(entryQuery(ref));
      } else if (e.key === "ArrowRight" && booklet.hasNext) {
        e.preventDefault();
        booklet.goNext();
        const ref = booklet.currentTransRef;
        if (ref) router.push(entryQuery(ref));
      }
    }
    return;
  }
}

function handleOpenConnection() {
  showConnectionModal.value = true;
}

onMounted(async () => {
  await router.isReady();
  routerReady.value = true;
  document.addEventListener("keydown", handleKeydown);
  window.addEventListener("open-connection-modal", handleOpenConnection);
});

onUnmounted(() => {
  document.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("open-connection-modal", handleOpenConnection);
});
</script>

<style scoped>
.app__loader {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: linear-gradient(180deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
}
</style>
