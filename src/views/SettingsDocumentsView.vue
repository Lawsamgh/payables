<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <header class="mb-10">
      <router-link
        to="/settings"
        class="inline-flex items-center gap-2 text-[var(--label-size)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] no-underline mb-4 transition-colors"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Back to Settings
      </router-link>
      <h1
        class="text-[1.75rem] font-bold tracking-tight text-[var(--color-text)] md:text-[2rem]"
        style="letter-spacing: -0.025em; line-height: 1.2"
      >
        Documents
      </h1>
      <p class="mt-1.5 text-[13px] text-[var(--color-text-muted)]">
        Configure when users can download invoice PDFs.
      </p>
    </header>

    <section class="doc-options w-full">
      <p class="doc-options__label">When to show the Download Invoice button</p>
      <div class="doc-options__row">
        <button
          type="button"
          class="doc-option"
          :class="{ 'doc-option--selected': invoiceDownloadWhen === 'once_posted' }"
          @click="invoiceDownloadWhen = 'once_posted'"
        >
          <span class="doc-option__ring">
            <span v-if="invoiceDownloadWhen === 'once_posted'" class="doc-option__dot" />
          </span>
          <span class="doc-option__icon doc-option__icon--posted">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          <span class="doc-option__content">
            <span class="doc-option__title">Once posted</span>
            <span class="doc-option__desc">Users can download as soon as an entry is posted</span>
          </span>
        </button>

        <button
          type="button"
          class="doc-option"
          :class="{ 'doc-option--selected': invoiceDownloadWhen === 'approved_only' }"
          @click="invoiceDownloadWhen = 'approved_only'"
        >
          <span class="doc-option__ring">
            <span v-if="invoiceDownloadWhen === 'approved_only'" class="doc-option__dot" />
          </span>
          <span class="doc-option__icon doc-option__icon--approved">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </span>
          <span class="doc-option__content">
            <span class="doc-option__title">Approved only</span>
            <span class="doc-option__desc">Users can download only after approval</span>
          </span>
        </button>

        <button
          type="button"
          class="doc-option"
          :class="{ 'doc-option--selected': invoiceDownloadWhen === 'none' }"
          @click="invoiceDownloadWhen = 'none'"
        >
          <span class="doc-option__ring">
            <span v-if="invoiceDownloadWhen === 'none'" class="doc-option__dot" />
          </span>
          <span class="doc-option__icon doc-option__icon--hidden">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
            </svg>
          </span>
          <span class="doc-option__content">
            <span class="doc-option__title">Do not show</span>
            <span class="doc-option__desc">Hide the download button entirely</span>
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";

const documentSettings = useDocumentSettingsStore();
const invoiceDownloadWhen = computed({
  get: () => documentSettings.invoiceDownloadWhen,
  set: (v) => documentSettings.setInvoiceDownloadWhen(v),
});

onMounted(() => {
  documentSettings.loadFromFileMaker();
});
</script>

<style scoped>
.doc-options__label {
  margin: 0 0 1rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-muted);
}

.doc-options__row {
  display: flex;
  flex-direction: row;
  gap: 1rem;
}

.doc-option {
  display: flex;
  flex: 1 1 0;
  min-width: 0;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: var(--color-bg-card);
  border: 2px solid var(--color-border);
  border-radius: 14px;
  cursor: pointer;
  text-align: left;
  font: inherit;
  color: inherit;
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.doc-option:hover {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.12);
}

.doc-option--selected {
  border-color: var(--color-accent);
  background: rgba(59, 130, 246, 0.08);
  box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.2);
}

.doc-option--selected:hover {
  background: rgba(59, 130, 246, 0.1);
}

.doc-option__ring {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  margin-top: 0.125rem;
  border: 2px solid var(--color-border);
  border-radius: 50%;
  transition: border-color 0.2s ease;
}

.doc-option--selected .doc-option__ring {
  border-color: var(--color-accent);
}

.doc-option__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: var(--color-accent);
}

.doc-option__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 10px;
}

.doc-option__icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.doc-option__icon--posted {
  background: rgba(148, 163, 184, 0.2);
  color: rgb(148, 163, 184);
}

.doc-option__icon--approved {
  background: rgba(34, 197, 94, 0.15);
  color: rgb(74, 222, 128);
}

.doc-option__icon--hidden {
  background: rgba(100, 116, 139, 0.2);
  color: rgb(148, 163, 184);
}

.doc-option__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.doc-option__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text);
}

.doc-option__desc {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: var(--color-text-muted);
}
</style>
