/**
 * Selection state for sending vendor emails from InvoicesView.
 * Only Approved, not-issued invoices with vendor email can be selected.
 */

import { defineStore } from "pinia";
import { ref, computed } from "vue";

export interface MailableItem {
  transRef: string;
  vendorEmail: string;
  vendorName: string;
  code: string;
  total: number;
}

export const useInvoiceMailSelectionStore = defineStore("invoiceMailSelection", () => {
  const selectedTransRefs = ref<Set<string>>(new Set());
  const mailableItems = ref<Map<string, MailableItem>>(new Map());

  function setMailableItems(items: MailableItem[]): void {
    const map = new Map<string, MailableItem>();
    for (const item of items) {
      if (item.transRef && item.vendorEmail?.trim() && item.vendorEmail.includes("@")) {
        map.set(item.transRef, item);
      }
    }
    mailableItems.value = map;
    // Remove selected refs that are no longer mailable
    const newSet = new Set<string>();
    for (const ref of selectedTransRefs.value) {
      if (map.has(ref)) newSet.add(ref);
    }
    selectedTransRefs.value = newSet;
  }

  function toggle(transRef: string): void {
    if (!transRef?.trim()) return;
    if (!mailableItems.value.has(transRef)) return;
    const next = new Set(selectedTransRefs.value);
    if (next.has(transRef)) next.delete(transRef);
    else next.add(transRef);
    selectedTransRefs.value = next;
  }

  function isSelected(transRef: string): boolean {
    return selectedTransRefs.value.has(transRef);
  }

  function clear(): void {
    selectedTransRefs.value = new Set();
  }

  const selectedWithEmail = computed((): MailableItem[] => {
    const items: MailableItem[] = [];
    const map = mailableItems.value;
    for (const ref of selectedTransRefs.value) {
      const item = map.get(ref);
      if (item?.vendorEmail?.trim() && item.vendorEmail.includes("@")) {
        items.push(item);
      }
    }
    return items;
  });

  const selectedCount = computed(() => selectedTransRefs.value.size);

  const canSend = computed(() => selectedWithEmail.value.length > 0);

  return {
    selectedTransRefs: computed(() => selectedTransRefs.value),
    mailableItems: computed(() => mailableItems.value),
    selectedWithEmail,
    selectedCount,
    canSend,
    setMailableItems,
    toggle,
    isSelected,
    clear,
  };
});
