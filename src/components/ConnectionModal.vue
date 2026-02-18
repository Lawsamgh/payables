<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style="background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);"
      @click.self="close"
    >
      <div
        class="glass w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border)] p-6 shadow-xl"
        role="dialog"
        aria-labelledby="connection-title"
      >
        <h2 id="connection-title" class="mb-4 text-lg font-semibold text-[var(--color-text)]">
          FileMaker connection
        </h2>
        <p class="mb-3 text-[var(--label-size)] text-[var(--color-text-muted)]">
          Connect to the FileMaker database (not your app sign-in). Use your FileMaker account.
        </p>
        <p v-if="!hasBaseUrl" class="mb-3 text-[var(--label-size)] text-[var(--color-text-muted)]">
          No base URL in .env — enter it below (or set <code class="rounded bg-white/10 px-1">VITE_FILEMAKER_BASE_URL</code> and restart dev server).
        </p>
        <p v-if="error" class="mb-3 min-h-[2.5rem] break-words text-sm text-red-400">{{ error }}</p>
        <p v-if="error && hasBaseUrl" class="mb-3 text-xs text-[var(--color-text-muted)]">
          If the request is blocked, use the Vite proxy: in .env set <code class="rounded bg-white/10 px-1">VITE_FILEMAKER_BASE_URL</code> to <code class="rounded bg-white/10 px-1">http://localhost:5173/fmi/data/v1/databases/PGH_Item_Distribution</code> and <code class="rounded bg-white/10 px-1">VITE_FILEMAKER_PROXY_TARGET</code> to your FileMaker host, then restart the dev server.
        </p>
        <form class="flex flex-col gap-3" @submit.prevent="submit">
          <label v-if="!hasBaseUrl" class="block">
            <span class="mb-1 block text-[var(--label-size)] text-[var(--color-text-muted)]">FileMaker base URL <span class="text-red-400">*</span></span>
            <input
              v-model="baseUrlInput"
              type="url"
              placeholder="https://host/fmi/data/v1/databases/PGH_Item_Distribution"
              class="glass-input w-full px-3 py-2 text-[var(--input-size)]"
              autocomplete="url"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-[var(--label-size)] text-[var(--color-text-muted)]">Username</span>
            <input
              v-model="username"
              type="text"
              class="glass-input w-full px-3 py-2 text-[var(--input-size)]"
              autocomplete="username"
            />
          </label>
          <label class="block">
            <span class="mb-1 block text-[var(--label-size)] text-[var(--color-text-muted)]">Password</span>
            <input
              v-model="password"
              type="password"
              class="glass-input w-full px-3 py-2 text-[var(--input-size)]"
              autocomplete="current-password"
            />
          </label>
          <div class="mt-2 flex justify-end gap-2">
            <button type="button" class="pill-btn px-4 py-2 text-[var(--color-text-muted)]" @click="close">
              Cancel
            </button>
            <button
              type="submit"
              class="pill-btn bg-[var(--color-accent)] px-4 py-2 text-white hover:opacity-90"
              :disabled="connecting"
            >
              {{ connecting ? 'Connecting…' : 'Connect' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFileMaker } from '../composables/useFileMaker'
import { useToastStore } from '../stores/toastStore'
import { setSessionBaseUrl } from '../utils/filemakerApi'

const toast = useToastStore()

const props = withDefaults(defineProps<{ visible?: boolean }>(), { visible: false })
const emit = defineEmits<{ close: []; connected: [] }>()

const { login, error: fmError, hasBaseUrl } = useFileMaker()
const baseUrlInput = ref('')
const username = ref((import.meta.env?.VITE_FILEMAKER_USER as string) || '')
const password = ref((import.meta.env?.VITE_FILEMAKER_PASSWORD as string) || '')
const connecting = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.visible,
  (v) => {
    if (v) {
      error.value = fmError.value || null
    }
  }
)

watch(fmError, (e) => {
  error.value = e || null
})

async function submit() {
  const effectiveBaseUrl = hasBaseUrl.value ? null : baseUrlInput.value?.trim()
  if (!effectiveBaseUrl && !hasBaseUrl.value) {
    toast.error('Enter FileMaker base URL (e.g. https://host/fmi/data/v1/databases/PGH_Item_Distribution)')
    error.value = null
    return
  }
  if (!username.value.trim() || !password.value) {
    toast.error('Enter username and password')
    error.value = null
    return
  }
  if (effectiveBaseUrl) {
    setSessionBaseUrl(effectiveBaseUrl)
  }
  connecting.value = true
  error.value = null
  const ok = await login({ username: username.value.trim(), password: password.value })
  connecting.value = false
  if (ok) {
    emit('connected')
    close()
  } else {
    toast.error(fmError.value || 'Login failed')
    error.value = null
  }
}

function close() {
  emit('close')
}
</script>
