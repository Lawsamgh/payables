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
import { useUserRole } from '../composables/useUserRole'
import { useDocumentSettingsStore } from '../stores/documentSettingsStore'

defineEmits<{
  'add-row': []
}>()

const payableStore = usePayableStore()
const { isManager } = useUserRole()
const documentSettings = useDocumentSettingsStore()
/** Hide Add/Delete for Posted/Approved. Rejected: only Officer and Admin (never Manager). Draft: Manager only if ManagerEditDraft enabled. */
const readOnly = computed(
  () =>
    (payableStore.mainPosted && payableStore.mainStatus !== "Rejected") ||
    (isManager.value && payableStore.mainStatus === "Rejected") ||
    (isManager.value && !documentSettings.managerEditDraftEnabled),
)
</script>
