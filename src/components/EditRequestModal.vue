<template>
  <Teleport to="body">
    <Transition name="edit-request-modal">
      <div
        v-if="visible"
        class="edit-request-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-request-modal-title"
        aria-describedby="edit-request-modal-desc"
      >
        <!-- Do not close on backdrop click: user must choose Dismiss or Proceed -->
        <div class="edit-request-modal" role="document" @click.stop>
          <header class="edit-request-modal__header">
            <div class="edit-request-modal__header-inner">
              <div class="edit-request-modal__icon" aria-hidden="true">
                <svg
                  class="edit-request-modal__icon-svg"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </div>
              <h2 id="edit-request-modal-title" class="edit-request-modal__title">
                Request to edit posted entry
              </h2>
            </div>
            <button
              type="button"
              class="edit-request-modal__close"
              aria-label="Dismiss"
              @click="emit('dismiss')"
            >
              <svg
                class="edit-request-modal__close-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>
          <div class="edit-request-modal__body">
            <p id="edit-request-modal-desc" class="edit-request-modal__desc">
              <strong class="edit-request-modal__name">{{ requestedBy || "Officer" }}</strong>
              requested to edit this entry (posted by mistake). Allow them to edit by clicking Proceed; the entry will return to draft and they can make changes and post again.
            </p>
          </div>
          <footer class="edit-request-modal__footer">
            <button
              type="button"
              class="edit-request-modal__btn edit-request-modal__btn--secondary"
              @click="emit('dismiss')"
            >
              Dismiss
            </button>
            <button
              type="button"
              class="edit-request-modal__btn edit-request-modal__btn--primary"
              :disabled="proceeding"
              @click="emit('proceed')"
            >
              {{ proceeding ? "Proceeding…" : "Proceed" }}
            </button>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean;
  requestedBy?: string | null;
  proceeding?: boolean;
}>();

const emit = defineEmits<{ dismiss: []; proceed: [] }>();
</script>

<style scoped>
.edit-request-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.78);
  backdrop-filter: blur(12px);
  /* Backdrop does not close modal: no click handler */
}

.edit-request-modal {
  width: 100%;
  max-width: 28rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.edit-request-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.edit-request-modal__header-inner {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
}

.edit-request-modal__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 12px;
  background: rgba(14, 165, 233, 0.15);
  color: var(--color-accent, #0ea5e9);
}

.edit-request-modal__icon-svg {
  width: 1.375rem;
  height: 1.375rem;
}

.edit-request-modal__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
  line-height: 1.3;
}

.edit-request-modal__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;
}

.edit-request-modal__close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}

.edit-request-modal__close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.edit-request-modal__body {
  padding: 1.5rem 1.5rem;
  flex: 1;
  min-height: 0;
}

.edit-request-modal__desc {
  margin: 0;
  font-size: var(--label-size);
  color: var(--color-text-muted);
  line-height: 1.6;
}

.edit-request-modal__name {
  color: var(--color-text);
  font-weight: 600;
}

.edit-request-modal__footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px solid var(--color-border);
  background: rgba(0, 0, 0, 0.15);
  flex-shrink: 0;
}

.edit-request-modal__btn {
  min-width: 5.5rem;
  padding: 0.625rem 1.25rem;
  font-size: var(--label-size);
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: opacity 0.2s, background-color 0.2s, color 0.2s;
}

.edit-request-modal__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-request-modal__btn--secondary {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-muted);
}

.edit-request-modal__btn--secondary:hover {
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-text);
}

.edit-request-modal__btn--primary {
  background: var(--color-accent, #0ea5e9);
  color: #fff;
}

.edit-request-modal__btn--primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

/* Transition */
.edit-request-modal-enter-active,
.edit-request-modal-leave-active {
  transition: opacity 0.2s ease;
}

.edit-request-modal-enter-active .edit-request-modal,
.edit-request-modal-leave-active .edit-request-modal {
  transition: transform 0.25s ease;
}

.edit-request-modal-enter-from,
.edit-request-modal-leave-to {
  opacity: 0;
}

.edit-request-modal-enter-from .edit-request-modal,
.edit-request-modal-leave-to .edit-request-modal {
  transform: scale(0.96) translateY(-12px);
}
</style>
