/**
 * Appearance (dark/light) for the main app. LoginView keeps its own theme.
 * Persists to localStorage; when connected, syncs with Payables_Users.Theme.
 */

import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useCurrentUserFromPayablesStore } from "./currentUserFromPayablesStore";

const STORAGE_KEY = "app-appearance";

export type Appearance = "dark" | "light";

function load(): Appearance {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === "dark" || v === "light") return v;
  } catch {
    /* ignore */
  }
  return "dark";
}

export const useThemeStore = defineStore("theme", () => {
  const appearance = ref<Appearance>(load());
  const currentUserStore = useCurrentUserFromPayablesStore();
  const { themeFromUser } = storeToRefs(currentUserStore);

  /** When current user loads and Theme is set in Payables_Users, apply it */
  watch(
    themeFromUser,
    (userTheme) => {
      if (userTheme === "dark" || userTheme === "light") {
        appearance.value = userTheme;
      }
    },
    { immediate: true },
  );

  watch(
    appearance,
    (v) => {
      try {
        localStorage.setItem(STORAGE_KEY, v);
      } catch {
        /* ignore */
      }
    },
    { immediate: false },
  );

  function setAppearance(v: Appearance): void {
    appearance.value = v;
    currentUserStore.saveTheme(v);
  }

  function toggleAppearance(): void {
    appearance.value = appearance.value === "dark" ? "light" : "dark";
    currentUserStore.saveTheme(appearance.value);
  }

  return {
    appearance,
    setAppearance,
    toggleAppearance,
  };
});
