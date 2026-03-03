<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="loading-overlay"
      role="alert"
      aria-busy="true"
      aria-live="polite"
    >
      <div class="loading-overlay__content">
        <div class="loading-overlay__spinner" aria-hidden="true" />
        <p class="loading-overlay__label">{{ message }}</p>
        <p v-if="hint" class="loading-overlay__hint">{{ hint }}</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { storeToRefs } from "pinia";
import { useLoadingOverlayStore } from "../stores/loadingOverlayStore";

const overlay = useLoadingOverlayStore();
const { visible, message, hint } = storeToRefs(overlay);
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  pointer-events: all;
}

.loading-overlay__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  background: rgba(30, 41, 59, 0.9);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4);
}

.loading-overlay__spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(148, 163, 184, 0.3);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: loading-overlay-spin 0.8s linear infinite;
}

.loading-overlay__label {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0;
}

.loading-overlay__hint {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin: 0;
}

@keyframes loading-overlay-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
