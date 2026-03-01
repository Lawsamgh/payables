<template>
  <Teleport to="body">
    <Transition name="logout-modal">
      <div
        v-if="visible"
        class="logout-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-describedby="logout-modal-desc"
      >
        <div class="logout-modal">
          <p id="logout-modal-desc" class="logout-modal__message">
            Are you sure you want to log out?
          </p>
          <div class="logout-modal__actions">
            <button
              type="button"
              class="logout-modal__btn logout-modal__btn--cancel"
              @click="cancel"
            >
              No
            </button>
            <button
              type="button"
              class="logout-modal__btn logout-modal__btn--confirm"
              @click="confirm"
            >
              Yes
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
.logout-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 1.5rem;
  padding-left: 1rem;
  padding-right: 1rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
}

.logout-modal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
  max-width: 36rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(180deg, rgba(30, 41, 59, 0.98) 0%, rgba(15, 23, 42, 0.98) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.03) inset;
}

.logout-modal__message {
  margin: 0;
  font-size: 1rem;
  font-weight: 500;
  color: var(--color-text);
  flex: 1;
}

.logout-modal__actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.logout-modal__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.5rem;
  font-size: var(--label-size);
  font-weight: 600;
  border-radius: 12px;
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease, transform 0.1s ease;
}

.logout-modal__btn--cancel {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--color-text-muted);
}

.logout-modal__btn--cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.18);
  color: var(--color-text);
}

.logout-modal__btn--cancel:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-bg-card), 0 0 0 4px rgba(148, 163, 184, 0.4);
}

.logout-modal__btn--confirm {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border: none;
  color: white;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.35);
}

.logout-modal__btn--confirm:hover {
  background: linear-gradient(135deg, #34d399 0%, #10b981 100%);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.logout-modal__btn--confirm:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--color-bg-card), 0 0 0 4px rgba(16, 185, 129, 0.5);
}

/* Transition */
.logout-modal-enter-active,
.logout-modal-leave-active {
  transition: opacity 0.2s ease;
}

.logout-modal-enter-active .logout-modal,
.logout-modal-leave-active .logout-modal {
  transition: transform 0.2s ease;
}

.logout-modal-enter-from,
.logout-modal-leave-to {
  opacity: 0;
}

.logout-modal-enter-from .logout-modal,
.logout-modal-leave-to .logout-modal {
  transform: scale(0.96) translateY(-8px);
}
</style>
