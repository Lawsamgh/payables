/**
 * Tracks Payable_Invoice record IDs created during the current entry session.
 * When the user leaves without saving, we delete these to avoid orphaned records.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useSessionPayableInvoiceStore = defineStore(
  "sessionPayableInvoice",
  () => {
    const createdIds = ref<string[]>([]);

    function addCreatedId(id: string): void {
      if (id && String(id).trim()) {
        createdIds.value = [...createdIds.value, id];
      }
    }

    function clear(): void {
      createdIds.value = [];
    }

    /** Remove specific IDs (e.g. when a grid row with tax is deleted). */
    function removeCreatedIds(idsToRemove: string[]): void {
      const set = new Set(idsToRemove.map((id) => String(id).trim()).filter(Boolean));
      if (set.size === 0) return;
      createdIds.value = createdIds.value.filter((id) => !set.has(String(id).trim()));
    }

    return {
      createdIds: computed(() => [...createdIds.value]),
      addCreatedId,
      clear,
      removeCreatedIds,
    };
  },
);
