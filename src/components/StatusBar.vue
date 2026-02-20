<template>
  <footer
    class="border-t border-[var(--color-border)] bg-[var(--color-bg-card)] backdrop-blur-[var(--blur-glass)] shrink-0 flex items-center"
    style="min-height: var(--app-footer-height)"
  >
    <div
      class="w-full max-w-[1600px] mx-auto px-4 py-2 md:px-6 flex items-center justify-center gap-2"
    >
      <span
        class="flex items-center gap-1.5 text-[var(--label-size)] text-[var(--color-text-muted)]"
      >
        <span
          class="h-2 w-2 rounded-full"
          :class="connectionClass"
          :title="connectionTitle"
        />
        {{ connectionLabel }}
      </span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useFileMaker } from "../composables/useFileMaker";

const { status: fmStatus, error: fmError } = useFileMaker();

const connectionLabel = computed(() => {
  switch (fmStatus.value) {
    case "connected":
      return "Connected";
    case "connecting":
      return "Connecting…";
    case "error":
      return fmError.value || "Error";
    default:
      return "Disconnected";
  }
});

const connectionTitle = computed(() => {
  if (fmStatus.value === "error" && fmError.value) return fmError.value;
  return connectionLabel.value;
});

const connectionClass = computed(() => {
  switch (fmStatus.value) {
    case "connected":
      return "bg-emerald-500";
    case "connecting":
      return "bg-amber-500 animate-pulse";
    case "error":
      return "bg-red-500";
    default:
      return "bg-slate-500";
  }
});
</script>
