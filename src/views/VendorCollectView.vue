<template>
  <div
    class="vendor-collect vendor-collect__root flex flex-1 flex-col min-h-0 vendor-collect__bg"
  >
    <!-- Desktop: show mobile-only message -->
    <div
      v-if="!isMobile"
      class="vendor-collect__desktop flex-1 flex items-center justify-center p-6"
    >
      <div
        class="vendor-collect__desktop-card glass rounded-2xl border border-[var(--color-border)] p-8 max-w-md w-full text-center shadow-lg"
      >
        <div
          class="vendor-collect__desktop-icon w-20 h-20 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto mb-5"
        >
          <svg
            class="w-10 h-10 text-amber-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-[var(--color-text)] mb-3">
          Mobile only
        </h1>
        <p
          class="text-[var(--color-text-muted)] text-[1.0625rem] leading-relaxed"
        >
          This page is for vendors to record cheque collection. Please scan the
          QR code with your mobile device.
        </p>
      </div>
    </div>

    <!-- Mobile: main flow -->
    <template v-else>
      <div
        class="vendor-collect__mobile flex-1 flex flex-col min-h-0 w-full max-w-lg mx-auto px-4 sm:px-6 pb-[env(safe-area-inset-bottom)]"
      >
        <Transition name="vendor-collect-slide" mode="out-in">
          <!-- Step 1 & 2: TransRef then Code input -->
          <div
            v-if="!payableFound"
            key="step1"
            class="vendor-collect__step1 flex-1 flex flex-col min-h-0"
          >
            <!-- Not connected -->
            <div
              v-if="!isConnected && !connecting"
              class="vendor-collect__error mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/25 p-4 backdrop-blur-xl"
            >
              <div class="flex items-start gap-3">
                <span
                  class="vendor-collect__error-icon shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center"
                >
                  <svg
                    class="w-4 h-4 text-amber-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </span>
                <p class="text-amber-200/95 text-[15px] leading-relaxed pt-0.5">
                  Unable to connect. Please ensure you are on the correct
                  network.
                </p>
              </div>
            </div>

            <template v-else>
              <!-- Scrollable content -->
              <div
                class="vendor-collect__step1-content flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain vendor-collect__scroll-area pt-[max(1.5rem,env(safe-area-inset-top))]"
              >
                <header class="vendor-collect__header text-center mb-10 mt-2">
                  <div
                    class="vendor-collect__header-icon w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-5 border border-white/10"
                  >
                    <svg
                      class="w-7 h-7 text-emerald-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h1
                    class="vendor-collect__title text-[26px] font-semibold tracking-tight text-[var(--color-text)] leading-tight"
                  >
                    Cheque collection
                  </h1>
                  <p
                    class="vendor-collect__subtitle text-[15px] text-[var(--color-text-muted)] mt-2.5 leading-relaxed max-w-[280px] mx-auto"
                  >
                    <template v-if="!transRefValidated">
                      Enter your TransRef sent to you in your email to start
                      recording cheque collection
                    </template>
                    <template v-else>
                      See the Officer for the Code to start recording cheque
                      collection
                    </template>
                  </p>
                </header>

                <!-- Step 1: TransRef -->
                <form
                  v-if="!transRefValidated"
                  id="vendor-collect-transref-form"
                  @submit.prevent="onTransRefSubmit"
                  class="vendor-collect__form-step1"
                >
                  <label class="vendor-collect__input-group mb-6 block">
                    <span
                      class="block text-[12px] text-[var(--color-text-muted)] mb-2"
                      >TransRef</span
                    >
                    <div class="vendor-collect__input-wrap">
                      <input
                        :value="transRefInput"
                        type="text"
                        class="vendor-collect__input vendor-collect__input--uppercase"
                        placeholder="e.g. RF2025684"
                        autocomplete="off"
                        :disabled="loadingPayable"
                        @input="
                          transRefInput = (
                            $event.target as HTMLInputElement
                          ).value.toUpperCase()
                        "
                      />
                    </div>
                  </label>
                </form>

                <!-- Step 2: Code from officer -->
                <form
                  v-else
                  id="vendor-collect-code-form"
                  @submit.prevent="onCodeSubmit"
                  class="vendor-collect__form-step1"
                >
                  <label class="vendor-collect__input-group mb-6 block">
                    <span
                      class="block text-[12px] text-[var(--color-text-muted)] mb-2"
                      >Code</span
                    >
                    <p
                      class="text-[13px] text-[var(--color-text-muted)] mb-3"
                    >
                      Enter the code manually or scan the QR code the officer showed you
                    </p>
                    <div
                      class="vendor-collect__code-input-row flex gap-2 items-stretch"
                    >
                      <div class="vendor-collect__input-wrap flex-1 min-w-0">
                        <input
                          :value="codeInput"
                          type="text"
                          class="vendor-collect__input vendor-collect__input--uppercase"
                          placeholder="e.g. C00051"
                          autocomplete="off"
                          :disabled="loadingPayable"
                          @input="
                            codeInput = (
                              $event.target as HTMLInputElement
                            ).value.toUpperCase()
                          "
                        />
                      </div>
                      <button
                        type="button"
                        class="vendor-collect__scan-btn shrink-0 w-14 h-[52px] rounded-2xl flex items-center justify-center bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30 hover:border-emerald-500/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        :disabled="loadingPayable"
                        :title="'Scan QR code'"
                        @click="openQrScanner"
                      >
                        <svg
                          class="w-7 h-7"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            stroke-width="2"
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                          />
                        </svg>
                      </button>
                    </div>
                  </label>
                </form>

                <!-- QR Scanner modal -->
                <Teleport to="body">
                  <Transition name="vendor-collect-modal">
                    <div
                      v-if="qrScannerOpen"
                      class="vendor-collect__qr-modal fixed inset-0 z-[9999] flex flex-col bg-black/95"
                    >
                      <header
                        class="shrink-0 flex items-center justify-between px-4 py-4 border-b border-white/10"
                      >
                        <h2 class="text-lg font-semibold text-white">
                          Scan code
                        </h2>
                        <button
                          type="button"
                          class="p-2 -m-2 rounded-xl text-white/70 hover:bg-white/10 hover:text-white transition-colors"
                          aria-label="Close"
                          @click="closeQrScanner"
                        >
                          <svg
                            class="w-6 h-6"
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
                      <div
                        id="qr-reader"
                        class="flex-1 min-h-0 overflow-hidden"
                      />
                      <p
                        class="shrink-0 text-center text-[13px] text-white/60 py-4"
                      >
                        Point your camera at the QR code
                      </p>
                    </div>
                  </Transition>
                </Teleport>

                <p
                  v-if="lookupError"
                  class="vendor-collect__error-text mt-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-[14px] text-red-300/95 text-center"
                >
                  {{ lookupError }}
                </p>
              </div>

              <!-- Footer with buttons -->
              <footer
                class="vendor-collect__step1-footer shrink-0 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/8 bg-[var(--color-bg)]/80 backdrop-blur-xl"
              >
                <div class="flex gap-3">
                  <button
                    v-if="transRefValidated"
                    type="button"
                    class="vendor-collect__btn-secondary flex-1 py-4 rounded-2xl font-semibold text-[15px] transition-all"
                    @click="backToTransRef"
                  >
                    Back
                  </button>
                  <button
                    v-if="!transRefValidated"
                    type="submit"
                    form="vendor-collect-transref-form"
                    class="vendor-collect__cta flex-1 py-4 rounded-2xl font-semibold text-[16px] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    :disabled="!transRefInput.trim() || loadingPayable"
                  >
                    {{ loadingPayable ? "Looking up…" : "Continue" }}
                  </button>
                  <button
                    v-else
                    type="submit"
                    form="vendor-collect-code-form"
                    class="vendor-collect__cta flex-1 py-4 rounded-2xl font-semibold text-[16px] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
                    :disabled="!codeInput.trim() || loadingPayable"
                  >
                    {{ loadingPayable ? "Verifying…" : "Continue" }}
                  </button>
                </div>
              </footer>
            </template>
          </div>

          <!-- Step 2: Collection form -->
          <div
            v-else
            key="step2"
            class="vendor-collect__form flex-1 flex flex-col min-h-0"
          >
            <div
              class="vendor-collect__form-content vendor-collect__scroll-area flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain pt-[max(1.25rem,env(safe-area-inset-top))] px-4 pb-4 space-y-5"
            >
              <div class="vendor-collect__payable-card rounded-2xl p-5">
              <p
                class="text-[17px] font-semibold text-[var(--color-text)] leading-snug"
              >
                {{ payableDisplay }}
              </p>
              <p
                class="text-[13px] text-[var(--color-text-muted)] mt-1.5 opacity-90"
              >
                TransRef: {{ form.TransRef }}
              </p>
            </div>

            <form
              id="vendor-collect-form"
              @submit.prevent="onSubmit"
              class="space-y-6"
            >
              <div
                class="vendor-collect__progress px-4 flex items-center justify-between gap-3"
              >
                <div class="flex items-center gap-1.5">
                  <span
                    v-for="n in totalFormSteps"
                    :key="n"
                    class="inline-flex h-1.5 rounded-full transition-all duration-200"
                    :class="
                      n <= activeFormStep
                        ? 'bg-emerald-400 w-6'
                        : 'bg-white/10 w-3'
                    "
                  />
                </div>
                <span
                  class="text-[11px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]"
                >
                  Step {{ activeFormStep }} of {{ totalFormSteps }}
                </span>
              </div>

              <Transition name="vendor-collect-slide" mode="out-in">
                <section
                  v-if="activeFormStep === 1"
                  key="cheque"
                  class="vendor-collect__card rounded-2xl overflow-hidden"
                >
                  <h2
                    class="vendor-collect__section-title px-4 py-3 text-[13px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
                  >
                    Cheque details
                  </h2>
                  <div
                    class="vendor-collect__field-list divide-y divide-white/[0.06]"
                  >
                    <label class="vendor-collect__field block px-4 py-3.5">
                      <span
                        class="block text-[12px] text-[var(--color-text-muted)] mb-2"
                        >Bank Name <span class="text-red-400">*</span></span
                      >
                      <input
                        v-model.trim="form.BankName"
                        type="text"
                        class="vendor-collect__field-input vendor-collect__field-input--editable"
                        placeholder="Bank name"
                        required
                      />
                    </label>
                    <label class="vendor-collect__field block px-4 py-3.5">
                      <span
                        class="block text-[12px] text-[var(--color-text-muted)] mb-2"
                        >Cheque No <span class="text-red-400">*</span></span
                      >
                      <input
                        v-model.trim="form.ChequeNo"
                        type="text"
                        class="vendor-collect__field-input vendor-collect__field-input--editable"
                        placeholder="Cheque number"
                        required
                      />
                    </label>
                    <div class="vendor-collect__field px-4 py-3.5">
                      <span
                        class="block text-[12px] text-[var(--color-text-muted)] mb-2"
                        >Amount</span
                      >
                      <input
                        :value="formatNumberDisplay(form.Amount)"
                        type="text"
                        class="vendor-collect__field-input vendor-collect__field-input--readonly font-medium"
                        readonly
                      />
                    </div>
                  </div>
                </section>

                <section
                  v-else-if="activeFormStep === 2"
                  key="your-details-1"
                  class="vendor-collect__card rounded-2xl overflow-hidden"
                >
                  <h2
                    class="vendor-collect__section-title px-4 py-3 text-[13px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
                  >
                    Your details
                  </h2>
                  <div
                    class="vendor-collect__field-list divide-y divide-white/[0.06]"
                  >
                    <label class="vendor-collect__field block px-4 py-3.5">
                      <span
                        class="block text-[12px] text-[var(--color-text-muted)] mb-2"
                        >Received By <span class="text-red-400">*</span></span
                      >
                      <input
                        v-model.trim="form.ReceivedBy"
                        type="text"
                        class="vendor-collect__field-input vendor-collect__field-input--editable"
                        placeholder="Your full name"
                        required
                      />
                    </label>
                    <label class="vendor-collect__field block px-4 py-3.5">
                      <span
                        class="block text-[12px] text-[var(--color-text-muted)] mb-2"
                        >ID No <span class="text-red-400">*</span></span
                      >
                      <input
                        v-model.trim="form.IDNo"
                        type="text"
                        class="vendor-collect__field-input vendor-collect__field-input--editable"
                        placeholder="ID number"
                        required
                      />
                    </label>
                    <label class="vendor-collect__field block px-4 py-3.5">
                      <span
                        class="block text-[12px] text-[var(--color-text-muted)] mb-2"
                        >Contact (Phone/Email)
                        <span class="text-red-400">*</span></span
                      >
                      <input
                        v-model.trim="form.Contact"
                        type="text"
                        class="vendor-collect__field-input vendor-collect__field-input--editable"
                        placeholder="Phone or email"
                        inputmode="tel"
                        required
                      />
                    </label>
                  </div>
                </section>

                <section
                  v-else
                  key="your-details-2"
                  class="vendor-collect__card rounded-2xl overflow-hidden"
                >
                  <h2
                    class="vendor-collect__section-title px-4 py-3 text-[13px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider"
                  >
                    Tax & confirmation
                  </h2>
                  <div
                    class="vendor-collect__field-list divide-y divide-white/[0.06]"
                  >
                    <label class="vendor-collect__field block px-4 py-3.5">
                      <span
                        class="block text-[12px] text-[var(--color-text-muted)] mb-2"
                        >Tin No <span class="text-red-400">*</span></span
                      >
                      <input
                        v-model.trim="form.TinNo"
                        type="text"
                        class="vendor-collect__field-input vendor-collect__field-input--editable"
                        placeholder="TIN"
                        required
                      />
                    </label>
                    <div class="vendor-collect__field px-4 py-3.5">
                      <span
                        class="block text-[12px] text-[var(--color-text-muted)] mb-2"
                        >Collection Date</span
                      >
                      <div
                        class="vendor-collect__field-input vendor-collect__field-input--readonly vendor-collect__field-input--display"
                      >
                        {{ formatDateDisplay(form.CollectionDate) }}
                      </div>
                    </div>
                  </div>
                </section>
              </Transition>
            </form>
            </div>

            <footer
              class="vendor-collect__form-footer shrink-0 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] border-t border-white/8 bg-[var(--color-bg)]/80 backdrop-blur-xl"
            >
              <div class="flex gap-3">
                <button
                  type="button"
                  class="vendor-collect__btn-secondary flex-1 py-4 rounded-2xl font-semibold text-[15px] transition-all"
                  @click="goBackFormStep"
                >
                  Back
                </button>
                <button
                  v-if="activeFormStep !== 3"
                  type="button"
                  class="vendor-collect__btn-primary flex-1 py-4 rounded-2xl font-semibold text-[15px] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="!canGoNextFormStep"
                  @click="goNextFormStep"
                >
                  Next
                </button>
                <button
                  v-else
                  type="submit"
                  form="vendor-collect-form"
                  class="vendor-collect__btn-primary flex-1 py-4 rounded-2xl font-semibold text-[15px] text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  :disabled="saving || !canSubmitForm"
                >
                  {{ saving ? "Saving…" : "Submit" }}
                </button>
              </div>
            </footer>
          </div>
        </Transition>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from "vue";
import { Html5Qrcode } from "html5-qrcode";
import { useFileMaker } from "../composables/useFileMaker";
import { LAYOUTS } from "../utils/filemakerApi";
import type {
  ChequeCollectionFieldData,
  PayablesMainFieldData,
} from "../utils/filemakerApi";
import type { FindRecordWithId } from "../composables/useFileMaker";
import { useToastStore } from "../stores/toastStore";
import { useLoadingOverlayStore } from "../stores/loadingOverlayStore";
import { useDocumentSettingsStore } from "../stores/documentSettingsStore";
import { formatDateForFileMaker } from "../utils/filemakerMappers";
import { formatNumberDisplay } from "../utils/formatNumber";

const {
  createRecord,
  findRecordsWithIds,
  findRecordsByQueryWithIds,
  updateRecord,
  login,
  isConnected,
} = useFileMaker();
const toast = useToastStore();
const documentSettings = useDocumentSettingsStore();

const isMobile = ref(false);
const connecting = ref(false);
const transRefInput = ref("");
const codeInput = ref("");
const transRefValidated = ref(false);
const loadingPayable = ref(false);
const lookupError = ref("");
const payableFound = ref(false);
const activeFormStep = ref<1 | 2 | 3>(1);
const totalFormSteps = 3;
const payableRecord = ref<FindRecordWithId<
  PayablesMainFieldData | Record<string, unknown>
> | null>(null);
const mainRecordId = ref<string | null>(null);
const collectionList = ref<
  FindRecordWithId<ChequeCollectionFieldData | Record<string, unknown>>[]
>([]);
const saving = ref(false);
const qrScannerOpen = ref(false);
let html5QrCodeInstance: Html5Qrcode | null = null;

function defaultCollectionDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDateDisplay(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

const form = ref({
  TransRef: "",
  BankName: "",
  ChequeNo: "",
  Amount: "" as string | number,
  ChequePayee: "",
  ReceivedBy: "",
  IDNo: "",
  Contact: "",
  TinNo: "",
  CollectionDate: defaultCollectionDate(),
});

function isFormStepComplete(step: number): boolean {
  const v = form.value;
  if (step === 1) {
    return Boolean(v.BankName?.trim()) && Boolean(v.ChequeNo?.trim());
  }
  if (step === 2) {
    return (
      Boolean(v.ReceivedBy?.trim()) &&
      Boolean(v.IDNo?.trim()) &&
      Boolean(v.Contact?.trim())
    );
  }
  if (step === 3) {
    return Boolean(v.TinNo?.trim());
  }
  return false;
}

const canGoNextFormStep = computed(() => {
  if (activeFormStep.value >= totalFormSteps) return false;
  return isFormStepComplete(activeFormStep.value);
});

const canSubmitForm = computed(() => isFormStepComplete(3));

const payableDisplay = computed(() => {
  const fd = payableRecord.value?.fieldData as
    | Record<string, unknown>
    | undefined;
  if (!fd) return "";
  const vendor = String(
    fd.VendorName ?? fd["Vendor Name"] ?? fd.Vendor_Name ?? "",
  ).trim();
  const vendorId = String(
    fd.VendorID ?? fd["Vendor ID"] ?? fd.Vendor_Id ?? "",
  ).trim();
  if (vendorId && vendor) return `${vendorId} · ${vendor}`;
  return vendor || vendorId || form.value.TransRef || "";
});

async function tryVendorAuth() {
  const vendorUser = import.meta.env.VITE_FILEMAKER_VENDOR_USER;
  const vendorPass = import.meta.env.VITE_FILEMAKER_VENDOR_PASSWORD;
  const mainUser = import.meta.env.VITE_FILEMAKER_USER;
  const mainPass = import.meta.env.VITE_FILEMAKER_PASSWORD;
  const user = vendorUser ?? mainUser;
  const pass = vendorPass ?? mainPass;
  if (user && pass) {
    connecting.value = true;
    await login({ username: user, password: pass });
    connecting.value = false;
  }
}

function checkMobile() {
  const ua = navigator.userAgent;
  const mobileKeywords =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
  isMobile.value = mobileKeywords.test(ua) || window.innerWidth < 768;
}

async function loadCollections() {
  if (!isConnected.value) return;
  const { data } = await findRecordsWithIds<
    ChequeCollectionFieldData | Record<string, unknown>
  >(LAYOUTS.CHEQUE_COLLECTION, { limit: 1000 });
  collectionList.value = data ?? [];
}

const collectedTransRefs = computed(() => {
  const set = new Set<string>();
  for (const r of collectionList.value) {
    const fd = r.fieldData as Record<string, unknown>;
    const ref = fd?.TransRef ?? fd?.["TransRef"];
    if (ref != null && String(ref).trim()) set.add(String(ref).trim());
  }
  return set;
});

function getPayableStatus(fd: Record<string, unknown>): string {
  return String(fd?.Status ?? fd?.status ?? "").trim();
}

async function onTransRefSubmit() {
  const transRef = transRefInput.value.trim().toUpperCase();
  if (!transRef || !isConnected.value) return;
  transRefInput.value = transRef;
  loadingPayable.value = true;
  lookupError.value = "";
  const loadingOverlay = useLoadingOverlayStore();
  loadingOverlay.show("Looking up…");
  try {
    const { data } = await findRecordsByQueryWithIds<
      PayablesMainFieldData | Record<string, unknown>
    >(LAYOUTS.PAYABLES_MAIN, { TransRef: transRef }, 1);
    const record = data?.[0];
    if (!record) {
      lookupError.value = "TransRef not found. Please check and try again.";
      return;
    }
    const fd = record.fieldData as Record<string, unknown>;
    if (getPayableStatus(fd) !== "Approved") {
      lookupError.value =
        "This payable is not yet approved for cheque collection.";
      return;
    }
    const transRefFromMain = String(fd.TransRef ?? fd["TransRef"] ?? "").trim();
    if (!transRefFromMain) {
      lookupError.value =
        "This entry is missing its TransRef. Please contact the finance team.";
      return;
    }
    await loadCollections();
    if (collectedTransRefs.value.has(transRefFromMain)) {
      lookupError.value =
        "This TransRef has already been recorded as collected.";
      return;
    }
    payableRecord.value = record;
    mainRecordId.value = record.recordId ? String(record.recordId) : null;
    transRefValidated.value = true;
    codeInput.value = "";
    lookupError.value = "";
  } finally {
    loadingPayable.value = false;
    loadingOverlay.hide();
  }
}

function backToTransRef() {
  transRefValidated.value = false;
  codeInput.value = "";
  lookupError.value = "";
  payableRecord.value = null;
  mainRecordId.value = null;
}

function getCameraErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return "Could not start camera. Please enter the code manually.";
  const msg = err.message?.toLowerCase() ?? "";
  const name = (err as { name?: string }).name ?? "";
  if (!window.isSecureContext || window.location.protocol !== "https:") {
    return "Camera requires HTTPS. Use this page over https:// or enter the code manually.";
  }
  if (msg.includes("permission") || name === "NotAllowedError" || msg.includes("denied")) {
    return "Camera access was denied. Allow camera in your browser settings, then try again.";
  }
  if (name === "NotFoundError" || msg.includes("not found")) {
    return "No camera found. Please enter the code manually.";
  }
  if (name === "NotReadableError" || msg.includes("in use")) {
    return "Camera is in use by another app. Close it and try again, or enter the code manually.";
  }
  if (name === "SecurityError" || msg.includes("secure")) {
    return "Camera requires a secure connection (HTTPS). Please enter the code manually.";
  }
  return err.message || "Could not start camera. Please enter the code manually.";
}

async function openQrScanner() {
  if (!window.isSecureContext) {
    toast.error(
      "Camera requires HTTPS. Open this page using https:// (not http://) to scan, or enter the code manually.",
    );
    return;
  }
  qrScannerOpen.value = true;
  await nextTick();
  const el = document.getElementById("qr-reader");
  if (!el) return;
  try {
    html5QrCodeInstance = new Html5Qrcode("qr-reader");
    await html5QrCodeInstance.start(
      { facingMode: "environment" },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      (decodedText) => {
        codeInput.value = decodedText.trim().toUpperCase();
        closeQrScanner();
      },
      () => {},
    );
  } catch (err) {
    toast.error(getCameraErrorMessage(err));
    qrScannerOpen.value = false;
  }
}

async function closeQrScanner() {
  if (html5QrCodeInstance?.isScanning) {
    try {
      await html5QrCodeInstance.stop();
    } catch {
      // ignore stop errors
    }
    html5QrCodeInstance.clear();
    html5QrCodeInstance = null;
  }
  qrScannerOpen.value = false;
}

onUnmounted(() => {
  if (html5QrCodeInstance?.isScanning) {
    html5QrCodeInstance.stop().catch(() => {});
    html5QrCodeInstance.clear();
    html5QrCodeInstance = null;
  }
});

async function onCodeSubmit() {
  const code = codeInput.value.trim().toUpperCase();
  if (!code || !isConnected.value || !payableRecord.value) return;
  loadingPayable.value = true;
  lookupError.value = "";
  const loadingOverlay = useLoadingOverlayStore();
  loadingOverlay.show("Verifying…");
  try {
    const fd = payableRecord.value.fieldData as Record<string, unknown>;
    const recordCode = String(fd.Code ?? fd["Code"] ?? "")
      .trim()
      .toUpperCase();
    if (recordCode !== code) {
      lookupError.value = "Code does not match. Please check with the officer.";
      return;
    }
    const transRefFromMain = String(fd.TransRef ?? fd["TransRef"] ?? "").trim();
    const vendorName = String(
      fd.VendorName ?? fd["Vendor Name"] ?? fd.Vendor_Name ?? "",
    ).trim();
    const total = fd.Total ?? fd.total ?? fd["Total"];
    const amount =
      typeof total === "number"
        ? total
        : total != null && total !== ""
          ? parseFloat(String(total))
          : undefined;
    form.value = {
      TransRef: transRefFromMain,
      BankName: String(fd.BankName ?? fd["Bank Name"] ?? "").trim(),
      ChequeNo: String(fd.ChequeNo ?? fd["Cheque No"] ?? "").trim(),
      Amount: amount != null && !Number.isNaN(amount) ? amount : "",
      ChequePayee: vendorName,
      ReceivedBy: "",
      IDNo: "",
      Contact: "",
      TinNo: "",
      CollectionDate: defaultCollectionDate(),
    };
    payableFound.value = true;
    activeFormStep.value = 1;
  } finally {
    loadingPayable.value = false;
    loadingOverlay.hide();
  }
}

function resetFlow() {
  transRefInput.value = "";
  codeInput.value = "";
  transRefValidated.value = false;
  lookupError.value = "";
  payableFound.value = false;
  activeFormStep.value = 1;
  payableRecord.value = null;
  mainRecordId.value = null;
}

function goBackFormStep() {
  if (activeFormStep.value === 1) {
    resetFlow();
  } else if (activeFormStep.value === 2) {
    activeFormStep.value = 1;
  } else {
    activeFormStep.value = 2;
  }
}

function goNextFormStep() {
  if (activeFormStep.value === 1) {
    activeFormStep.value = 2;
  } else if (activeFormStep.value === 2) {
    activeFormStep.value = 3;
  }
}

async function onSubmit() {
  if (saving.value || !isConnected.value) return;
  const required = [
    { val: form.value.ReceivedBy?.trim(), name: "Received By" },
    { val: form.value.BankName?.trim(), name: "Bank Name" },
    { val: form.value.ChequeNo?.trim(), name: "Cheque No" },
    { val: form.value.IDNo?.trim(), name: "ID No" },
    { val: form.value.Contact?.trim(), name: "Contact" },
    { val: form.value.TinNo?.trim(), name: "Tin No" },
  ];
  const missing = required.find((r) => !r.val);
  if (missing) {
    toast.error(`${missing.name} is required.`);
    return;
  }
  saving.value = true;
  const loadingOverlay = useLoadingOverlayStore();
  loadingOverlay.show("Submitting…", "Please don't navigate away");
  try {
    const amountNum =
      form.value.Amount === ""
        ? undefined
        : typeof form.value.Amount === "number"
          ? form.value.Amount
          : parseFloat(String(form.value.Amount));
    const fieldData: ChequeCollectionFieldData = {
      TransRef: form.value.TransRef?.trim() || undefined,
      BankName: form.value.BankName?.trim() || undefined,
      ChequeNo: form.value.ChequeNo?.trim() || undefined,
      Amount: amountNum,
      ChequePayee: form.value.ChequePayee?.trim() || undefined,
      ReceivedBy: form.value.ReceivedBy?.trim(),
      IDNo: form.value.IDNo?.trim() || undefined,
      Contact: form.value.Contact?.trim() || undefined,
      TinNo: form.value.TinNo?.trim() || undefined,
      CollectionDate: formatDateForFileMaker(form.value.CollectionDate),
      IssuedBy: "Vendor (self-service)",
    };
    const { error } = await createRecord(LAYOUTS.CHEQUE_COLLECTION, fieldData);
    if (error) {
      toast.error(error);
      return;
    }
    const transRef = form.value.TransRef?.trim();
    if (transRef && mainRecordId.value) {
      await updateRecord(LAYOUTS.PAYABLES_MAIN, mainRecordId.value, {
        ChequeIssued: "Yes",
        ChequeIssuedDate: formatDateForFileMaker(form.value.CollectionDate),
        BankName: form.value.BankName?.trim(),
        ChequeNo: form.value.ChequeNo?.trim(),
      });
    }
    toast.success("Collection recorded successfully.");
    resetFlow();
  } finally {
    saving.value = false;
    loadingOverlay.hide();
  }
}

onMounted(async () => {
  checkMobile();
  if (!isConnected.value) {
    await tryVendorAuth();
  }
  await documentSettings.loadFromFileMaker();
});
</script>

<style scoped>
.vendor-collect__bg {
  background: linear-gradient(
    180deg,
    var(--color-bg) 0%,
    rgba(15, 23, 42, 0.98) 50%,
    var(--color-bg) 100%
  );
}

/* Slide transition between steps on mobile */
.vendor-collect-slide-enter-active,
.vendor-collect-slide-leave-active {
  transition:
    opacity 180ms var(--ease),
    transform 220ms var(--ease);
}

.vendor-collect-slide-enter-from,
.vendor-collect-slide-leave-to {
  opacity: 0;
  transform: translateX(22px);
}

/* QR Scanner modal */
.vendor-collect-modal-enter-active,
.vendor-collect-modal-leave-active {
  transition: opacity 0.2s ease;
}
.vendor-collect-modal-enter-from,
.vendor-collect-modal-leave-to {
  opacity: 0;
}

.vendor-collect__qr-modal #qr-reader {
  width: 100%;
  min-height: 280px;
}
.vendor-collect__qr-modal :deep(#qr-reader video) {
  border-radius: 12px;
}

.vendor-collect-slide-enter-to,
.vendor-collect-slide-leave-from {
  opacity: 1;
  transform: translateX(0);
}

/* Scroll areas: reserve space for scrollbar so it doesn't hide under form content */
.vendor-collect__scroll-area {
  scrollbar-gutter: stable;
  padding-inline-end: 0.25rem; /* Extra space when scrollbar-gutter not supported */
}

.vendor-collect__scroll-area::-webkit-scrollbar {
  width: 10px;
}

.vendor-collect__scroll-area::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  margin: 4px 2px;
}

.vendor-collect__scroll-area::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.25);
  border-radius: 5px;
  border: 2px solid transparent;
  background-clip: padding-box;
}

.vendor-collect__scroll-area::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.35);
  background-clip: padding-box;
}

.vendor-collect__title {
  font-family:
    -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui,
    sans-serif;
  letter-spacing: -0.02em;
}

.vendor-collect__subtitle {
  font-family:
    -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui,
    sans-serif;
}

/* Step 1 TransRef field */
.vendor-collect__input-group {
  display: block;
}

.vendor-collect__input-wrap {
  display: block;
  min-height: 52px;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 14px;
  box-shadow:
    0 2px 12px rgba(0, 0, 0, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background-color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.vendor-collect__input-wrap:focus-within {
  border-color: rgba(0, 122, 255, 0.5);
  box-shadow: 0 0 0 3px rgba(0, 122, 255, 0.15);
  background: rgba(255, 255, 255, 0.08);
}

.vendor-collect__input {
  display: block;
  width: 100%;
  min-height: 28px;
  padding: 0;
  font-size: 16px;
  line-height: 1.4;
  color: var(--color-text);
  background: transparent;
  border: none;
  outline: none;
  -webkit-appearance: none;
  appearance: none;
}

.vendor-collect__input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

.vendor-collect__input--uppercase {
  text-transform: uppercase;
}

.vendor-collect__cta {
  background: linear-gradient(135deg, #007aff 0%, #0056b3 100%);
  box-shadow: 0 8px 24px rgba(0, 122, 255, 0.35);
}

.vendor-collect__cta:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
}

.vendor-collect__payable-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.vendor-collect__card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.vendor-collect__section-title {
  background: rgba(0, 0, 0, 0.15);
}

/* Mobile-friendly text fields: 48px min-height, clear borders, focus states */
.vendor-collect__field-input {
  display: block;
  width: 100%;
  min-height: 48px;
  padding: 12px 14px;
  font-size: 16px; /* 16px+ prevents iOS zoom on focus */
  line-height: 1.4;
  color: var(--color-text);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  outline: none;
  -webkit-appearance: none;
  appearance: none;
  transition:
    border-color 0.2s,
    box-shadow 0.2s,
    background-color 0.2s;
  -webkit-tap-highlight-color: transparent;
}

.vendor-collect__field-input::placeholder {
  color: var(--color-text-muted);
  opacity: 0.6;
}

/* Readonly fields: muted, no focus effect */
.vendor-collect__field-input--readonly {
  background: rgba(255, 255, 255, 0.02);
  border-color: rgba(255, 255, 255, 0.06);
  color: var(--color-text-muted);
  cursor: default;
}

.vendor-collect__field-input--display {
  display: flex;
  align-items: center;
  color: var(--color-text);
}

/* Editable: clearer bg, focus ring */
.vendor-collect__field-input--editable {
  background: rgba(255, 255, 255, 0.06);
}

.vendor-collect__field-input--editable:focus {
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
  background: rgba(255, 255, 255, 0.08);
}

.vendor-collect__field-input--editable:active {
  background: rgba(255, 255, 255, 0.08);
}

/* Date input: align native picker styling */
.vendor-collect__field-input--date {
  color-scheme: dark;
}

.vendor-collect__field-input--date::-webkit-calendar-picker-indicator {
  opacity: 0.6;
  cursor: pointer;
}

.vendor-collect__btn-secondary {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--color-text-muted);
}

.vendor-collect__btn-secondary:active {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text);
}

.vendor-collect__btn-primary {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);
}

.vendor-collect__btn-primary:active:not(:disabled) {
  transform: scale(0.98);
}

/* 100svh = smallest viewport = always fits when mobile address bar visible */
.vendor-collect__root {
  min-height: 100vh;
  min-height: 100svh;
  height: 100%;
}

.vendor-collect__desktop {
  min-height: 100vh;
  min-height: 100svh;
}

.vendor-collect__desktop-card {
  animation: vendor-collect-fade-in 0.35s ease-out;
}

.vendor-collect__desktop-icon {
  animation: vendor-collect-scale-in 0.4s ease-out 0.1s both;
}

@keyframes vendor-collect-fade-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes vendor-collect-scale-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
