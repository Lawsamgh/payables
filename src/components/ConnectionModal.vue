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
        <p v-if="!hasBaseUrl" class="mb-4 text-[var(--label-size)] text-[var(--color-text-muted)]">
          Set <code class="rounded bg-white/10 px-1">VITE_FILEMAKER_BASE_URL</code> in <code class="rounded bg-white/10 px-1">.env</code> to enable FileMaker.
        </p>
        <template v-else>
          <p v-if="error" class="mb-3 text-sm text-red-400">{{ error }}</p>
          <form class="flex flex-col gap-3" @submit.prevent="submit">
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
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useFileMaker } from '../composables/useFileMaker'

const props = withDefaults(defineProps<{ visible?: boolean }>(), { visible: false })
const emit = defineEmits<{ close: []; connected: [] }>()

const { login, error: fmError, hasBaseUrl } = useFileMaker()
const username = ref((import.meta.env?.VITE_FILEMAKER_USER as string) || '')
const password = ref((import.meta.env?.VITE_FILEMAKER_PASSWORD as string) || '')
const connecting = ref(false)
const error = ref<string | null>(null)

watch(
  () => props.visible,
  (v) => {
    if (v) {
      error.value = fmError.value || null
      if (!hasBaseUrl.value) error.value = null
    }
  }
)

watch(fmError, (e) => {
  error.value = e || null
})

async function submit() {
  if (!username.value.trim() || !password.value) {
    error.value = 'Enter username and password'
    return
  }
  connecting.value = true
  error.value = null
  const ok = await login({ username: username.value.trim(), password: password.value })
  connecting.value = false
  if (ok) {
    emit('connected')
    close()
  } else {
    error.value = fmError.value || 'Login failed'
  }
}

function close() {
  emit('close')
}
</script>
