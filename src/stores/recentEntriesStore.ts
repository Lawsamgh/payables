/**
 * Tracks recently viewed entry TransRefs for quick re-access in the command palette.
 * Persists to sessionStorage (last 8 entries).
 */

import { defineStore } from "pinia";
import { ref, watch } from "vue";

const STORAGE_KEY = "recent-entries";
const MAX_RECENT = 8;

function loadFromStorage(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string" && x.trim().length > 0)
      : [];
  } catch {
    return [];
  }
}

function saveToStorage(list: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export const useRecentEntriesStore = defineStore("recentEntries", () => {
  const refs = ref<string[]>(loadFromStorage());

  watch(
    refs,
    (list) => saveToStorage(list),
    { deep: true }
  );

  function addRecent(transRef: string) {
    const ref = (transRef ?? "").trim();
    if (!ref) return;
    const next = [ref, ...refs.value.filter((r) => r !== ref)].slice(
      0,
      MAX_RECENT
    );
    refs.value = next;
  }

  return {
    refs,
    addRecent,
  };
});
