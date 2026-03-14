import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { getBaseUrl } from "../utils/filemakerApi";
import { useNetworkStatus } from "./useNetworkStatus";

const CHECK_INTERVAL_MS = 75_000;
const REQUEST_TIMEOUT_MS = 8_000;

/**
 * Periodically checks if the FileMaker host is reachable.
 * Only relevant when the user is online but the specific host is down.
 * Uses a lightweight request; any HTTP response (even 401) means reachable.
 */
export function useHostReachability(enabled: () => boolean) {
  const { isOnline } = useNetworkStatus();
  const hostReachable = ref<boolean>(true);
  let intervalId: ReturnType<typeof setInterval> | null = null;

  async function check(): Promise<void> {
    const baseUrl = getBaseUrl()?.trim();
    if (!baseUrl || !enabled()) return;

    const url = baseUrl.replace(/\/$/, "") + "/";
    const controller = new AbortController();
    const timeoutId = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS,
    );

    try {
      await fetch(url, {
        method: "GET",
        mode: "cors",
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);
      hostReachable.value = true;
    } catch {
      clearTimeout(timeoutId);
      hostReachable.value = false;
    }
  }

  function start(): void {
    if (intervalId) return;
    check();
    intervalId = setInterval(check, CHECK_INTERVAL_MS);
  }

  function stop(): void {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  }

  onMounted(() => {
    if (enabled()) start();
  });

  onUnmounted(stop);

  watch(
    () => enabled(),
    (active) => {
      if (active) start();
      else stop();
    },
  );

  const hostUnreachable = computed(() => !hostReachable.value);

  return {
    hostReachable,
    hostUnreachable,
    check,
  };
}
