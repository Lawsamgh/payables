/**
 * Booklet / leaflet state: multiple entries "open" in the app;
 * user flips between them like pages (prev/next) instead of new browser tabs.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBookletStore = defineStore('booklet', () => {
  const openEntryRefs = ref<string[]>([])
  const currentOpenIndex = ref(0)
  /** 'draft' = booklet from draft selection (remove posted); 'rejected' = booklet from rejected card (keep all). */
  const mode = ref<'draft' | 'rejected' | null>(null)
  /** Refs selected on the list view for the booklet (Apple Books–style). */
  const selectedForBooklet = ref<Set<string>>(new Set())

  const count = computed(() => openEntryRefs.value.length)
  const selectedCount = computed(() => selectedForBooklet.value.size)
  const currentTransRef = computed(() => {
    const refs = openEntryRefs.value
    const i = currentOpenIndex.value
    if (i < 0 || i >= refs.length) return null
    return refs[i] ?? null
  })
  const hasPrev = computed(() => currentOpenIndex.value > 0)
  const hasNext = computed(() => currentOpenIndex.value < openEntryRefs.value.length - 1 && openEntryRefs.value.length > 1)
  const pageLabel = computed(() => {
    const n = openEntryRefs.value.length
    if (n === 0) return ''
    return `${currentOpenIndex.value + 1} of ${n}`
  })

  /** Add a transRef to the booklet (if not already) and set current page to it. */
  function addOpenEntry(transRef: string): void {
    const ref = (transRef ?? '').trim()
    if (!ref) return
    const refs = openEntryRefs.value
    const i = refs.indexOf(ref)
    if (i >= 0) {
      currentOpenIndex.value = i
      return
    }
    openEntryRefs.value = [...refs, ref]
    currentOpenIndex.value = openEntryRefs.value.length - 1
  }

  /** Ensure the given transRef is the current page (add if missing). */
  function ensureCurrent(transRef: string): void {
    addOpenEntry(transRef)
  }

  function setCurrentIndex(index: number): void {
    const n = openEntryRefs.value.length
    if (n === 0) return
    const i = Math.max(0, Math.min(index, n - 1))
    currentOpenIndex.value = i
  }

  function goPrev(): boolean {
    if (!hasPrev.value) return false
    currentOpenIndex.value--
    return true
  }

  function goNext(): boolean {
    if (!hasNext.value) return false
    currentOpenIndex.value++
    return true
  }

  /** Remove the current page from the booklet (optional: call after closing an entry). */
  function removeCurrent(): void {
    const refs = openEntryRefs.value
    const i = currentOpenIndex.value
    if (i < 0 || i >= refs.length) return
    const next = refs.filter((_, idx) => idx !== i)
    openEntryRefs.value = next
    if (next.length === 0) {
      currentOpenIndex.value = 0
      return
    }
    currentOpenIndex.value = Math.min(i, next.length - 1)
  }

  /** Remove a ref from the booklet by value (e.g. when viewing a posted entry). */
  function removeByRef(transRef: string): void {
    const ref = (transRef ?? '').trim()
    if (!ref) return
    const refs = openEntryRefs.value
    const i = refs.indexOf(ref)
    if (i < 0) return
    const next = refs.filter((r) => r !== ref)
    openEntryRefs.value = next
    if (next.length === 0) {
      currentOpenIndex.value = 0
      return
    }
    if (currentOpenIndex.value >= next.length) currentOpenIndex.value = next.length - 1
    else if (currentOpenIndex.value >= i) currentOpenIndex.value = Math.max(0, currentOpenIndex.value - 1)
  }

  function clear(): void {
    openEntryRefs.value = []
    currentOpenIndex.value = 0
    mode.value = null
  }

  /** Toggle a ref in the list-view selection (for “Open booklet”). */
  function toggleSelected(transRef: string): void {
    const ref = (transRef ?? '').trim()
    if (!ref) return
    const next = new Set(selectedForBooklet.value)
    if (next.has(ref)) next.delete(ref)
    else next.add(ref)
    selectedForBooklet.value = next
  }

  function isSelected(transRef: string): boolean {
    return selectedForBooklet.value.has((transRef ?? '').trim())
  }

  function clearSelection(): void {
    selectedForBooklet.value = new Set()
  }

  /** Open the booklet with the given ordered refs. Pass mode so EntryView knows not to remove entries when viewing rejected. */
  function openBookletWithRefs(orderedRefs: string[], bookletMode?: 'draft' | 'rejected'): void {
    const refs = orderedRefs.map((r) => (r ?? '').trim()).filter(Boolean)
    openEntryRefs.value = refs
    currentOpenIndex.value = 0
    mode.value = bookletMode ?? 'draft'
  }

  return {
    openEntryRefs: computed(() => openEntryRefs.value),
    currentOpenIndex: computed(() => currentOpenIndex.value),
    mode: computed(() => mode.value),
    selectedForBooklet: computed(() => selectedForBooklet.value),
    selectedCount,
    count,
    currentTransRef,
    hasPrev,
    hasNext,
    pageLabel,
    addOpenEntry,
    ensureCurrent,
    setCurrentIndex,
    goPrev,
    goNext,
    removeCurrent,
    removeByRef,
    clear,
    toggleSelected,
    isSelected,
    clearSelection,
    openBookletWithRefs,
  }
})
