<template>
  <Teleport to="body">
    <Transition name="reject-modal">
      <div
        v-if="visible"
        class="reject-modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reject-modal-title"
        aria-describedby="reject-modal-desc"
      >
        <!-- Backdrop: no @click - user must use Cancel or Reject -->
        <div
          class="reject-modal"
          role="document"
          @click.stop
        >
          <header class="reject-modal__header">
            <h2 id="reject-modal-title" class="reject-modal__title">Reject entry</h2>
            <button
              type="button"
              class="reject-modal__close"
              aria-label="Cancel"
              @click="cancel"
            >
              <svg class="reject-modal__close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </header>
          <p id="reject-modal-desc" class="reject-modal__desc">
            Enter the reason the officer needs to address. This will be shown when they view the rejected entry.
          </p>
          <form class="reject-modal__form" @submit.prevent="submit">
            <label class="reject-modal__label" for="reject-reason-input">
              Reason
            </label>
            <textarea
              id="reject-reason-input"
              ref="textareaRef"
              v-model="localReason"
              class="reject-modal__textarea"
              placeholder="e.g. Wrong vendor name, missing invoice number, amount mismatch..."
              rows="4"
              autofocus
            />
            <p v-if="validationError" class="reject-modal__error" role="alert">
              {{ validationError }}
            </p>
            <div class="reject-modal__actions">
              <button
                type="button"
                class="reject-modal__btn reject-modal__btn--cancel"
                @click="cancel"
              >
                Cancel
              </button>
              <button
                type="submit"
                class="reject-modal__btn reject-modal__btn--danger"
                :disabled="submitting"
              >
                {{ submitting ? "Rejecting…" : "Reject" }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{ visible: boolean }>();
const emit = defineEmits<{ submit: [reason: string]; cancel: [] }>();

const localReason = ref("");
const validationError = ref("");
const submitting = ref(false);
const textareaRef = ref<HTMLTextAreaElement | null>(null);

watch(
  () => props.visible,
  (v) => {
    if (v) {
      localReason.value = "";
      validationError.value = "";
      submitting.value = false;
      requestAnimationFrame(() => {
        textareaRef.value?.focus();
      });
    }
  },
);

function cancel() {
  emit("cancel");
}

function submit() {
  const trimmed = localReason.value.trim();
  if (!trimmed) {
    validationError.value = "Please enter a reason for rejection.";
    return;
  }
  validationError.value = "";
  submitting.value = true;
  emit("submit", trimmed);
}

</script>

<style scoped>
.reject-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.72);
  backdrop-filter: blur(10px);
}

.reject-modal {
  width: 100%;
  max-width: 26rem;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow:
    0 24px 48px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
}

.reject-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-border);
}

.reject-modal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
}

.reject-modal__close {
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

.reject-modal__close:hover {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text);
}

.reject-modal__close-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.reject-modal__desc {
  margin: 0;
  padding: 1.25rem 1.5rem 0;
  font-size: var(--label-size);
  color: var(--color-text-muted);
  line-height: 1.5;
}

.reject-modal__form {
  padding: 1.25rem 1.5rem 1.5rem;
}

.reject-modal__label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text);
}

.reject-modal__textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: var(--label-size);
  font-family: inherit;
  line-height: 1.5;
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 10px;
  resize: vertical;
  min-height: 6rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.reject-modal__textarea::placeholder {
  color: var(--color-text-muted);
  opacity: 0.7;
}

.reject-modal__textarea:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.reject-modal__textarea:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.reject-modal__error {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  font-weight: 500;
  color: #f87171;
}

.reject-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.reject-modal__btn {
  min-width: 5.5rem;
  padding: 0.625rem 1.25rem;
  font-size: var(--label-size);
  font-weight: 600;
  border: none;
  border-radius: 9999px;
  cursor: pointer;
  transition: opacity 0.2s, background-color 0.2s;
}

.reject-modal__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.reject-modal__btn--cancel {
  background: rgba(255, 255, 255, 0.08);
  color: var(--color-text-muted);
}

.reject-modal__btn--cancel:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.12);
  color: var(--color-text);
}

.reject-modal__btn--danger {
  background: #ef4444;
  color: white;
}

.reject-modal__btn--danger:hover:not(:disabled) {
  background: #dc2626;
}

/* Transition */
.reject-modal-enter-active,
.reject-modal-leave-active {
  transition: opacity 0.2s ease;
}

.reject-modal-enter-active .reject-modal,
.reject-modal-leave-active .reject-modal {
  transition: transform 0.25s ease;
}

.reject-modal-enter-from,
.reject-modal-leave-to {
  opacity: 0;
}

.reject-modal-enter-from .reject-modal,
.reject-modal-leave-to .reject-modal {
  transform: scale(0.96) translateY(-10px);
}
</style>
