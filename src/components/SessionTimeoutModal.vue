<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style="background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(8px);"
      role="alertdialog"
      aria-labelledby="session-timeout-title"
      aria-describedby="session-timeout-desc"
    >
      <div
        class="glass w-full max-w-sm rounded-[var(--radius-card)] border border-[var(--color-border)] p-6 shadow-xl"
      >
        <h2 id="session-timeout-title" class="mb-3 text-lg font-semibold text-[var(--color-text)]">
          Session expiring soon
        </h2>
        <p id="session-timeout-desc" class="mb-4 text-[var(--label-size)] text-[var(--color-text-muted)]">
          {{ minutesLeft <= 0
            ? 'Your session will expire imminently due to inactivity. Click below to stay signed in.'
            : `Your session will expire in ${countdownFormatted} due to inactivity. Click below to stay signed in.`
          }}
        </p>
        <div class="flex justify-end">
          <button
            type="button"
            class="pill-btn bg-[var(--color-accent)] px-4 py-2 text-white hover:opacity-90 disabled:opacity-70"
            :disabled="extending"
            @click="onStaySignedIn"
          >
            {{ extending ? 'Extending…' : 'Stay signed in' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  extending: boolean
  minutesLeft: number
  countdownFormatted: string
}>()

const emit = defineEmits<{
  staySignedIn: []
}>()

function onStaySignedIn() {
  emit('staySignedIn')
}
</script>
