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
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
}

.unsaved-modal {
  width: 100%;
  max-width: 22rem;
  padding: 1.5rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
  text-align: center;
}

.unsaved-modal__icon-wrap {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.unsaved-modal__icon {
  width: 3rem;
  height: 3rem;
  color: var(--color-amber, #f59e0b);
}

.unsaved-modal__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
}

.unsaved-modal__message {
  margin: 0 0 1.5rem;
  font-size: var(--label-size);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.unsaved-modal__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.unsaved-modal__btn {
  min-width: 5.5rem;
  padding: 0.5rem 1.25rem;
  font-size: var(--label-size);
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: opacity 0.2s, background-color 0.2s;
}

.unsaved-modal__btn--primary {
  background: var(--color-accent);
  color: white;
}

.unsaved-modal__btn--primary:hover {
  opacity: 0.9;
}

.unsaved-modal__btn--danger {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
}

.unsaved-modal__btn--danger:hover {
  background: rgba(239, 68, 68, 0.25);
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
