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

    return {
      createdIds: computed(() => [...createdIds.value]),
      addCreatedId,
      clear,
    };
  },
);
