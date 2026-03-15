<template>
  <div
    class="content-area flex flex-col flex-1 min-h-0 w-full max-w-[1600px] mx-auto px-4 py-5 md:px-6 md:py-6 min-h-[400px]"
  >
    <header
      class="user-guide-header sticky top-0 z-10 -mx-4 -mt-5 px-4 pt-5 pb-4 md:-mx-6 md:-mt-6 md:px-6 md:pt-6 md:pb-4 mb-10 bg-[var(--color-bg-dark)] border-b border-[var(--color-border)]"
    >
      <router-link
        to="/settings"
        class="inline-flex items-center gap-2 text-[var(--label-size)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] no-underline mb-4 transition-colors"
      >
        <svg
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Settings
      </router-link>
      <h1
        class="text-[1.75rem] font-bold tracking-tight text-[var(--color-text)] md:text-[2rem]"
        style="letter-spacing: -0.025em; line-height: 1.2"
      >
        User Guide
      </h1>
      <p class="mt-1.5 text-[13px] text-[var(--color-text-muted)]">
        View or download the user guide for your role in PDF format.
      </p>
    </header>

    <div
      class="user-guide-list glass rounded-2xl border border-[var(--color-border)] overflow-hidden"
    >
      <div
        v-for="guide in visibleGuides"
        :key="guide.role"
        class="user-guide-row flex flex-wrap items-center justify-between gap-4 px-4 py-4 border-b border-[var(--color-border)] last:border-b-0"
      >
        <div class="flex items-start gap-3 min-w-0">
          <div
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]"
          >
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <div class="min-w-0">
            <h2
              class="text-[var(--label-size)] font-semibold text-[var(--color-text)]"
            >
              {{ guide.title }}
            </h2>
            <p class="mt-0.5 text-[13px] text-[var(--color-text-muted)]">
              {{ guide.description }}
            </p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="pill-btn glass-input inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)] disabled:opacity-50"
            @click="viewGuide(guide.role)"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            View
          </button>
          <button
            type="button"
            class="pill-btn glass-input inline-flex items-center gap-2 rounded-lg border border-[var(--color-border)] px-4 py-2.5 text-[var(--label-size)] font-medium text-[var(--color-text-muted)] transition-colors hover:bg-white/5 hover:text-[var(--color-text)] disabled:opacity-50"
            @click="downloadGuide(guide.role)"
          >
            <svg
              class="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </button>
        </div>
      </div>
    </div>

    <!-- PDF viewer modal -->
    <Teleport to="body">
      <div
        v-if="pdfViewerVisible"
        class="tax-modal-backdrop user-guide-pdf-backdrop"
      >
        <div
          class="user-guide-pdf-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-viewer-title"
        >
          <header class="tax-modal__header">
            <h2 id="pdf-viewer-title" class="tax-modal__title">
              {{ pdfViewerTitle }}
            </h2>
            <button
              type="button"
              class="tax-modal__close"
              aria-label="Close"
              @click="closePdfViewer"
            >
              <svg
                class="tax-modal__close-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </header>
          <div class="user-guide-pdf-modal__body">
            <iframe
              v-if="pdfViewerUrl"
              :src="pdfViewerUrl"
              class="user-guide-pdf-modal__iframe"
              title="User guide PDF"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useUserRole } from "../composables/useUserRole";
import { useToastStore } from "../stores/toastStore";
import officerPdfUrl from "../asset/Finance Payable Officer Guide.pdf?url";
import managerPdfUrl from "../asset/Finance Payable Manager Guide.pdf?url";

type GuideRole = "officer" | "manager";

const PDF_ASSETS: Record<
  GuideRole,
  { url: string; title: string; filename: string }
> = {
  officer: {
    url: officerPdfUrl,
    title: "Finance Payable Officer Guide",
    filename: "Finance Payable Officer Guide.pdf",
  },
  manager: {
    url: managerPdfUrl,
    title: "Finance Payable Manager Guide",
    filename: "Finance Payable Manager Guide.pdf",
  },
};

const { roleLower, isAdmin } = useUserRole();
const toast = useToastStore();
const pdfViewerVisible = ref(false);
const pdfViewerUrl = ref<string | null>(null);
const pdfViewerTitle = ref("");

interface GuideItem {
  role: GuideRole;
  title: string;
  description: string;
}

const ALL_GUIDES: GuideItem[] = [
  {
    role: "officer",
    title: "Officer Guide",
    description:
      "Create and post payables, manage vendors, send invoices, cheque collection.",
  },
  {
    role: "manager",
    title: "Manager Guide",
    description:
      "Approve or reject posted entries, view activity logs, manage vendors and tax.",
  },
];

const visibleGuides = computed(() => {
  const role = roleLower.value;
  if (isAdmin.value) return ALL_GUIDES;
  if (role === "officer") return ALL_GUIDES.filter((g) => g.role === "officer");
  if (role === "manager") return ALL_GUIDES.filter((g) => g.role === "manager");
  return ALL_GUIDES;
});

function viewGuide(role: GuideRole) {
  const asset = PDF_ASSETS[role];
  pdfViewerUrl.value = asset.url;
  pdfViewerTitle.value = asset.title;
  pdfViewerVisible.value = true;
}

function closePdfViewer() {
  pdfViewerVisible.value = false;
  pdfViewerUrl.value = null;
}

function downloadGuide(role: GuideRole) {
  const asset = PDF_ASSETS[role];
  const a = document.createElement("a");
  a.href = asset.url;
  a.download = asset.filename;
  a.click();
  toast.success("PDF downloaded.");
}
</script>

<style scoped>
.user-guide-pdf-modal {
  width: 100%;
  max-width: 80rem;
  max-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.35);
  overflow: hidden;
}

.user-guide-pdf-modal__body {
  flex: 1;
  min-height: 0;
  display: flex;
}

.user-guide-pdf-modal__iframe {
  width: 100%;
  height: 70vh;
  min-height: 400px;
  border: none;
  background: #fff;
}
</style>
