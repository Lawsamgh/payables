import { ref, onMounted, onUnmounted } from "vue";

/**
 * Tracks browser network connectivity (online/offline).
 * Note: `navigator.onLine` indicates general connectivity, not reachability of specific servers.
 */
export function useNetworkStatus() {
  const isOnline = ref<boolean>(typeof navigator !== "undefined" ? navigator.onLine : true);

  function update() {
    isOnline.value = navigator.onLine;
  }

  onMounted(() => {
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
  });

  onUnmounted(() => {
    window.removeEventListener("online", update);
    window.removeEventListener("offline", update);
  });

  return { isOnline };
}

