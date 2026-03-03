/**
 * Global loading overlay state. Use show() / hide() to block the UI during async operations.
 */

import { defineStore } from "pinia";
import { ref } from "vue";

export const useLoadingOverlayStore = defineStore("loadingOverlay", () => {
  const visible = ref(false);
  const message = ref("Loading…");
  const hint = ref("");

  function show(overlayMessage = "Loading…", overlayHint = ""): void {
    message.value = overlayMessage;
    hint.value = overlayHint;
    visible.value = true;
  }

  function hide(): void {
    visible.value = false;
  }

  return { visible, message, hint, show, hide };
});
