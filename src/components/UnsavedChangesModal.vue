<template>
  <Teleport to="body">
    <Transition name="unsaved-modal">
      <div
        v-if="visible"
        class="unsaved-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="unsaved-modal-title"
        aria-describedby="unsaved-modal-desc"
      >
        <div class="unsaved-modal">
          <div class="unsaved-modal__icon-wrap">
            <svg
              class="unsaved-modal__icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 id="unsaved-modal-title" class="unsaved-modal__title">
            Unsaved changes
          </h2>
          <p id="unsaved-modal-desc" class="unsaved-modal__message">
            You have unsaved changes. Leave anyway?
          </p>
          <div class="unsaved-modal__actions">
            <button
              type="button"
              class="unsaved-modal__btn unsaved-modal__btn--primary"
              @click="cancel"
            >
              Stay
            </button>
            <button
              type="button"
              class="unsaved-modal__btn unsaved-modal__btn--danger"
              @click="confirm"
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean }>()
const emit = defineEmits<{ confirm: []; cancel: [] }>()

function confirm() {
  emit('confirm')
}

function cancel() {
  emit('cancel')
}
</script>

<style scoped>
.unsaved-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(12px);
}

.unsaved-modal {
  width: 100%;
  max-width: 22rem;
  padding: 1.75rem 1.5rem;
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  text-align: center;
}

.unsaved-modal__icon-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3.5rem;
  height: 3.5rem;
  margin: 0 auto 1.25rem;
  background: rgba(245, 158, 11, 0.12);
  border-radius: 50%;
}

.unsaved-modal__icon {
  width: 1.75rem;
  height: 1.75rem;
  color: #f59e0b;
}

.unsaved-modal__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.unsaved-modal__message {
  margin: 0 0 1.5rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-text-muted);
}

.unsaved-modal__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.unsaved-modal__btn {
  min-width: 5.5rem;
  padding: 0.625rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
}

.unsaved-modal__btn--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.35);
}

.unsaved-modal__btn--primary:hover {
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.unsaved-modal__btn--primary:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.9), 0 0 0 4px rgba(59, 130, 246, 0.5);
}

.unsaved-modal__btn--danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.unsaved-modal__btn--danger:hover {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.unsaved-modal__btn--danger:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.9), 0 0 0 4px rgba(239, 68, 68, 0.5);
}

/* Transition */
.unsaved-modal-enter-active,
.unsaved-modal-leave-active {
  transition: opacity 0.2s ease;
}

.unsaved-modal-enter-active .unsaved-modal,
.unsaved-modal-leave-active .unsaved-modal {
  transition: transform 0.2s ease;
}

.unsaved-modal-enter-from,
.unsaved-modal-leave-to {
  opacity: 0;
}

.unsaved-modal-enter-from .unsaved-modal,
.unsaved-modal-leave-to .unsaved-modal {
  transform: scale(0.96) translateY(-8px);
}
</style>
