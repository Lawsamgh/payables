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
              class="pill-btn glass-input inline-flex items-center justify-center gap-2 !rounded-xl border border-[var(--color-border)] bg-white/5 px-6 py-2.5 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] transition-colors hover:bg-white/10 hover:text-[var(--color-text)]"
              @click="cancel"
            >
              No
            </button>
            <button
              type="button"
              class="pill-btn inline-flex items-center justify-center gap-2 !rounded-xl border-0 bg-emerald-600 px-6 py-2.5 text-[var(--label-size)] font-medium text-white transition-colors hover:bg-emerald-500"
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
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.35);
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
