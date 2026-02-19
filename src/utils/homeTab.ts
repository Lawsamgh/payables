/**
 * Persist HomeView tab selection across navigation (e.g. Home -> Entry -> Home).
 */

const STORAGE_KEY = "home-selected-tab";
const VALID_TABS = ["draft", "posted", "rejected", "approved"] as const;

export type HomeTab = (typeof VALID_TABS)[number];

export function isValidHomeTab(t: unknown): t is HomeTab {
  return typeof t === "string" && VALID_TABS.includes(t as HomeTab);
}

export function setHomeTab(tab: HomeTab): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, tab);
  } catch {
    /* ignore */
  }
}

export function getHomeTab(): HomeTab | null {
  try {
    const v = sessionStorage.getItem(STORAGE_KEY);
    return isValidHomeTab(v) ? v : null;
  } catch {
    return null;
  }
}

/** Route object for navigating to Home, preserving the last selected tab. */
export function getHomeRoute(): { path: string; query?: { tab: string } } {
  const tab = getHomeTab();
  if (tab) return { path: "/home", query: { tab } };
  return { path: "/home" };
}
