/**
 * Tax overview stats for the right sidebar when on the Tax page.
 * Updated by TaxView when it loads.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTaxOverviewStore = defineStore("taxOverview", () => {
  const taxCount = ref(0);

  function setTaxCount(count: number): void {
    taxCount.value = count;
  }

  return {
    taxCount: computed(() => taxCount.value),
    setTaxCount,
  };
});
