<template>
  <div
    class="vendor-balance-banner"
    :class="{
      'vendor-balance-banner--loading': loading,
      'vendor-balance-banner--zero-or-less': zeroOrLess,
      'vendor-balance-banner--compact': compact,
    }"
    role="region"
    aria-label="Vendor balance in BC"
  >
    <span class="vendor-balance-banner__label">Vendor balance in BC</span>
    <p class="vendor-balance-banner__hint">Review before proceeding</p>
    <div
      v-if="loading"
      class="vendor-balance-banner__value vendor-balance-banner__value--skeleton"
      role="status"
      aria-busy="true"
      aria-label="Loading vendor balance"
    >
      <Skeleton
        width="6rem"
        height="1.25rem"
        class="rounded"
        aria-hidden="true"
      />
    </div>
    <div v-else class="vendor-balance-banner__value">
      {{ displayValue || "—" }}
    </div>
  </div>
</template>

<script setup lang="ts">
import Skeleton from "./Skeleton.vue";

defineProps<{
  loading: boolean;
  displayValue: string;
  zeroOrLess: boolean;
  compact?: boolean;
}>();
</script>

<style scoped>
.vendor-balance-banner {
  flex-shrink: 0;
  padding: 1rem 1.25rem;
  border-radius: 10px;
  border: 1px solid rgba(59, 130, 246, 0.4);
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.2) 0%,
    rgba(59, 130, 246, 0.08) 100%
  );
  min-width: 30rem;
}

.vendor-balance-banner--compact {
  min-width: 32rem;
}

.vendor-balance-banner__label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 0.25rem;
}

.vendor-balance-banner__hint {
  font-size: 0.75rem;
  color: rgba(148, 163, 184, 0.9);
  margin: 0 0 0.5rem 0;
}

.vendor-balance-banner__value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  min-height: 1.5rem;
}

.vendor-balance-banner__value--skeleton {
  display: flex;
  align-items: center;
}

.vendor-balance-banner--zero-or-less {
  border-color: rgba(248, 113, 113, 0.6);
  background: linear-gradient(
    135deg,
    rgba(248, 113, 113, 0.2) 0%,
    rgba(248, 113, 113, 0.08) 100%
  );
}

.vendor-balance-banner--zero-or-less .vendor-balance-banner__label,
.vendor-balance-banner--zero-or-less .vendor-balance-banner__hint {
  color: rgba(254, 202, 202, 0.95);
}

.vendor-balance-banner--zero-or-less .vendor-balance-banner__value {
  color: rgb(254, 202, 202);
}

/* Light mode */
html.theme-light .vendor-balance-banner {
  border-color: rgba(59, 130, 246, 0.6);
  background: linear-gradient(
    135deg,
    rgba(59, 130, 246, 0.15) 0%,
    rgba(59, 130, 246, 0.06) 100%
  );
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

html.theme-light .vendor-balance-banner__label {
  color: #1e40af;
  font-weight: 700;
}

html.theme-light .vendor-balance-banner__hint {
  color: #3b82f6;
}

html.theme-light .vendor-balance-banner__value {
  color: #1e3a8a;
}

html.theme-light .vendor-balance-banner--zero-or-less {
  border-color: rgba(220, 38, 38, 0.6);
  background: linear-gradient(
    135deg,
    rgba(248, 113, 113, 0.2) 0%,
    rgba(254, 202, 202, 0.15) 100%
  );
  box-shadow: 0 0 0 1px rgba(220, 38, 38, 0.25);
}

html.theme-light
  .vendor-balance-banner--zero-or-less
  .vendor-balance-banner__label,
html.theme-light
  .vendor-balance-banner--zero-or-less
  .vendor-balance-banner__hint {
  color: #991b1b;
}

html.theme-light
  .vendor-balance-banner--zero-or-less
  .vendor-balance-banner__value {
  color: #b91c1c;
}
</style>
