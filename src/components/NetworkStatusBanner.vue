<template>
  <div
    v-if="!isOnline && !dismissed"
    class="network-banner"
    :class="{ 'network-banner--light': isLight }"
    role="status"
    aria-live="polite"
  >
    <div class="network-banner__inner">
      <span class="network-banner__icon" aria-hidden="true">
        <svg
          class="network-banner__icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M2 2l20 20" />
          <path d="M8.5 16.5a5 5 0 0 1 7 0" />
          <path d="M5 13a10 10 0 0 1 14 0" />
          <path d="M1.5 9.5a15 15 0 0 1 12-4.5" />
          <path d="M22.5 9.5a15 15 0 0 0-3-2.5" />
          <path d="M12 20h0" />
        </svg>
      </span>
      <div class="network-banner__content">
        <strong class="network-banner__title">You’re offline</strong>
        <span class="network-banner__text"
          >Some actions may fail until your connection returns.</span
        >
      </div>
      <button
        type="button"
        class="network-banner__btn"
        @click="dismissed = true"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useNetworkStatus } from "../composables/useNetworkStatus";
import { useThemeStore } from "../stores/themeStore";

const { isOnline } = useNetworkStatus();
const dismissed = ref(false);
const themeStore = useThemeStore();
const isLight = computed(() => themeStore.appearance === "light");
const wentOffline = ref(false);
const reloading = ref(false);

watch(isOnline, (online) => {
  if (!online) wentOffline.value = true;
  if (online) {
    dismissed.value = false;
    if (wentOffline.value && !reloading.value) {
      reloading.value = true;
      // Give the browser a moment to fully restore connectivity.
      window.setTimeout(() => window.location.reload(), 350);
    }
  }
});
</script>

<style scoped>
.network-banner {
  position: sticky;
  top: 0;
  z-index: 250;
  padding: 0.5rem 1rem;
  background: rgba(127, 29, 29, 0.25);
  border-bottom: 1px solid rgba(239, 68, 68, 0.25);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.network-banner--light {
  /* Solid red background, black text (per request) */
  background: #dc2626;
  border-bottom-color: rgba(127, 29, 29, 0.65);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.18);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.network-banner__inner {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.network-banner__icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.18);
  border: 1px solid rgba(239, 68, 68, 0.22);
  color: rgba(254, 202, 202, 0.95);
  flex: 0 0 auto;
}

.network-banner__icon-svg {
  width: 1.125rem;
  height: 1.125rem;
}

.network-banner__content {
  min-width: 0;
  display: flex;
  gap: 0.35rem;
  align-items: baseline;
  flex-wrap: wrap;
}

.network-banner__title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: rgba(254, 202, 202, 0.95);
}

.network-banner__text {
  font-size: 0.8125rem;
  color: rgba(254, 202, 202, 0.8);
}

.network-banner__btn {
  margin-left: auto;
  flex: 0 0 auto;
  border: 1px solid rgba(254, 202, 202, 0.25);
  background: rgba(15, 23, 42, 0.25);
  color: rgba(254, 202, 202, 0.95);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  cursor: pointer;
}

.network-banner__btn:hover {
  background: rgba(15, 23, 42, 0.35);
}

.network-banner--light .network-banner__icon {
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
}

.network-banner--light .network-banner__title {
  color: #ffffff;
}

.network-banner--light .network-banner__text {
  color: rgba(255, 255, 255, 0.92);
}

.network-banner--light .network-banner__btn {
  border-color: rgba(255, 255, 255, 0.35);
  background: rgba(255, 255, 255, 0.18);
  color: #ffffff;
}

.network-banner--light .network-banner__btn:hover {
  background: rgba(255, 255, 255, 0.24);
}
</style>

