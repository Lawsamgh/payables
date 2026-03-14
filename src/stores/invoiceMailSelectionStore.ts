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

export const useInvoiceMailSelectionStore = defineStore(
  "invoiceMailSelection",
  () => {
    const selectedTransRefs = ref<Set<string>>(new Set());
    const mailableItems = ref<Map<string, MailableItem>>(new Map());

    function norm(transRef: string): string {
      return String(transRef ?? "").trim();
    }

    function setMailableItems(items: MailableItem[]): void {
      const map = new Map<string, MailableItem>();
      for (const item of items) {
        const key = norm(item.transRef);
        if (
          key &&
          item.vendorEmail?.trim() &&
          item.vendorEmail.includes("@")
        ) {
          map.set(key, item);
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

    function toggle(transRef: string, max?: number): { ok: boolean; reason?: string } {
      const key = norm(transRef);
      if (!key) return { ok: false, reason: "invalid" };
      if (!mailableItems.value.has(key)) return { ok: false, reason: "not_mailable" };
      const next = new Set(selectedTransRefs.value);
      if (next.has(key)) {
        next.delete(key);
        selectedTransRefs.value = next;
        return { ok: true };
      }
      if (typeof max === "number" && max > 0 && next.size >= max) {
        return { ok: false, reason: "limit" };
      }
      next.add(key);
      selectedTransRefs.value = next;
      return { ok: true };
    }

    function isSelected(transRef: string): boolean {
      return selectedTransRefs.value.has(norm(transRef));
    }

    function clear(): void {
      selectedTransRefs.value = new Set();
    }

    /** Select the given transRefs. Uses component's mailable list as source of truth. */
    function selectRefs(refs: string[], max?: number): { limited: boolean } {
      const next = new Set<string>();
      let limited = false;
      for (const r of refs) {
        const key = norm(r);
        if (!key) continue;
        if (typeof max === "number" && max > 0 && next.size >= max) {
          limited = true;
          break;
        }
        next.add(key);
      }
      selectedTransRefs.value = next;
      return { limited };
    }

    const allSelected = computed(() => {
      const m = mailableItems.value;
      if (m.size === 0) return false;
      const s = selectedTransRefs.value;
      for (const ref of m.keys()) {
        if (!s.has(ref)) return false;
      }
      return true;
    });

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
      allSelected,
      setMailableItems,
      toggle,
      isSelected,
      clear,
      selectRefs,
    };
  },
);
