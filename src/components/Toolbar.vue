<template>
  <div
    v-if="!readOnly"
    class="flex flex-wrap items-center gap-2 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-bg-card)] px-3 py-2 backdrop-blur-[var(--blur-glass)]"
  >
    <button
      type="button"
      class="pill-btn flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[var(--input-size)] text-[var(--color-text)] hover:bg-[var(--color-accent-soft)]"
      @click="$emit('add-row')"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      Add row
    </button>
    <button
      type="button"
      class="pill-btn flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[var(--input-size)] text-[var(--color-text)] hover:bg-red-500/10 hover:text-red-400"
      :disabled="!canDeleteRow"
      @click="$emit('delete-row')"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
      Delete row
    </button>
    <button
      v-if="payableStore.hasUndoDelete"
      type="button"
      class="pill-btn flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[var(--input-size)] text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
      @click="payableStore.undoDelete()"
    >
      <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
      Undo delete
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePayableStore } from '../stores/payableStore'

withDefaults(
  defineProps<{ canDeleteRow?: boolean }>(),
  { canDeleteRow: true }
)
defineEmits<{
  'add-row': []
  'delete-row': []
}>()

const payableStore = usePayableStore()
const readOnly = computed(() => payableStore.mainPosted)
</script>
