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
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1
            class="text-[1.75rem] font-bold tracking-tight text-[var(--color-text)] md:text-[2rem]"
            style="letter-spacing: -0.025em; line-height: 1.2"
          >
            Generate QR Code
          </h1>
          <p class="mt-1.5 text-[13px] text-[var(--color-text-muted)]">
            Configure the URL that vendors scan to record cheque collection. Leave empty to use the default.
          </p>
        </div>
        <button
          type="button"
          class="inline-flex items-center gap-2 pill-btn glass-input px-5 py-3 rounded-xl font-medium text-[var(--color-text)] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 self-start sm:self-center"
        :disabled="downloadingPdf"
        @click="onDownloadPdf"
      >
        <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {{ downloadingPdf ? "Generating…" : "Download PDF" }}
      </button>
      </div>
    </header>

    <section class="qr-url-section w-full">
      <label class="block text-[var(--label-size)] font-medium text-[var(--color-text-muted)] mb-2">
        Vendor self-service URL
      </label>
      <div class="flex gap-3">
        <input
          v-model.trim="urlInput"
          type="url"
          class="glass-input flex-1 min-w-0 px-4 py-3 rounded-xl border border-[var(--color-border)] bg-white/5 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent"
          placeholder="https://yoursite.com/vendor-collect"
          autocomplete="url"
        />
        <button
          type="button"
          class="pill-btn glass-input px-6 py-3 rounded-xl font-medium text-[var(--color-text)] hover:bg-white/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
          :disabled="saving || urlInput === (documentSettings.vendorCollectQrUrl ?? '')"
          @click="onSave"
        >
          {{ saving ? "Saving…" : "Save" }}
        </button>
      </div>
      <p class="mt-2 text-[12px] text-[var(--color-text-muted)]">
        Use a full URL (e.g. <code class="px-1 py-0.5 rounded bg-white/10">https://yourdomain.com/vendor-collect</code>) or leave empty for the default app URL.
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import QRCode from "qrcode";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";
import { useToastStore } from "../stores/toastStore";

const documentSettings = useDocumentSettingsStore();
const toast = useToastStore();

const urlInput = ref("");
const saving = ref(false);
const downloadingPdf = ref(false);

function getVendorCollectUrl(): string {
  const custom = (documentSettings.vendorCollectQrUrl ?? urlInput.value ?? "").trim();
  if (custom) {
    if (custom.startsWith("http://") || custom.startsWith("https://")) return custom;
    if (custom.startsWith("/")) return `${window.location.origin}${custom}`;
    return `${window.location.origin}/${custom}`.replace(/\/+/g, "/");
  }
  return `${window.location.origin}${import.meta.env.BASE_URL}vendor-collect`;
}

onMounted(async () => {
  await documentSettings.loadFromFileMaker();
  urlInput.value = documentSettings.vendorCollectQrUrl ?? "";
});

watch(
  () => documentSettings.vendorCollectQrUrl,
  (v) => {
    urlInput.value = v ?? "";
  },
);

async function onSave() {
  if (saving.value) return;
  saving.value = true;
  try {
    const { error } = await documentSettings.saveVendorCollectQrUrl(urlInput.value);
    if (error) {
      toast.error(error);
    } else {
      toast.success("URL saved. The QR code on the Cheque collection page will use this URL.");
    }
  } finally {
    saving.value = false;
  }
}

async function onDownloadPdf() {
  if (downloadingPdf.value) return;
  downloadingPdf.value = true;
  try {
    const url = getVendorCollectUrl();
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 220,
      margin: 2,
      color: { dark: "#0f172a", light: "#ffffff" },
    });

    const [pdfMakeModule, vfsModule] = await Promise.all([
      import("pdfmake/build/pdfmake"),
      import("pdfmake/build/vfs_fonts"),
    ]);
    type PdfMakeApi = {
      createPdf: (def: unknown) => { download: (name: string) => void };
      addVirtualFileSystem?: (vfs: Record<string, string>) => void;
    };
    const pdfMake = ((pdfMakeModule as { default?: PdfMakeApi }).default ?? pdfMakeModule) as PdfMakeApi;
    const vfs = ((vfsModule as { default?: Record<string, string> }).default ?? vfsModule) as Record<string, string>;
    if (pdfMake.addVirtualFileSystem && vfs) {
      pdfMake.addVirtualFileSystem(vfs);
    }

    const docDefinition = {
      pageSize: "A4" as const,
      pageMargins: [48, 48, 48, 56],
      defaultStyle: {
        fontSize: 10,
        color: "#334155",
      },
      styles: {
        header: { fontSize: 22, bold: true, color: "#0f172a", margin: [0, 0, 0, 4], alignment: "center" as const },
        subtitle: { fontSize: 11, color: "#64748b", margin: [0, 0, 0, 24], alignment: "center" as const },
        sectionTitle: { fontSize: 12, bold: true, color: "#0f172a", margin: [0, 16, 0, 8] },
      },
      content: [
        { text: "Vendor Cheque Collection", style: "header" },
        { text: "Scan the QR code with your mobile device to record cheque collection", style: "subtitle" },
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  stack: [
                    { text: " ", margin: [0, 8] },
                    { image: qrDataUrl, width: 180, alignment: "center" as const },
                    { text: url, fontSize: 8, alignment: "center" as const, color: "#94a3b8", margin: [0, 8, 0, 0], break: false },
                    { text: " ", margin: [0, 0, 0, 8] },
                  ],
                  fillColor: "#f8fafc",
                },
              ],
            ],
          },
          layout: "noBorders",
        },
        { text: "How to use", style: "sectionTitle" },
        {
          ol: [
            "Scan the QR code above with your mobile phone camera or QR scanner app.",
            "Enter your Code (e.g. C00051) from your approval notice and tap Continue.",
            "Enter cheque details: Bank Name and Cheque No. The amount will be shown for verification.",
            "Enter your details: Received By (your name), ID No, and Contact (phone or email).",
            "Enter your Tin No, review the Collection Date, and tap Submit to complete.",
          ],
          fontSize: 13,
        },
        {
          text: "Please ensure you have a stable internet connection and enter all required fields (marked with *) accurately.",
          fontSize: 9,
          color: "#94a3b8",
          margin: [0, 20, 0, 0],
          italics: true,
        },
      ],
      footer: (currentPage: number, pageCount: number) => ({
        margin: [48, 8, 48, 0],
        text: `Page ${currentPage} of ${pageCount}`,
        fontSize: 8,
        color: "#94a3b8",
        alignment: "center" as const,
      }),
    };

    const pdfDoc = pdfMake.createPdf(docDefinition);
    await pdfDoc.download("Vendor-Cheque-Collection-Guide.pdf");
    toast.success("PDF downloaded.");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "PDF download failed.";
    toast.error(msg);
  } finally {
    downloadingPdf.value = false;
  }
}
</script>
