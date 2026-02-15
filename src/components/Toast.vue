<template>
  <Teleport to="body">
    <div
      class="toast-container"
      aria-live="polite"
      aria-atomic="true"
    >
      <TransitionGroup name="toast">
        <div
          v-for="t in toastStore.items"
          :key="t.id"
          class="toast"
          :class="`toast--${t.type}`"
          role="status"
          @click="toastStore.dismiss(t.id)"
        >
          <span v-if="t.type === 'success'" class="toast-icon toast-icon--success" aria-hidden="true">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </span>
          <span v-else-if="t.type === 'error'" class="toast-icon toast-icon--error" aria-hidden="true">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </span>
          <span v-else class="toast-icon toast-icon--info" aria-hidden="true">
            <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span class="toast-message">{{ t.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToastStore } from '../stores/toastStore'

const toastStore = useToastStore()
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  pointer-events: none;
}

.toast-container > * {
  pointer-events: auto;
}

/* Apple-style toast: frosted pill, subtle shadow */
.toast {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem 0.625rem 0.75rem;
  min-height: 2.25rem;
  max-width: min(calc(100vw - 2rem), 22rem);
  background: rgba(30, 41, 59, 0.95);
  backdrop-filter: blur(40px);
  -webkit-backdrop-filter: blur(40px);
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 12px;
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.25),
    0 0 1px rgba(255, 255, 255, 0.08) inset;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #ffffff;
  cursor: default;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease;
}

.toast:hover {
  transform: scale(1.02);
}

.toast--success {
  border-color: rgba(34, 197, 94, 0.35);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(34, 197, 94, 0.1);
}

.toast--error {
  border-color: rgba(239, 68, 68, 0.35);
  box-shadow:
    0 4px 24px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(239, 68, 68, 0.1);
}

.toast-icon {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.toast-icon--success {
  color: #22c55e;
}

.toast-icon--error {
  color: #ef4444;
}

.toast-icon--info {
  color: rgba(203, 213, 225, 1);
}

.toast-message {
  line-height: 1.4;
  word-break: break-word;
  color: #ffffff;
  letter-spacing: 0.01em;
}

/* Enter/leave transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(0.5rem) scale(0.96);
}

.toast-move {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
