/**
 * Vendor overview stats for the right sidebar when on the Vendors page.
 * Updated by VendorsView when it loads.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useVendorOverviewStore = defineStore("vendorOverview", () => {
  const vendorCount = ref(0);

  function setVendorCount(count: number): void {
    vendorCount.value = count;
  }

  return {
    vendorCount: computed(() => vendorCount.value),
    setVendorCount,
  };
});
