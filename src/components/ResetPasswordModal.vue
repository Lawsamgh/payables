<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="tax-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-password-title"
    >
      <div class="tax-modal">
        <header class="tax-modal__header">
          <h2 id="reset-password-title" class="tax-modal__title">Reset password</h2>
          <button type="button" class="tax-modal__close" aria-label="Close" @click="close">
            <svg class="tax-modal__close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </header>
        <div v-if="formError" class="tax-modal__error" role="alert">
          <svg class="tax-modal__error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="tax-modal__error-text">{{ formError }}</span>
        </div>
        <form class="tax-modal__form" @submit.prevent="submit">
          <section class="tax-modal__section">
            <label class="tax-modal__label">
              <span>Current password</span>
              <input
                v-model="currentPassword"
                type="password"
                class="glass-input w-full px-3 py-2.5 rounded-lg"
                placeholder="Enter current password"
                autocomplete="current-password"
              />
            </label>
            <label class="tax-modal__label">
              <span>New password</span>
              <input
                v-model="newPassword"
                type="password"
                class="glass-input w-full px-3 py-2.5 rounded-lg"
                placeholder="Enter new password"
                autocomplete="new-password"
              />
            </label>
            <label class="tax-modal__label">
              <span>Confirm new password</span>
              <input
                v-model="confirmPassword"
                type="password"
                class="glass-input w-full px-3 py-2.5 rounded-lg"
                placeholder="Confirm new password"
                autocomplete="new-password"
              />
            </label>
          </section>
          <div class="tax-modal__actions">
            <button type="button" class="tax-modal__btn-cancel" @click="close">Cancel</button>
            <button type="submit" class="tax-modal__btn-submit" :disabled="saving">
              {{ saving ? 'Changing…' : 'Change password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useFileMaker } from '../composables/useFileMaker'
import { LAYOUTS } from '../utils/filemakerApi'
import { useToastStore } from '../stores/toastStore'

const props = withDefaults(defineProps<{ visible?: boolean }>(), { visible: false })
const emit = defineEmits<{ close: [] }>()

const router = useRouter()
const { runScript, logout } = useFileMaker()
const toast = useToastStore()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const formError = ref<string | null>(null)
const saving = ref(false)

const MIN_PASSWORD_LENGTH = 6

/** FileMaker script error codes: 0 = no error, others = failure. */
const FILEMAKER_ERROR_MESSAGES: Record<string, string> = {
  '0': '', // No error
  '212': 'Current password is incorrect. Please try again.',
  '213': 'User account or password does not exist. Please try again.',
  '307': 'New password is not allowed. Please choose a different password.',
  '718': 'Password does not meet requirements. Please choose a different password.',
}

/** Map FileMaker script error code or raw message to a clear message for the user. */
function friendlyPasswordError(codeOrMessage: string): string {
  const trimmed = codeOrMessage.trim()
  if (FILEMAKER_ERROR_MESSAGES[trimmed] !== undefined) {
    return FILEMAKER_ERROR_MESSAGES[trimmed]
  }
  const lower = trimmed.toLowerCase()
  if (lower.includes('212') || (lower.includes('invalid') && (lower.includes('password') || lower.includes('account')))) {
    return FILEMAKER_ERROR_MESSAGES['212']
  }
  if (lower.includes('213')) return FILEMAKER_ERROR_MESSAGES['213']
  if (lower.includes('307') || lower.includes('718')) return FILEMAKER_ERROR_MESSAGES['307']
  return trimmed || 'Something went wrong. Please try again.'
}

watch(
  () => props.visible,
  (v) => {
    if (!v) {
      currentPassword.value = ''
      newPassword.value = ''
      confirmPassword.value = ''
      formError.value = null
    }
  }
)

function close() {
  emit('close')
}

function validate(): string | null {
  if (!currentPassword.value.trim()) return 'Enter your current password.'
  if (!newPassword.value.trim()) return 'Enter a new password.'
  if (newPassword.value.length < MIN_PASSWORD_LENGTH) {
    return `New password must be at least ${MIN_PASSWORD_LENGTH} characters.`
  }
  if (newPassword.value !== confirmPassword.value) return 'New password and confirmation do not match.'
  return null
}

async function submit() {
  if (saving.value) return
  formError.value = null
  const err = validate()
  if (err) {
    toast.error(err)
    formError.value = null
    return
  }
  saving.value = true
  try {
    const scriptParam = JSON.stringify({
      currentPassword: currentPassword.value.trim(),
      newPassword: newPassword.value.trim(),
    })
    const { error, scriptResult, scriptError } = await runScript(LAYOUTS.PAYABLES_USERS, 'ChangePassword', scriptParam)
    const code = (scriptError ?? '0').trim()
    const isSuccess = code === '0'
    if (!isSuccess) {
      const message = friendlyPasswordError(code)
      toast.error(message || (error ?? `Script error: ${code}`))
      formError.value = null
      return
    }
    const customMessage = scriptResult?.trim()
    if (customMessage && customMessage !== '0') {
      toast.error(friendlyPasswordError(customMessage))
      formError.value = null
      return
    }
    toast.success('Password changed. Please sign in again.')
    close()
    logout()
    router.push({ path: '/' })
  } finally {
    saving.value = false
  }
}
</script>
