<template>
  <Teleport to="body">
    <div
      v-show="visible"
      class="fixed z-[100] min-w-[160px] rounded-[var(--radius-card)] border border-[var(--color-border)] py-1 shadow-xl"
      style="
        background: var(--color-bg-card);
        backdrop-filter: blur(var(--blur-glass));
        -webkit-backdrop-filter: blur(var(--blur-glass));
        transition: opacity 0.15s var(--ease);
      "
      :style="{ left: `${x}px`, top: `${y}px` }"
      @click.stop
    >
      <button
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-[var(--input-size)] text-[var(--color-text)] hover:bg-white/10"
        @click="onCopy"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        Copy
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-[var(--input-size)] text-[var(--color-text)] hover:bg-white/10"
        @click="onPaste"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        Paste
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-[var(--input-size)] text-[var(--color-text)] hover:bg-white/10"
        @click="onCut"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.242 4.242 3 3 0 004.242-4.242zm0-5.758a3 3 0 10-4.242-4.242 3 3 0 004.242 4.242z" />
        </svg>
        Cut
      </button>
      <button
        type="button"
        class="flex w-full items-center gap-2 px-3 py-2 text-left text-[var(--input-size)] text-[var(--color-text)] hover:bg-white/10"
        @click="onClear"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Clear
      </button>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{ visible?: boolean; x?: number; y?: number }>(),
  { visible: false, x: 0, y: 0 }
)
const emit = defineEmits<{ copy: []; paste: []; cut: []; clear: [] }>()

function onCopy() {
  emit('copy')
}
function onPaste() {
  emit('paste')
}
function onCut() {
  emit('cut')
}
function onClear() {
  emit('clear')
}
</script>
