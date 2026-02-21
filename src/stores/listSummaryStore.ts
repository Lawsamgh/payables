/**
 * Summary counts and totals for the Payables list (Draft / Posted). Updated by HomeView for use in sidebars.
 * Totals are stored per currency so Overview can show "GHS X · USD Y" when entries use multiple currencies.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface TopVendorByVolume {
  vendorName: string
  total: number
  currency: string
}

export interface TopVendorByCount {
  vendorName: string
  count: number
}

export const useListSummaryStore = defineStore('listSummary', () => {
  const draftCount = ref(0)
  const postedCount = ref(0)
  const rejectedCount = ref(0)
  const approvedCount = ref(0)
  const overdueCount = ref(0)
  const draftTotalsByCurrency = ref<Record<string, number>>({})
  const postedTotalsByCurrency = ref<Record<string, number>>({})
  const rejectedTotalsByCurrency = ref<Record<string, number>>({})
  const approvedTotalsByCurrency = ref<Record<string, number>>({})
  const topVendorsByVolume = ref<TopVendorByVolume[]>([])
  const topVendorsByEntryCount = ref<TopVendorByCount[]>([])

  function setCounts(draft: number, posted: number, rejected?: number, approved?: number): void {
    draftCount.value = draft
    postedCount.value = posted
    rejectedCount.value = rejected ?? 0
    approvedCount.value = approved ?? 0
  }

  function setTotalsByCurrency(
    draft: Record<string, number>,
    posted: Record<string, number>,
    rejected?: Record<string, number>,
    approved?: Record<string, number>,
  ): void {
    draftTotalsByCurrency.value = { ...draft }
    postedTotalsByCurrency.value = { ...posted }
    rejectedTotalsByCurrency.value = { ...(rejected ?? {}) }
    approvedTotalsByCurrency.value = { ...(approved ?? {}) }
  }

  function setOverdueCount(count: number): void {
    overdueCount.value = count
  }

  function setVendorStats(byVolume: TopVendorByVolume[], byEntryCount: TopVendorByCount[]): void {
    topVendorsByVolume.value = [...byVolume]
    topVendorsByEntryCount.value = [...byEntryCount]
  }

  const totalCount = computed(
    () => draftCount.value + postedCount.value + rejectedCount.value + approvedCount.value,
  )

  return {
    draftCount: computed(() => draftCount.value),
    postedCount: computed(() => postedCount.value),
    rejectedCount: computed(() => rejectedCount.value),
    approvedCount: computed(() => approvedCount.value),
    overdueCount: computed(() => overdueCount.value),
    draftTotalsByCurrency: computed(() => draftTotalsByCurrency.value),
    postedTotalsByCurrency: computed(() => postedTotalsByCurrency.value),
    rejectedTotalsByCurrency: computed(() => rejectedTotalsByCurrency.value),
    approvedTotalsByCurrency: computed(() => approvedTotalsByCurrency.value),
    topVendorsByVolume: computed(() => topVendorsByVolume.value),
    topVendorsByEntryCount: computed(() => topVendorsByEntryCount.value),
    totalCount,
    setCounts,
    setTotalsByCurrency,
    setOverdueCount,
    setVendorStats,
  }
})
