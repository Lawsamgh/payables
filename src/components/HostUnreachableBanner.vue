<template>
  <div
    v-if="hostUnreachable && isOnline && !dismissed"
    class="host-unreachable-banner"
    :class="{ 'host-unreachable-banner--light': isLight }"
    role="status"
    aria-live="polite"
  >
    <div class="host-unreachable-banner__inner">
      <span class="host-unreachable-banner__icon" aria-hidden="true">
        <svg
          class="host-unreachable-banner__icon-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </span>
      <div class="host-unreachable-banner__content">
        <strong class="host-unreachable-banner__title"
          >FileMaker server unreachable</strong
        >
        <span class="host-unreachable-banner__text"
          >Saves and posts may fail until the server is back.</span
        >
      </div>
      <button
        type="button"
        class="host-unreachable-banner__btn"
        @click="dismissed = true"
      >
        Dismiss
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useHostReachability } from "../composables/useHostReachability";
import { useNetworkStatus } from "../composables/useNetworkStatus";
import { useThemeStore } from "../stores/themeStore";

const props = defineProps<{
  enabled: boolean;
}>();

const { hostUnreachable } = useHostReachability(() => props.enabled);
const { isOnline } = useNetworkStatus();
const dismissed = ref(false);
const themeStore = useThemeStore();
const isLight = computed(() => themeStore.appearance === "light");

watch(hostUnreachable, (unreachable) => {
  if (!unreachable) dismissed.value = false;
});
</script>

<style scoped>
.host-unreachable-banner {
  position: sticky;
  top: 0;
  z-index: 249;
  padding: 0.5rem 1rem;
  background: rgba(180, 83, 9, 0.25);
  border-bottom: 1px solid rgba(217, 119, 6, 0.35);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.host-unreachable-banner--light {
  background: #ea580c;
  border-bottom-color: rgba(194, 65, 12, 0.5);
  box-shadow: 0 14px 32px rgba(15, 23, 42, 0.12);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.host-unreachable-banner__inner {
  max-width: 1600px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.host-unreachable-banner__icon {
  width: 2rem;
  height: 2rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(217, 119, 6, 0.2);
  border: 1px solid rgba(217, 119, 6, 0.35);
  color: rgba(254, 243, 199, 0.95);
  flex: 0 0 auto;
}

.host-unreachable-banner__icon-svg {
  width: 1.125rem;
  height: 1.125rem;
}

.host-unreachable-banner__content {
  min-width: 0;
  display: flex;
  gap: 0.35rem;
  align-items: baseline;
  flex-wrap: wrap;
}

.host-unreachable-banner__title {
  font-size: 0.8125rem;
  font-weight: 700;
  color: rgba(254, 243, 199, 0.95);
}

.host-unreachable-banner__text {
  font-size: 0.8125rem;
  color: rgba(254, 243, 199, 0.88);
}

.host-unreachable-banner__btn {
  margin-left: auto;
  flex: 0 0 auto;
  border: 1px solid rgba(254, 243, 199, 0.25);
  background: rgba(15, 23, 42, 0.25);
  color: rgba(254, 243, 199, 0.95);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  cursor: pointer;
}

.host-unreachable-banner__btn:hover {
  background: rgba(15, 23, 42, 0.35);
}

.host-unreachable-banner--light .host-unreachable-banner__icon {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
}

.host-unreachable-banner--light .host-unreachable-banner__title {
  color: #ffffff;
}

.host-unreachable-banner--light .host-unreachable-banner__text {
  color: rgba(255, 255, 255, 0.95);
}

.host-unreachable-banner--light .host-unreachable-banner__btn {
  border-color: rgba(255, 255, 255, 0.4);
  background: rgba(255, 255, 255, 0.2);
  color: #ffffff;
}

.host-unreachable-banner--light .host-unreachable-banner__btn:hover {
  background: rgba(255, 255, 255, 0.3);
}
</style>
