<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="add-email-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-email-title"
    >
      <div class="add-email-modal">
        <header class="add-email-modal__header">
          <div class="add-email-modal__header-inner">
            <div class="add-email-modal__icon" aria-hidden="true">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 id="add-email-title" class="add-email-modal__title">Add notification recipient</h2>
              <p class="add-email-modal__subtitle">Add an email address to the list of people who can receive notification mails</p>
            </div>
          </div>
          <button
            type="button"
            class="add-email-modal__close"
            aria-label="Close"
            @click="close"
          >
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>

        <div v-if="formError" class="add-email-modal__error" role="alert">
          <svg class="add-email-modal__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{{ formError }}</span>
        </div>

        <form class="add-email-modal__form" @submit.prevent="submit">
          <div class="add-email-modal__fields">
            <label class="add-email-modal__field">
              <span class="add-email-modal__label">Email <span class="add-email-modal__required">*</span></span>
              <input
                v-model="email"
                type="email"
                class="add-email-modal__input"
                placeholder="hod@example.com"
                autocomplete="email"
              />
            </label>
            <label class="add-email-modal__field">
              <span class="add-email-modal__label">Label <span class="add-email-modal__required">*</span></span>
              <input
                v-model="label"
                type="text"
                class="add-email-modal__input"
                placeholder="e.g. Head of Department"
                autocomplete="off"
              />
            </label>
          </div>
          <div class="add-email-modal__actions">
            <button type="button" class="add-email-modal__btn-cancel" @click="close">Cancel</button>
            <button type="submit" class="add-email-modal__btn-submit" :disabled="saving">
              {{ saving ? 'Adding…' : 'Add recipient' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useEmailListStore } from '../stores/emailListStore'
import { useToastStore } from '../stores/toastStore'

const props = withDefaults(defineProps<{ visible?: boolean }>(), { visible: false })
const emit = defineEmits<{ close: []; added: [email: string] }>()

const emailList = useEmailListStore()
const toast = useToastStore()

const email = ref('')
const label = ref('')
const formError = ref<string | null>(null)
const saving = ref(false)

watch(
  () => props.visible,
  (v) => {
    if (!v) {
      email.value = ''
      label.value = ''
      formError.value = null
    }
  }
)

function close() {
  emit('close')
}

function validate(): string | null {
  const e = email.value.trim()
  if (!e) return 'Email is required.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return 'Please enter a valid email address.'
  const l = label.value.trim()
  if (!l) return 'Label is required.'
  return null
}

async function submit() {
  if (saving.value) return
  formError.value = null
  const err = validate()
  if (err) {
    formError.value = err
    return
  }
  saving.value = true
  try {
    const { error } = await emailList.createEmail(email.value.trim(), label.value.trim())
    if (error) {
      formError.value = error
      return
    }
    toast.success('Email added to list.')
    const addedEmail = email.value.trim()
    close()
    emit('added', addedEmail)
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.add-email-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(8px);
  animation: addEmailFadeIn 0.2s ease;
}

@keyframes addEmailFadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.add-email-modal {
  width: 100%;
  max-width: 600px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
  overflow: hidden;
  animation: addEmailSlide 0.25s ease;
}

@keyframes addEmailSlide {
  from {
    opacity: 0;
    transform: translateY(-16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.add-email-modal__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid var(--color-border);
}

.add-email-modal__header-inner {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
  min-width: 0;
}

.add-email-modal__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 14px;
  background: rgba(59, 130, 246, 0.15);
  color: rgb(96, 165, 250);
}

.add-email-modal__icon svg {
  width: 1.375rem;
  height: 1.375rem;
}

.add-email-modal__title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
  line-height: 1.3;
}

.add-email-modal__subtitle {
  margin: 0.375rem 0 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.45;
}

.add-email-modal__close {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-email-modal__close:hover {
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text);
}

.add-email-modal__close svg {
  width: 1.25rem;
  height: 1.25rem;
}

.add-email-modal__error {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  margin: 0 1.75rem;
  padding: 1rem 1.25rem;
  font-size: 0.9375rem;
  line-height: 1.4;
  color: rgb(254, 202, 202);
  background: rgba(239, 68, 68, 0.12);
  border-radius: 12px;
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.add-email-modal__error-icon {
  flex-shrink: 0;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.0625rem;
  color: rgb(248, 113, 113);
}

.add-email-modal__form {
  padding: 1.75rem;
}

.add-email-modal__fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.add-email-modal__field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.add-email-modal__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.add-email-modal__required {
  color: rgb(248, 113, 113);
}

.add-email-modal__input {
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 0.9375rem;
  color: var(--color-text);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.add-email-modal__input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.8;
}

.add-email-modal__input:hover {
  border-color: rgba(148, 163, 184, 0.25);
}

.add-email-modal__input:focus {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px var(--color-accent-soft);
}

.add-email-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
}

.add-email-modal__btn-cancel {
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text-muted);
  background: transparent;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-email-modal__btn-cancel:hover {
  background: rgba(255, 255, 255, 0.04);
  color: var(--color-text);
}

.add-email-modal__btn-submit {
  padding: 0.625rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 600;
  color: white;
  background: var(--color-accent);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.add-email-modal__btn-submit:hover:not(:disabled) {
  opacity: 0.95;
  transform: translateY(-1px);
}

.add-email-modal__btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
</style>
