/**
 * Cheque collection overview stats for the right sidebar when on the Cheque collection page.
 * Updated by ChequeCollectionView when it loads.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useChequeOverviewStore = defineStore("chequeOverview", () => {
  const collectionCount = ref(0);

  function setCollectionCount(count: number): void {
    collectionCount.value = count;
  }

  return {
    collectionCount: computed(() => collectionCount.value),
    setCollectionCount,
  };
});
