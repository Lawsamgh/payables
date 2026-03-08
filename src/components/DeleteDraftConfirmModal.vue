<template>
  <Teleport to="body">
    <Transition name="delete-draft-modal">
      <div
        v-if="visible"
        class="delete-draft-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-draft-modal-title"
        aria-describedby="delete-draft-modal-desc"
        @click.self="cancel"
      >
        <div class="delete-draft-modal">
          <div class="delete-draft-modal__icon-wrap">
            <svg
              class="delete-draft-modal__icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </div>
          <h2 id="delete-draft-modal-title" class="delete-draft-modal__title">
            Delete draft?
          </h2>
          <p id="delete-draft-modal-desc" class="delete-draft-modal__message">
            This draft entry will be permanently deleted. This cannot be undone.
          </p>
          <div class="delete-draft-modal__actions">
            <button
              type="button"
              class="delete-draft-modal__btn delete-draft-modal__btn--cancel"
              @click="cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              class="delete-draft-modal__btn delete-draft-modal__btn--danger"
              :disabled="deleting"
              @click="confirm"
            >
              {{ deleting ? "Deleting…" : "Delete draft" }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{ visible: boolean; deleting?: boolean }>();
const emit = defineEmits<{ confirm: []; cancel: [] }>();

function confirm() {
  emit("confirm");
}

function cancel() {
  emit("cancel");
}
</script>

<style scoped>
.delete-draft-modal-backdrop {
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

.delete-draft-modal {
  width: 100%;
  max-width: 22rem;
  padding: 1.75rem 1.5rem;
  background: linear-gradient(
    180deg,
    rgba(30, 41, 59, 0.98) 0%,
    rgba(15, 23, 42, 0.98) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.03) inset;
  text-align: center;
}

.delete-draft-modal__icon-wrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 3.5rem;
  height: 3.5rem;
  margin: 0 auto 1.25rem;
  background: rgba(239, 68, 68, 0.12);
  border-radius: 50%;
}

.delete-draft-modal__icon {
  width: 1.75rem;
  height: 1.75rem;
  color: #ef4444;
}

.delete-draft-modal__title {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.delete-draft-modal__message {
  margin: 0 0 1.5rem;
  font-size: 0.9375rem;
  line-height: 1.55;
  color: var(--color-text-muted);
}

.delete-draft-modal__actions {
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  flex-wrap: wrap;
}

.delete-draft-modal__btn {
  min-width: 5.5rem;
  padding: 0.625rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease,
    transform 0.1s ease;
}

.delete-draft-modal__btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.delete-draft-modal__btn--cancel {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: var(--color-text);
}

.delete-draft-modal__btn--cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.18);
}

.delete-draft-modal__btn--cancel:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px var(--color-bg-card),
    0 0 0 4px rgba(148, 163, 184, 0.4);
}

.delete-draft-modal__btn--danger {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.delete-draft-modal__btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

.delete-draft-modal__btn--danger:focus-visible {
  outline: none;
  box-shadow:
    0 0 0 2px rgba(15, 23, 42, 0.9),
    0 0 0 4px rgba(239, 68, 68, 0.5);
}

/* Transition */
.delete-draft-modal-enter-active,
.delete-draft-modal-leave-active {
  transition: opacity 0.2s ease;
}

.delete-draft-modal-enter-active .delete-draft-modal,
.delete-draft-modal-leave-active .delete-draft-modal {
  transition: transform 0.2s ease;
}

.delete-draft-modal-enter-from,
.delete-draft-modal-leave-to {
  opacity: 0;
}

.delete-draft-modal-enter-from .delete-draft-modal,
.delete-draft-modal-leave-to .delete-draft-modal {
  transform: scale(0.96) translateY(-8px);
}
</style>
